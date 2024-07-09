document.addEventListener('DOMContentLoaded', function () {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-header">
                <h2 id="spellName"></h2>
            </div>
            <div class="modal-body">
                <p><strong>Level:</strong> <span id="spellLevel"></span></p>
                <p><strong>School:</strong> <span id="spellSchool"></span></p>
                <p><strong>Casting Time:</strong> <span id="spellCastingTime"></span></p>
                <p><strong>Range:</strong> <span id="spellRange"></span></p>
                <p><strong>Duration:</strong> <span id="spellDuration"></span></p>
                <p><strong>Components:</strong> <span id="spellComponents"></span></p>
                <p><strong>Material:</strong> <span id="spellMaterial"></span></p>
                <p><strong>Description:</strong> <span id="spellDescription"></span></p>
                <p><strong>Higher Level:</strong> <span id="spellHigherLevel"></span></p>
                <p><strong>Concentration:</strong> <span id="spellConcentration"></span></p>
                <p><strong>Ritual:</strong> <span id="spellRitual"></span></p>
                <p><strong>Attack Type:</strong> <span id="spellAttackType"></span></p>
                <p><strong>Damage Type:</strong> <span id="spellDamageType"></span></p>
                <p><strong>Damage at Slot Levels:</strong><span id="spellDamageAtSlotLevel"></span></p>
                <p><strong>Classes:</strong> <span id="spellClasses"></span></p>
                <p><strong>Subclasses:</strong> <span id="spellSubclasses"></span></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModalButton = modal.querySelector('.close');
    closeModalButton.addEventListener('click', closeModal);

    function formatDamageAtSlotLevels(damageAtSlotLevel) {
        if (!damageAtSlotLevel) return 'None';
        return Object.entries(damageAtSlotLevel).map(([level, damage]) => `Level ${level}: ${damage}`).join('<br>');
    }

    function openModal(spell) {
        document.getElementById('spellName').innerText = spell.name;
        document.getElementById('spellLevel').innerText = spell.level;
        document.getElementById('spellSchool').innerText = spell.school?.name || 'None';
        document.getElementById('spellCastingTime').innerText = spell.casting_time;
        document.getElementById('spellRange').innerText = spell.range;
        document.getElementById('spellDuration').innerText = spell.duration;
        document.getElementById('spellComponents').innerText = Array.isArray(spell.components) ? spell.components.join(', ') : 'None';
        document.getElementById('spellMaterial').innerText = spell.material || 'None';
        document.getElementById('spellDescription').innerText = Array.isArray(spell.desc) ? spell.desc.join(' ') : 'No description available.';
        document.getElementById('spellHigherLevel').innerText = Array.isArray(spell.higher_level) ? spell.higher_level.join(' ') : 'None';
        document.getElementById('spellConcentration').innerText = spell.concentration ? 'Yes' : 'No';
        document.getElementById('spellRitual').innerText = spell.ritual ? 'Yes' : 'No';
        document.getElementById('spellAttackType').innerText = spell.attack_type || 'None';
        document.getElementById('spellDamageType').innerText = spell.damage?.damage_type?.name || 'None';
        document.getElementById('spellDamageAtSlotLevel').innerHTML = formatDamageAtSlotLevels(spell.damage?.damage_at_slot_level);
        document.getElementById('spellClasses').innerText = Array.isArray(spell.classes) ? spell.classes.map(c => c.name).join(', ') : 'None';
        document.getElementById('spellSubclasses').innerText = Array.isArray(spell.subclasses) ? spell.subclasses.map(sc => sc.name).join(', ') : 'None';
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('spell-name')) {
            const spellName = event.target.innerText;
            const spell = window.spellCache.find(spell => spell.name === spellName);
            console.log('Opening modal for spell:', spell);
            openModal(spell);
        }
    });

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });
});
