window.spellCache = [];

document.addEventListener('DOMContentLoaded', function () {
    const pagesContainer = document.getElementById('pages');

    // Clear local storage to avoid caching issues during development
    localStorage.removeItem('spellCache');

    if (localStorage.getItem('spellCache')) {
        window.spellCache = JSON.parse(localStorage.getItem('spellCache'));
        if (isCacheComplete(window.spellCache)) {
            createSpellTable(window.spellCache);
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
            const response = await fetch(url, { cache: 'no-store' });
            const data = await response.json();
            const totalSpells = data.results.length;
            let completedCalls = 0;

            const spellPromises = data.results.map((spell, index) => fetchIndividualSpell(spell.url, index, totalSpells, bar, () => {
                completedCalls++;
                updateLoadingBar(bar, (completedCalls / totalSpells) * 100);
            }));

            const detailedSpells = await Promise.all(spellPromises);

            console.log('Fetched detailed spells:', detailedSpells);

            window.spellCache = detailedSpells;
            localStorage.setItem('spellCache', JSON.stringify(window.spellCache));
            createSpellTable(detailedSpells);
        } catch (error) {
            console.error('Error fetching spells from API:', error);
        } finally {
            hideLoadingBar();
        }
    }

    async function fetchIndividualSpell(url, index, totalSpells, bar, onComplete) {
        try {
            console.log(`Fetching spell: ${url}`);
            const response = await fetch(`https://www.dnd5eapi.co${url}`, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const spellDetails = await response.json();
            onComplete();
            console.log('Fetched spell details:', spellDetails);
            return spellDetails;
        } catch (error) {
            console.error(`Error fetching individual spell at ${url}:`, error);
            onComplete();
            return {
                name: 'Unknown',
                level: 'N/A',
                school: { name: 'N/A' },
                casting_time: 'N/A',
                range: 'N/A',
                duration: 'N/A',
                components: [],
                material: '',
                desc: ['No description available.'],
                higher_level: [],
                concentration: false,
                ritual: false,
                attack_type: 'N/A',
                damage: { damage_type: { name: 'N/A' }, damage_at_slot_level: {} },
                classes: [],
                subclasses: []
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

        refreshTableBody(spells);

        document.querySelectorAll('#spellTable th.sortable').forEach(header => {
            header.addEventListener('click', function () {
                const column = this.getAttribute('data-column');
                const currentOrder = parseInt(this.dataset.order, 10) || -1;
                const newOrder = -currentOrder;
                this.dataset.order = newOrder;
                const sortedSpells = spells.slice().sort((a, b) => {
                    if (a[column] < b[column]) return newOrder;
                    if (a[column] > b[column]) return -newOrder;
                    return 0;
                });
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
                <td class="spell-name">${spell.name}</td>
                <td>${spell.level}</td>
                <td>${spell.school?.name || 'N/A'}</td>
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
