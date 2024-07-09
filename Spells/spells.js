document.addEventListener('DOMContentLoaded', function () {
    const pagesContainer = document.getElementById('pages');
    let spellCache = [];

    // Commented out caching for now
    // if (localStorage.getItem('spellCache')) {
    //     spellCache = JSON.parse(localStorage.getItem('spellCache'));
    //     if (isCacheComplete(spellCache)) {
    //         createSpellTable(spellCache);
    //     } else {
    //         fetchSpellsFromAPI();
    //     }
    // } else {
    fetchSpellsFromAPI();
    // }

    async function fetchSpellsFromAPI() {
        const url = 'https://www.dnd5eapi.co/api/spells';

        // Show progress bar
        const bar = showLoadingBar();

        try {
            const response = await fetch(url);
            const data = await response.json();
            const totalSpells = data.results.length;
            let completedCalls = 0;

            const spellPromises = data.results.map((spell, index) => fetchIndividualSpell(spell.url, index, totalSpells, bar, () => {
                completedCalls++;
                updateLoadingBar(bar, (completedCalls / totalSpells) * 100);
            }));

            const detailedSpells = await Promise.all(spellPromises);

            spellCache = detailedSpells;
            // Commented out caching for now
            // localStorage.setItem('spellCache', JSON.stringify(spellCache));
            createSpellTable(detailedSpells);
        } catch (error) {
            console.error(error);
        } finally {
            // Hide progress bar
            hideLoadingBar();
        }
    }

    async function fetchIndividualSpell(url, index, totalSpells, bar, onComplete) {
        try {
            const response = await fetch(`https://www.dnd5eapi.co${url}`);
            const spellDetails = await response.json();
            onComplete();  // Update progress
            return {
                name: spellDetails.name,
                level: spellDetails.level,
                school: spellDetails.school.name,
                casting_time: spellDetails.casting_time,
                range: spellDetails.range,
                duration: spellDetails.duration
            };
        } catch (error) {
            console.error(error);
            onComplete();  // Ensure progress is updated even if there's an error
            return {
                name: 'Unknown',
                level: 'N/A',
                school: 'N/A',
                casting_time: 'N/A',
                range: 'N/A',
                duration: 'N/A'
            };
        }
    }

    function createSpellTable(spells) {
        pagesContainer.innerHTML = '';

        const newPage = document.createElement('div');
        newPage.classList.add('page');
        newPage.innerHTML = `
            <h2>Search Spells</h2>
            <input type="text" id="spellSearch" placeholder="Search spells">
            <table id="spellTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Level</th>
                        <th>School</th>
                        <th>Casting Time</th>
                        <th>Range</th>
                        <th>Duration</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        pagesContainer.appendChild(newPage);

        const tableBody = document.getElementById('spellTable').getElementsByTagName('tbody')[0];
        spells.forEach(spell => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${spell.name}</td>
                <td>${spell.level}</td>
                <td>${spell.school}</td>
                <td>${spell.casting_time}</td>
                <td>${spell.range}</td>
                <td>${spell.duration}</td>
                <td><button disabled>Add</button></td>
            `;
            tableBody.appendChild(row);
        });

        const searchInput = document.getElementById('spellSearch');
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const tableRows = tableBody.querySelectorAll('tr');
            tableRows.forEach(row => {
                const spellName = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
                row.style.display = spellName.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    function isCacheComplete(spellCache) {
        return spellCache.every(spell => spell.school && spell.casting_time && spell.range && spell.duration);
    }

    function showLoadingBar() {
        const loadingBar = document.getElementById('loadingBar');
        loadingBar.style.display = 'block';
        return new ldBar("#loadingBar");
    }

    function updateLoadingBar(bar, value) {
        bar.set(value); // Update the bar to the given value
    }

    function hideLoadingBar() {
        const loadingBar = document.getElementById('loadingBar');
        loadingBar.style.display = 'none';
    }
});

