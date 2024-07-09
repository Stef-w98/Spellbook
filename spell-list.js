document.addEventListener('DOMContentLoaded', function () {
    const spellList = document.getElementById('spellList');
    const resetButton = document.getElementById('resetButton');

    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('add-spell-button')) {
            const spellName = event.target.dataset.spellName;
            addSpellToList(spellName);
        }

        if (event.target && event.target.classList.contains('remove-spell-button')) {
            const spellItem = event.target.parentElement;
            spellList.removeChild(spellItem);
        }
    });

    resetButton.addEventListener('click', function () {
        spellList.innerHTML = '';
    });

    function addSpellToList(spellName) {
        const spellItem = document.createElement('li');
        spellItem.innerHTML = `
            <span>${spellName}</span>
            <button class="remove-spell-button">Remove</button>
        `;
        spellList.appendChild(spellItem);
    }
});
