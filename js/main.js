document.addEventListener('DOMContentLoaded', function () {
    const spellCardsContainer = document.getElementById('spellCardsContainer');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchSpells');
    const spellSlotsContainer = document.getElementById('spellSlotsContainer');
    let allSpells = []; // Store all spells after parsing

    // Create prepared filter button
    const preparedFilterButton = document.createElement('button');
    preparedFilterButton.textContent = 'Prepared Only';
    preparedFilterButton.classList.add('filter-button', 'prepared-filter-button');
    document.querySelector('.spell-filters').appendChild(preparedFilterButton);

    // Event Listeners
    fileInput.addEventListener('change', handleFileUpload);
    searchInput.addEventListener('input', filterSpells);
    preparedFilterButton.addEventListener('click', function () {
        preparedFilterButton.classList.toggle('active');
        filterSpells();
    });

    document.querySelector('.spell-filters').addEventListener('click', function(event) {
        if (event.target.classList.contains('level-filter')) {
            event.target.classList.toggle('active');
            filterSpells();
        }
    });

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                let spells = [];
                if (file.name.endsWith('.json') || file.name.endsWith('.spellbook')) {
                    try {
                        const data = JSON.parse(content);
                        spells = data.spells || [];
                        const spellSlots = data.spellSlots || {};
                        allSpells = spells; // Update the allSpells array
                        createSpellSlotInputs(spellSlots); // Ensure spell slots inputs are created
                        displaySpells(spells);
                        createFilterButtons(spells); // Create filter buttons based on spells
                        resetFilters(); // Reset any active filters after loading
                    } catch (err) {
                        console.error(`Error parsing JSON: ${err}`);
                        alert('Error parsing the spellbook file. Please ensure it is a valid .spellbook file.');
                        return;
                    }
                } else {
                    alert('Unsupported file format. Please upload a .spellbook file.');
                }
            };
            reader.readAsText(file);
        }
    }

    function resetFilters() {
        searchInput.value = ''; // Clear search box
        document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active')); // Remove active state from filter buttons
        filterSpells(); // Reapply filters
    }

    function displaySpells(spells) {
        spellCardsContainer.innerHTML = '';
        spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)); // Sort by level, then name
        spells.forEach(spell => {
            const card = createSpellCard(spell);
            spellCardsContainer.appendChild(card);
        });
    }

    function filterSpells() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeLevels = Array.from(document.querySelectorAll('.filter-button.level-filter'))
            .filter(button => button.classList.contains('active'))
            .map(button => parseInt(button.dataset.level));

        const preparedOnly = preparedFilterButton.classList.contains('active');

        const filteredSpells = allSpells.filter(spell => {
            const matchesSearch = spell.name.toLowerCase().includes(searchTerm);
            const matchesLevel = activeLevels.length === 0 || activeLevels.includes(spell.level);
            const matchesPrepared = !preparedOnly || spell.prepared;
            return matchesSearch && matchesLevel && matchesPrepared;
        });

        displaySpells(filteredSpells);
    }

    function createSpellCard(spell) {
        const card = document.createElement('div');
        card.classList.add('spell-card');
        card.innerHTML = `
            <h3 class="spell-title">${spell.name}</h3>
            <p><strong>Level:</strong> ${spell.level}</p>
            <p><strong>School:</strong> ${spell.school}</p>
            <p><strong>Casting Time:</strong> ${spell.casting_time}</p>
            <p><strong>Range:</strong> ${spell.range}</p>
            <p><strong>Duration:</strong> ${spell.duration}</p>
            <p><strong>Components:</strong> ${spell.components}</p>
            <p><strong>Material:</strong> ${spell.material}</p>
            <p><strong>Description:</strong> ${spell.desc}</p>
            ${spell.higher_level ? `<p><strong>Higher Level:</strong> ${spell.higher_level}</p>` : ''}
            <p><strong>Concentration:</strong> ${spell.concentration}</p>
            <p><strong>Ritual:</strong> ${spell.ritual}</p>
            ${spell.attack_type ? `<p><strong>Attack Type:</strong> ${spell.attack_type}</p>` : ''}
            ${spell.damage_type ? `<p><strong>Damage Type:</strong> ${spell.damage_type}</p>` : ''}
            ${spell.damage_at_slot_levels ? `<p><strong>Damage at Slot Levels:</strong> ${spell.damage_at_slot_levels}</p>` : ''}
            <p><strong>Classes:</strong> ${spell.classes}</p>
            ${spell.subclasses ? `<p><strong>Subclasses:</strong> ${spell.subclasses}</p>` : ''}
        `;

        if (spell.prepared) {
            const preparedIcon = document.createElement('span');
            preparedIcon.classList.add('prepared-icon');
            preparedIcon.innerHTML = '&#9733;'; // Star icon
            preparedIcon.title = 'Prepared Spell';
            card.appendChild(preparedIcon);
        }

        return card;
    }

    function createSpellSlotInputs(spellSlots = {}) {
        spellSlotsContainer.innerHTML = ''; // Clear previous spell slots

        const slotsRow = document.createElement('div');
        slotsRow.classList.add('spell-slots-row');

        for (let level = 1; level <= 9; level++) {
            const numSlots = spellSlots[`level${level}`] || 0;
            if (numSlots > 0) { // Only display levels with spell slots
                const slotDiv = document.createElement('span');
                slotDiv.classList.add('spell-slot');
                const label = document.createElement('label');
                label.textContent = `Lvl ${level}: `;

                // Create checkboxes in a row
                const checkboxesContainer = document.createElement('span');
                checkboxesContainer.classList.add('checkboxes-container', 'checkbox-round');

                for (let i = 0; i < numSlots; i++) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('spell-slot-checkbox');
                    checkbox.dataset.level = level;
                    checkbox.dataset.index = i;

                    // Initially disable all checkboxes except the first one
                    if (i !== 0) {
                        checkbox.disabled = true;
                    }

                    checkbox.addEventListener('change', function () {
                        const index = parseInt(checkbox.dataset.index, 10);
                        const checkboxes = checkboxesContainer.querySelectorAll('.spell-slot-checkbox');

                        if (checkbox.checked) {
                            // Enable the next checkbox if it exists
                            if (checkboxes[index + 1]) {
                                checkboxes[index + 1].disabled = false;
                            }
                        } else {
                            // Uncheck and disable all following checkboxes
                            for (let j = index + 1; j < checkboxes.length; j++) {
                                checkboxes[j].checked = false;
                                checkboxes[j].disabled = true;
                            }
                        }
                    });

                    checkboxesContainer.appendChild(checkbox);
                }

                slotDiv.appendChild(label);
                slotDiv.appendChild(checkboxesContainer);
                slotsRow.appendChild(slotDiv);
            }
        }

        spellSlotsContainer.appendChild(slotsRow);

        // Create a reset button to clear checkboxes
        const resetSlotsButton = document.createElement('button');
        resetSlotsButton.textContent = 'Reset Slots';
        resetSlotsButton.classList.add('filter-button');
        resetSlotsButton.addEventListener('click', function () {
            const checkboxes = document.querySelectorAll('.spell-slot-checkbox');
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = false;
                checkbox.disabled = index !== 0;
            });
        });

        spellSlotsContainer.appendChild(resetSlotsButton);
    }

    function createFilterButtons(spells) {
        // Remove existing level filter buttons
        document.querySelectorAll('.filter-button.level-filter').forEach(button => button.remove());

        // Create level filter buttons based on available spells
        const levels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);
        const spellFiltersContainer = document.querySelector('.spell-filters');

        levels.forEach(level => {
            const levelButton = document.createElement('button');
            levelButton.textContent = `Level ${level}`;
            levelButton.classList.add('filter-button', 'level-filter');
            levelButton.dataset.level = level;
            spellFiltersContainer.insertBefore(levelButton, preparedFilterButton);
        });
    }
});
