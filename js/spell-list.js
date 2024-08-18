document.addEventListener('DOMContentLoaded', function () {
    const spellList = document.getElementById('spellList');
    const resetButton = document.getElementById('resetButton');
    const exportJsonButton = document.getElementById('exportJson');
    const spellListNameInput = document.getElementById('spellListName');

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
        const jsonContent = JSON.stringify(spells, null, 2);
        const spellListName = spellListNameInput.value.trim() || 'spellbook'; // Default to 'spellbook' if no name is provided
        downloadFile(`${spellListName}_spellbook.json`, jsonContent);
    });

    function addSpellToList(spell) {
        const spellItem = document.createElement('li');
        spellItem.innerHTML = `
            <span>${spell.name}</span>
            <button class="remove-spell-button">Remove</button>
        `;
        spellItem.dataset.spell = JSON.stringify(spell); // Store the full spell details in the element's data
        spellList.appendChild(spellItem);
    }

    function getSelectedSpells() {
        return Array.from(spellList.querySelectorAll('li')).map(li => JSON.parse(li.dataset.spell));
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

