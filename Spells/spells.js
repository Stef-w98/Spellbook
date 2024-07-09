document.addEventListener('DOMContentLoaded', function () {
    const pagesContainer = document.getElementById('pages');
    let spellCache = [];

    if (localStorage.getItem('spellCache')) {
        spellCache = JSON.parse(localStorage.getItem('spellCache'));
        if (isCacheComplete(spellCache)) {
            createSpellTable(spellCache);
            hideLoadingBar();
        } else {
            fetchSpellsFromAPI();
        }
    } else {
        fetchSpellsFromAPI();
    }

    async function fetchSpellsFromAPI() {
        const url = 'https://www.dnd5eapi.co/api/spells';

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
            localStorage.setItem('spellCache', JSON.stringify(spellCache));
            createSpellTable(detailedSpells);
        } catch (error) {
            console.error(error);
        } finally {
            hideLoadingBar();
        }
    }

    async function fetchIndividualSpell(url, index, totalSpells, bar, onComplete) {
        try {
            const response = await fetch(`https://www.dnd5eapi.co${url}`);
            const spellDetails = await response.json();
            onComplete();
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
            onComplete();
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
                    <th data-column="name" class="sortable">Name <i class="sort-icon-up fas fa-sort-up"></i><i class="sort-icon-down fas fa-sort-down"></i></th>
                    <th data-column="level" class="sortable">Level <i class="sort-icon-up fas fa-sort-up"></i><i class="sort-icon-down fas fa-sort-down"></i></th>
                    <th data-column="school" class="sortable">School <i class="sort-icon-up fas fa-sort-up"></i><i class="sort-icon-down fas fa-sort-down"></i></th>
                    <th data-column="casting_time" class="sortable">Casting Time <i class="sort-icon-up fas fa-sort-up"></i><i class="sort-icon-down fas fa-sort-down"></i></th>
                    <th data-column="range" class="sortable">Range <i class="sort-icon-up fas fa-sort-up"></i><i class="sort-icon-down fas fa-sort-down"></i></th>
                    <th data-column="duration" class="sortable">Duration <i class="sort-icon-up fas fa-sort-up"></i><i class="sort-icon-down fas fa-sort-down"></i></th>
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
            <td><button class="add-spell-button" data-spell-name="${spell.name}">Add</button></td>
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

        document.querySelectorAll('#spellTable th.sortable').forEach(header => {
            header.addEventListener('click', function () {
                const column = this.getAttribute('data-column');
                const currentOrder = parseInt(this.dataset.order, 10) || -1;
                const newOrder = -currentOrder;
                this.dataset.order = newOrder;
                console.log(`Sorting by column: ${column}, current order: ${currentOrder}, new order: ${newOrder}`);
                const sortedSpells = spells.slice().sort((a, b) => {
                    if (a[column] < b[column]) return newOrder;
                    if (a[column] > b[column]) return -newOrder;
                    return 0;
                });
                console.log('Sorted Spells:', sortedSpells);
                refreshTableBody(sortedSpells);
                updateSortIcons(this, newOrder);
            });
        });
    }

    function refreshTableBody(spells) {
        const tableBody = document.getElementById('spellTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        spells.forEach(spell => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${spell.name}</td>
            <td>${spell.level}</td>
            <td>${spell.school}</td>
            <td>${spell.casting_time}</td>
            <td>${spell.range}</td>
            <td>${spell.duration}</td>
            <td><button class="add-spell-button" data-spell-name="${spell.name}">Add</button></td>
        `;
            tableBody.appendChild(row);
        });
    }

    function updateSortIcons(header, order) {
        document.querySelectorAll('#spellTable th').forEach(th => {
            th.classList.remove('sorted', 'asc', 'desc');
        });
        header.classList.add('sorted', order === 1 ? 'asc' : 'desc');
        console.log(`Updating icon for header: ${header.getAttribute('data-column')}, order: ${order}`);
    }

    function isCacheComplete(spellCache) {
        return spellCache && spellCache.length > 0;
    }

    function showLoadingBar() {
        const loadingBar = document.getElementById('loadingBar');
        loadingBar.style.display = 'block';
        return new ldBar("#loadingBar");
    }

    function updateLoadingBar(bar, value) {
        bar.set(value);
    }

    function hideLoadingBar() {
        const loadingBar = document.getElementById('loadingBar');
        loadingBar.style.display = 'none';
    }
});
