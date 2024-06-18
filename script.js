document.addEventListener('DOMContentLoaded', function () {
    var pagesContainer = document.getElementById('pages');

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                const spells = parseSpells(content);
                insertSpellsIntoPages(spells);
            };
            reader.readAsText(file);
        }
    }

    function parseSpells(markdown) {
        const spells = [];
        const spellSections = markdown.split('#### ');

        spellSections.forEach(section => {
            if (section.trim()) {
                const spell = '#### ' + section.trim();
                spells.push(spell);
            }
        });

        return spells;
    }

    function formatSpell(spell) {
        const formatted = spell
            .replace(/#### (.*)/g, '<h2 class="spell-title">$1</h2>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/___/g, '<hr class="spell-divider">')
            .replace(/- \*\*([^*]+)\*\*: (.*)/g, '<p class="spell-description"><strong>$1:</strong> $2</p>')
            .replace(/---/g, '<hr class="spell-divider">')
            .replace(/- ([^*]+): (.*)/g, '<p class="spell-description"><strong>$1:</strong> $2</p>');
        return formatted;
    }

    function insertSpellsIntoPages(spells) {
        pagesContainer.innerHTML = ''; // Clear existing pages

        // Add front cover
        pagesContainer.innerHTML += `
            <div class="page cover front-cover">
                <h1>Spellbook</h1>
            </div>`;

        let currentPage = createNewPage();
        let spellCount = 0;

        spells.forEach(spell => {
            const formattedSpell = formatSpell(spell);
            const spellElement = document.createElement('div');
            spellElement.classList.add('spell');
            spellElement.innerHTML = formattedSpell;

            pagesContainer.appendChild(spellElement);
            const spellHeight = spellElement.offsetHeight;
            pagesContainer.removeChild(spellElement);

            if (spellCount < 2 && (currentPage.offsetHeight + spellHeight) <= pagesContainer.offsetHeight) {
                currentPage.querySelector('.spell-content').innerHTML += formattedSpell + '<br><br>';
                spellCount++;
            } else {
                currentPage = createNewPage();
                currentPage.querySelector('.spell-content').innerHTML += formattedSpell + '<br><br>';
                spellCount = 1;
            }
        });

        // Add back cover
        pagesContainer.innerHTML += `
            <div class="page cover back-cover"></div>`;

        initializeBook();
    }

    function createNewPage() {
        const newPage = document.createElement('div');
        newPage.classList.add('page');
        newPage.innerHTML = '<div class="spell-content"></div>';
        pagesContainer.appendChild(newPage);
        return newPage;
    }

    function initializeBook() {
        var pages = document.getElementsByClassName('page');
        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            if (i % 2 === 0) {
                page.style.zIndex = (pages.length - i);
            }
        }

        for (var i = 0; i < pages.length; i++) {
            pages[i].pageNum = i + 1;
            pages[i].onclick = function () {
                if (this.pageNum % 2 === 0) {
                    this.classList.remove('flipped');
                    this.previousElementSibling.classList.remove('flipped');
                } else {
                    this.classList.add('flipped');
                    if (this.nextElementSibling) {
                        this.nextElementSibling.classList.add('flipped');
                    }
                }
                updateVisibility();
            }
        }

        // Initial call to update visibility for the first page
        updateVisibility();
    }

    function updateVisibility() {
        var pages = document.getElementsByClassName('page');
        for (var i = 0; i < pages.length; i++) {
            if ((i % 2 === 0 && pages[i].classList.contains('flipped')) ||
                (i % 2 !== 0 && !pages[i].classList.contains('flipped'))) {
                pages[i].classList.add('show');
            } else {
                pages[i].classList.remove('show');
            }
        }
    }

    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
});
