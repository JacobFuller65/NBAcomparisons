document.addEventListener('DOMContentLoaded', () => {
    let playerPool = [];
    let userTeam = {}; // { PG: player, SG: player, ... }
    let cpuTeam = {};
    let userPlayerOptions = {}; // { PG: [p1, p2], SG: [p1, p2] ...}

    const positions = ["PG", "SG", "SF", "PF", "C", "6th"];

    const userGrid = document.getElementById('userPlayerGrid');
    const cpuGrid = document.getElementById('cpuPlayerGrid');
    const rerollButton = document.getElementById('rerollButton');
    const battleButton = document.getElementById('battleButton');
    const gameMessage = document.getElementById('gameMessage');

    // Fetch player data from the JSON file
    fetch('playerAttributes.json')
        .then(response => response.json())
        .then(data => {
            playerPool = data.players;
            if (playerPool.length > 0) {
                initializeGame();
            } else {
                gameMessage.textContent = "Failed to load player data.";
            }
        })
        .catch(error => {
            console.error('Error fetching player data:', error);
            gameMessage.textContent = 'Error loading player data.';
        });

    function initializeGame() {
        generateCpuTeam();
        generateUserOptions();
        renderAllGrids();
        rerollButton.addEventListener('click', () => {
             if (Object.keys(userTeam).length < positions.length) {
                generateUserOptions();
                renderUserGrid();
             }
        });
    }

    function getRandomPlayer(pos, exclude = []) {
        const eligiblePlayers = playerPool.filter(p => {
            const isCorrectPosition = pos === '6th' || (p.position && p.position.includes(pos));
            return isCorrectPosition && !exclude.some(ex => ex && ex.name === p.name);
        });
        if (eligiblePlayers.length === 0) return null;
        return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    }

    function generateCpuTeam() {
        const excludedForCpu = [];
        positions.forEach(pos => {
            const player = getRandomPlayer(pos, excludedForCpu);
            cpuTeam[pos] = player;
            if(player) excludedForCpu.push(player);
        });
    }

    function generateUserOptions() {
        const excludedForUser = Object.values(userTeam).concat(Object.values(cpuTeam));
        positions.forEach(pos => {
            // Only generate new options for unselected positions
            if (!userTeam[pos]) {
                // Provide 2-3 options per slot
                const option1 = getRandomPlayer(pos, excludedForUser);
                if(option1) excludedForUser.push(option1);

                const option2 = getRandomPlayer(pos, excludedForUser);
                if(option2) excludedForUser.push(option2);
                
                userPlayerOptions[pos] = [option1, option2].filter(p => p); // Filter out nulls
            }
        });
    }

    function renderAllGrids() {
        renderUserGrid();
        renderCpuGrid();
    }

    function renderGrid(container, team, title) {
        container.innerHTML = '';
        positions.forEach(pos => {
            const player = team[pos];
            const card = document.createElement('div');
            card.className = 'player-card selected'; // All CPU cards are "selected"
            card.innerHTML = `
                <div class="card-title">${pos}</div>
                <img src="${player?.photo || ''}" alt="${player?.name || 'N/A'}">
                <div>${player?.name || 'N/A'}</div>
            `;
            container.appendChild(card);
        });
    }

    function renderUserGrid() {
        userGrid.innerHTML = '';
        positions.forEach(pos => {
            if (userTeam[pos]) {
                // Render the selected player
                const player = userTeam[pos];
                const card = document.createElement('div');
                card.className = 'player-card selected';
                card.innerHTML = `
                    <div class="card-title">${pos}</div>
                    <img src="${player.photo}" alt="${player.name}">
                    <div>${player.name}</div>
                `;
                userGrid.appendChild(card);
            } else {
                // Render the options for an unselected position
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'options-container';
                userPlayerOptions[pos].forEach(playerOption => {
                    if (!playerOption) return;
                    const card = document.createElement('div');
                    card.className = 'player-card';
                    card.innerHTML = `
                        <div class="card-title">${pos}</div>
                        <img src="${playerOption.photo}" alt="${playerOption.name}">
                        <div>${playerOption.name}</div>
                    `;
                    card.onclick = () => selectPlayer(pos, playerOption);
                    optionsContainer.appendChild(card);
                });
                userGrid.appendChild(optionsContainer);
            }
        });
    }

    function renderCpuGrid() {
        renderGrid(cpuGrid, cpuTeam, "CPU's Team");
    }

    function selectPlayer(pos, player) {
        userTeam[pos] = player;
        // Remove selected player from other options to prevent duplicates
        Object.keys(userPlayerOptions).forEach(p => {
            if (p !== pos) {
                userPlayerOptions[p] = userPlayerOptions[p].filter(opt => opt.name !== player.name);
            }
        });
        renderUserGrid();
        checkCompletion();
    }

    function checkCompletion() {
        if (Object.keys(userTeam).length === positions.length) {
            gameMessage.textContent = "Your team is ready! Hit Start Battle!";
            battleButton.disabled = false;
        } else {
            gameMessage.textContent = "Select a player for each position.";
            battleButton.disabled = true;
        }
    }

    battleButton.addEventListener('click', () => {
        // Implement battle logic here
        gameMessage.textContent = "Battle started! (not implemented)";
    });
});

