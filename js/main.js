document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const spellCardsContainer = document.getElementById('spellCardsContainer');

    fileInput.addEventListener('change', handleFileUpload);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            console.log(`File selected: ${file.name}`);
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                console.log(`File content loaded`);
                let spells = [];
                if (file.name.endsWith('.json')) {
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

    function displaySpells(spells, isMarkdown = false) {
        spellCardsContainer.innerHTML = '';
        spells.forEach(spell => {
            const card = createSpellCard(spell);
            spellCardsContainer.appendChild(card);
        });
        console.log(`Displayed ${spells.length} spells`);
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
