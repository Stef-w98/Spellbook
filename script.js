document.addEventListener('DOMContentLoaded', function(){
    var pages = document.getElementsByClassName('page');
    for(var i = 0; i < pages.length; i++)
    {
        var page = pages[i];
        if (i % 2 === 0)
        {
            page.style.zIndex = (pages.length - i);
        }
    }

    for(var i = 0; i < pages.length; i++)
    {
        pages[i].pageNum = i + 1;
        pages[i].onclick=function()
        {
            if (this.pageNum % 2 === 0)
            {
                this.classList.remove('flipped');
                this.previousElementSibling.classList.remove('flipped');
            }
            else
            {
                this.classList.add('flipped');
                this.nextElementSibling.classList.add('flipped');
            }
        }
    }

    // Function to load spells from the .md file
    function loadSpells() {
        fetch('/mnt/data/spells.md')
            .then(response => response.text())
            .then(data => {
                const spells = parseSpells(data);
                insertSpellsIntoPages(spells);
            });
    }

    // Function to parse spells from the markdown content
    function parseSpells(markdown) {
        const sections = markdown.split('\n\n');
        const spells = {};
        let currentLevel = '';

        sections.forEach(section => {
            const lines = section.split('\n');
            lines.forEach(line => {
                if (line.startsWith('#')) {
                    currentLevel = line.substring(1).trim();
                    spells[currentLevel] = [];
                } else if (line.startsWith('-')) {
                    const spell = line.substring(1).trim();
                    spells[currentLevel].push(spell);
                }
            });
        });

        return spells;
    }

    // Function to insert spells into book pages
    function insertSpellsIntoPages(spells) {
        const pagesContainer = document.getElementById('pages');
        pagesContainer.innerHTML = ''; // Clear existing pages

        Object.keys(spells).forEach(level => {
            const levelHeader = `<div class="page"><h2>${level}</h2></div>`;
            pagesContainer.innerHTML += levelHeader;

            spells[level].forEach(spell => {
                const spellPage = `<div class="page"><p>${spell}</p></div>`;
                pagesContainer.innerHTML += spellPage;
            });
        });

        // Reinitialize the book after adding new pages
        var newPages = document.getElementsByClassName('page');
        for (var i = 0; i < newPages.length; i++) {
            var page = newPages[i];
            if (i % 2 === 0) {
                page.style.zIndex = (newPages.length - i);
            }
        }

        for (var i = 0; i < newPages.length; i++) {
            newPages[i].pageNum = i + 1;
            newPages[i].onclick = function () {
                if (this.pageNum % 2 === 0) {
                    this.classList.remove('flipped');
                    this.previousElementSibling.classList.remove('flipped');
                } else {
                    this.classList.add('flipped');
                    this.nextElementSibling.classList.add('flipped');
                }
            }
        }
    }

    // Load spells when the page is loaded
    loadSpells();
});
