document.addEventListener('DOMContentLoaded', () => {
    let playerPool = [];
    let userTeam = {};
    let cpuTeam = {};
    let currentDraftPositionIndex = 0;
    const positions = ["PG", "SG", "SF", "PF", "C", "6th"];

    // DOM Elements
    const userGrid = document.getElementById('userPlayerGrid');
    const cpuGrid = document.getElementById('cpuPlayerGrid');
    const battleButton = document.getElementById('battleButton');
    const gameMessage = document.getElementById('gameMessage');
    const selectionModal = document.getElementById('selectionModal');
    const selectionGrid = document.getElementById('selectionGrid');
    const selectionTitle = document.getElementById('selectionTitle');
    // Hide reroll button as it's not used in this flow
    document.getElementById('rerollButton').style.display = 'none';

    fetch('playerAttributes.json')
        .then(response => response.json())
        .then(data => {
            playerPool = data.players.filter(p => p && p.name); // Ensure players are valid
            if (playerPool.length > 0) {
                initializeGame();
            } else {
                gameMessage.textContent = "Failed to load valid player data.";
            }
        })
        .catch(error => console.error('Error fetching player data:', error));

    function initializeGame() {
        userTeam = {};
        cpuTeam = {};
        currentDraftPositionIndex = 0;
        generateCpuTeam();
        renderCpuGrid();
        renderUserGrid(); // Render empty slots initially
        startDraftForPosition(currentDraftPositionIndex);
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
            if (player) excludedForCpu.push(player);
        });
    }

    function startDraftForPosition(index) {
        if (index >= positions.length) {
            checkCompletion();
            return;
        }

        const pos = positions[index];
        selectionTitle.textContent = `Choose Your ${pos}`;
        gameMessage.textContent = `Select one of the five players for the ${pos} position.`;
        selectionGrid.innerHTML = '';

        const excludedForDraft = [...Object.values(userTeam), ...Object.values(cpuTeam)];
        const options = [];
        for (let i = 0; i < 5; i++) {
            const option = getRandomPlayer(pos, [...excludedForDraft, ...options]);
            if (option) options.push(option);
        }

        options.forEach(player => {
            const card = createPlayerCard(player, pos);
            card.onclick = () => selectPlayer(pos, player);
            selectionGrid.appendChild(card);
        });

        selectionModal.style.display = 'flex';
    }

    function selectPlayer(pos, player) {
        userTeam[pos] = player;
        selectionModal.style.display = 'none';
        renderUserGrid();
        
        currentDraftPositionIndex++;
        startDraftForPosition(currentDraftPositionIndex);
    }

    function createPlayerCard(player, title) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="card-title">${title}</div>
            <img src="${player?.photo || 'placeholder.jpg'}" alt="${player?.name || 'N/A'}" style="width:120px; height:auto;">
            <div>${player?.name || 'N/A'}</div>
        `;
        return card;
    }

    function renderUserGrid() {
        userGrid.innerHTML = '';
        positions.forEach(pos => {
            const player = userTeam[pos];
            if (player) {
                const card = createPlayerCard(player, pos);
                card.classList.add('selected');
                userGrid.appendChild(card);
            } else {
                // Render a placeholder for empty slots
                const placeholderCard = document.createElement('div');
                placeholderCard.className = 'player-card';
                placeholderCard.innerHTML = `<div class="card-title">${pos}</div>`;
                userGrid.appendChild(placeholderCard);
            }
        });
    }

    function renderCpuGrid() {
        cpuGrid.innerHTML = '';
        positions.forEach(pos => {
            const player = cpuTeam[pos];
            const card = createPlayerCard(player, pos);
            card.classList.add('selected');
            cpuGrid.appendChild(card);
        });
    }

    function checkCompletion() {
        if (Object.keys(userTeam).length === positions.length) {
            gameMessage.textContent = "Your team is ready! Hit Start Battle!";
            battleButton.disabled = false;
        }
    }
});

