document.addEventListener('DOMContentLoaded', function () {
    const spellList = document.getElementById('spellList');
    const resetButton = document.getElementById('resetButton');
    const exportJsonButton = document.getElementById('exportJson');
    const spellListNameInput = document.getElementById('spellListName');
    const spellSlotsContainer = document.getElementById('spellSlotsContainer');

    // Create spell slot inputs for each level (1 to 9)
    createSpellSlotInputs();

    document.addEventListener('click', async function (event) {
        if (event.target && event.target.classList.contains('add-spell-button')) {
            const spellName = event.target.dataset.spellName;
            if (isSpellInList(spellName)) {
                alert('This spell is already in your list!');
                return; // Prevent adding the spell again
            }
            const spellDetails = await fetchSpellDetails(spellName); // Fetch full details
            if (spellDetails) {
                addSpellToList(spellDetails); // Pass the full details to add to the list
            }
        }

        if (event.target && event.target.classList.contains('remove-spell-button')) {
            const spellItem = event.target.parentElement;
            spellList.removeChild(spellItem);  // Remove the spell item from the list
        }
    });

    resetButton.addEventListener('click', function () {
        spellList.innerHTML = '';
    });

    exportJsonButton.addEventListener('click', function () {
        const spells = getSelectedSpells().map(spellToJson);
        const spellSlots = getSpellSlots(); // Collect spell slot information
        const jsonContent = JSON.stringify({ spells, spellSlots }, null, 2);
        const spellListName = spellListNameInput.value.trim() || 'spells'; // Fallback to 'spells' if no name is provided
        downloadFile(`${spellListName}.spellbook`, jsonContent); // Save as .spellbook extension
    });

    function createSpellSlotInputs() {
        const spellSlotsDiv = document.createElement('div');
        spellSlotsDiv.id = 'spellSlots';

        // Define the maximum spell slots per level
        const maxSpellSlots = {
            1: 4,
            2: 3,
            3: 3,
            4: 3,
            5: 3,
            6: 2,
            7: 2,
            8: 1,
            9: 1
        };

        for (let level = 1; level <= 9; level++) {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('spell-slot');
            slotDiv.innerHTML = `
                <label>Level ${level} Spell Slots: 
                    <input type="number" min="0" max="${maxSpellSlots[level]}" id="spellSlotLevel${level}" value="0">
                </label>
            `;
            spellSlotsDiv.appendChild(slotDiv);
        }
        spellSlotsContainer.appendChild(spellSlotsDiv);

        // Add event listeners to enforce max values
        for (let level = 1; level <= 9; level++) {
            const slotInput = document.getElementById(`spellSlotLevel${level}`);
            const maxSlots = maxSpellSlots[level];

            slotInput.addEventListener('input', function () {
                let value = parseInt(slotInput.value, 10) || 0;
                if (value > maxSlots) {
                    slotInput.value = maxSlots;
                } else if (value < 0) {
                    slotInput.value = 0;
                }
            });
        }
    }

    function getSpellSlots() {
        const spellSlots = {};
        for (let level = 1; level <= 9; level++) {
            const slotInput = document.getElementById(`spellSlotLevel${level}`);
            const maxSlots = parseInt(slotInput.max, 10); // Get the max allowed slots for this level
            let value = parseInt(slotInput.value, 10) || 0;

            // Ensure the value does not exceed the maximum
            if (value > maxSlots) {
                value = maxSlots;
                slotInput.value = maxSlots; // Update the input field to the max value
            }

            spellSlots[`level${level}`] = value;
        }
        return spellSlots;
    }

    function addSpellToList(spell) {
        const spellItem = document.createElement('li');
        spellItem.innerHTML = `
            <span>${spell.name}</span>
            <div>
                <input type="checkbox" id="prepared-${spell.name}" class="prepared-checkbox" data-spell-name="${spell.name}" />
                <label for="prepared-${spell.name}">Prepared</label>
            </div>
            <button class="remove-spell-button">Remove</button>
        `;
        spellItem.dataset.spell = JSON.stringify(spell); // Store the full spell details in the element's data
        spellList.appendChild(spellItem);
    }

    function getSelectedSpells() {
        return Array.from(spellList.querySelectorAll('li')).map(li => {
            const spell = JSON.parse(li.dataset.spell);
            spell.prepared = li.querySelector('.prepared-checkbox').checked;
            return spell;
        });
    }

    async function fetchSpellDetails(spellName) {
        const url = `https://www.dnd5eapi.co/api/spells/${spellName.toLowerCase().replace(/\s+/g, '-')}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch spell details for ${spellName}`);
            }
            const spellDetails = await response.json();

            // Ensure that the details are correctly formatted
            spellDetails.school = spellDetails.school?.name || 'Unknown';
            spellDetails.desc = spellDetails.desc?.join(' ') || '';
            spellDetails.higher_level = spellDetails.higher_level?.join(' ') || 'None';
            spellDetails.components = spellDetails.components?.join(', ') || 'None';
            spellDetails.material = spellDetails.material || 'None';
            spellDetails.damage_type = spellDetails.damage?.damage_type?.name || 'None';
            spellDetails.damage_at_slot_levels = formatDamageAtSlotLevels(spellDetails.damage?.damage_at_slot_level);
            spellDetails.classes = spellDetails.classes?.map(c => c.name).join(', ') || 'None';
            spellDetails.subclasses = spellDetails.subclasses?.map(sc => sc.name).join(', ') || 'None';

            return spellDetails;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    function spellToJson(spell) {
        return {
            name: spell.name,
            level: spell.level,
            school: spell.school,
            casting_time: spell.casting_time,
            range: spell.range,
            duration: spell.duration,
            components: spell.components,
            material: spell.material,
            desc: spell.desc,
            higher_level: spell.higher_level,
            concentration: spell.concentration ? 'Yes' : 'No',
            ritual: spell.ritual ? 'Yes' : 'No',
            attack_type: spell.attack_type || 'None',
            damage_type: spell.damage_type,
            damage_at_slot_levels: spell.damage_at_slot_levels || 'None',
            classes: spell.classes,
            subclasses: spell.subclasses,
            prepared: spell.prepared || false
        };
    }

    function formatDamageAtSlotLevels(damageAtSlotLevel) {
        if (!damageAtSlotLevel) return 'None';
        return Object.entries(damageAtSlotLevel).map(([level, damage]) => `Level ${level}: ${damage}`).join('\n');
    }

    function isSpellInList(spellName) {
        const spellItems = spellList.querySelectorAll('li span');
        return Array.from(spellItems).some(span => span.textContent === spellName);
    }

    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
});
