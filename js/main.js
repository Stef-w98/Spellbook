document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const spellCardsContainer = document.getElementById('spellCardsContainer');
    const searchInput = document.getElementById('searchSpells');
    const filterButtons = document.querySelectorAll('.filter-button');
    let allSpells = []; // Store all spells after parsing

    fileInput.addEventListener('change', handleFileUpload);
    searchInput.addEventListener('input', filterSpells);
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            button.classList.toggle('active');
            filterSpells();
        });
    });

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            console.log(`File selected: ${file.name}`);
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                console.log(`File content loaded`);
                let spells = [];
                if (file.name.endsWith('.json') || file.name.endsWith('.spellbook')) {
                    try {
                        spells = JSON.parse(content);
                        console.log(`JSON parsed successfully`);
                    } catch (err) {
                        console.error(`Error parsing JSON: ${err}`);
                    }
                }
                displaySpells(spells);
            };
            reader.readAsText(file);
        }
    }

    function displaySpells(spells) {
        spellCardsContainer.innerHTML = '';
        spells.sort((a, b) => a.level - b.level); // Sort by level, Cantrips first
        spells.forEach(spell => {
            const card = createSpellCard(spell);
            spellCardsContainer.appendChild(card);
        });
        console.log(`Displayed ${spells.length} spells`);
    }

    function filterSpells() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeLevels = Array.from(filterButtons)
            .filter(button => button.classList.contains('active'))
            .map(button => parseInt(button.dataset.level));

        const filteredSpells = allSpells.filter(spell => {
            const matchesSearch = spell.name.toLowerCase().includes(searchTerm);
            const matchesLevel = activeLevels.length === 0 || activeLevels.includes(spell.level);
            return matchesSearch && matchesLevel;
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
        <p><strong>Higher Level:</strong> ${spell.higher_level}</p>
        <p><strong>Concentration:</strong> ${spell.concentration}</p>
        <p><strong>Ritual:</strong> ${spell.ritual}</p>
        <p><strong>Attack Type:</strong> ${spell.attack_type}</p>
        <p><strong>Damage Type:</strong> ${spell.damage_type}</p>
        <p><strong>Damage at Slot Levels:</strong> ${spell.damage_at_slot_levels}</p>
        <p><strong>Classes:</strong> ${spell.classes}</p>
        <p><strong>Subclasses:</strong> ${spell.subclasses}</p>
    `;
        return card;
    }
});

