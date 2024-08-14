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
                } else if (file.name.endsWith('.md')) {
                    spells = parseMarkdown(content);
                    console.log(`Markdown parsed successfully`);
                }
                displaySpells(spells);
            };
            reader.readAsText(file);
        }
    }

    function parseMarkdown(markdown) {
        const spells = [];
        const spellSections = markdown.split('#### ');

        spellSections.forEach(section => {
            if (section.trim()) {
                const spell = convertMarkdownToSpellObject('#### ' + section.trim());
                spells.push(spell);
            }
        });

        console.log(`Parsed ${spells.length} spells from markdown`);
        return spells;
    }

    function displaySpells(spells, isMarkdown = false) {
        spellCardsContainer.innerHTML = '';
        spells.forEach(spell => {
            if (isMarkdown) {
                spell = parseMarkdownSpell(spell);
            }
            const card = createSpellCard(spell);
            spellCardsContainer.appendChild(card);
        });
        console.log(`Displayed ${spells.length} spells`);
    }

    function convertMarkdownToSpellObject(markdown) {
        const spell = {};
        const lines = markdown.split('\n');
        let isDescription = false;
        let currentSection = '';

        lines.forEach(line => {
            if (line.startsWith('#### ')) {
                spell.name = line.replace('#### ', '').trim() || 'Unknown Spell';
            } else if (line.includes('**Level:**')) {
                spell.level = line.replace('**Level:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**School:**')) {
                spell.school = line.replace('**School:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Casting Time:**')) {
                spell.casting_time = line.replace('**Casting Time:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Range:**')) {
                spell.range = line.replace('**Range:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Duration:**')) {
                spell.duration = line.replace('**Duration:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Components:**')) {
                spell.components = line.replace('**Components:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Material:**')) {
                spell.material = line.replace('**Material:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Description:**')) {
                spell.desc = line.replace('**Description:**', '').trim() || 'N/A';
                isDescription = true;
            } else if (line.includes('**Higher Level:**')) {
                spell.higher_level = line.replace('**Higher Level:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Concentration:**')) {
                spell.concentration = line.replace('**Concentration:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Ritual:**')) {
                spell.ritual = line.replace('**Ritual:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Attack Type:**')) {
                spell.attack_type = line.replace('**Attack Type:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Damage Type:**')) {
                spell.damage_type = line.replace('**Damage Type:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Damage at Slot Levels:**')) {
                currentSection = 'damage_at_slot_levels';
                spell[currentSection] = spell[currentSection] || '';
                spell[currentSection] += line.replace('**Damage at Slot Levels:**', '').trim();
                isDescription = false;
            } else if (line.includes('**Classes:**')) {
                spell.classes = line.replace('**Classes:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (line.includes('**Subclasses:**')) {
                spell.subclasses = line.replace('**Subclasses:**', '').trim() || 'N/A';
                isDescription = false;
            } else if (isDescription) {
                spell.desc += " " + line.trim();
            } else if (currentSection === 'damage_at_slot_levels') {
                spell[currentSection] += "\n" + line.trim();
            }
        });

        // Ensure all attributes are set
        for (const key in spell) {
            if (spell[key] === undefined || spell[key] === '') {
                spell[key] = 'N/A';
            }
        }

        return spell;
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

    function formatMultiLine(text) {
        if (!text || text === 'N/A') return 'N/A';
        return text.split('\n').map(line => line.trim()).join('<br>');
    }

});
