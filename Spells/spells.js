document.addEventListener('DOMContentLoaded', function () {
    const pagesContainer = document.getElementById('pages');
    let spellCache = [];

    if (localStorage.getItem('spellCache')) {
        spellCache = JSON.parse(localStorage.getItem('spellCache'));
        if (isCacheComplete(spellCache)) {
            createSpellTable(spellCache);
        } else {
            fetchSpellsFromAPI();
        }
    } else {
        fetchSpellsFromAPI();
    }

    async function fetchSpellsFromAPI() {
        const url = 'https://www.dnd5eapi.co/api/spells'; // Replace with actual API endpoint

        // Show loading icon
        showLoadingIcon();

        try {
            const response = await fetch(url);
            const data = await response.json();
            const spellPromises = data.results.map(spell => fetchIndividualSpell(spell.url));
            const detailedSpells = await Promise.all(spellPromises);

            spellCache = detailedSpells;
            localStorage.setItem('spellCache', JSON.stringify(spellCache));
            createSpellTable(detailedSpells);
        } catch (error) {
            console.error(error);
        } finally {
            // Hide loading icon
            hideLoadingIcon();
        }
    }

    async function fetchIndividualSpell(url) {
        try {
            const response = await fetch(`https://www.dnd5eapi.co${url}`);
            const spellDetails = await response.json();
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

        // Add a new page with the searchable table
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

        // Populate table body with spells
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

        // Implement search functionality (optional)
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

    function showLoadingIcon() {
        const loadingIcon = document.createElement('img');
        loadingIcon.src = 'loading.gif';
        loadingIcon.id = 'loadingIcon';
        loadingIcon.style.position = 'fixed';
        loadingIcon.style.top = '50%';
        loadingIcon.style.left = '50%';
        loadingIcon.style.transform = 'translate(-50%, -50%)';
        loadingIcon.style.width = '50px'; // Set the width of the loading icon
        loadingIcon.style.height = '50px'; // Set the height of the loading icon
        document.body.appendChild(loadingIcon);
    }

    function hideLoadingIcon() {
        const loadingIcon = document.getElementById('loadingIcon');
        if (loadingIcon) {
            loadingIcon.remove();
        }
    }
});
