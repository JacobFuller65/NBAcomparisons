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
    
    // New draft area elements
    const draftArea = document.getElementById('draft-selection-area');
    const selectionGrid = document.getElementById('selectionGrid');
    const selectionTitle = document.getElementById('selectionTitle');
    
    // Hide reroll button as it's not used in this flow
    const rerollButton = document.getElementById('rerollButton');
    if (rerollButton) rerollButton.style.display = 'none';

    fetch('playerAttributes.json')
        .then(response => response.json())
        .then(data => {
            playerPool = data.players.filter(p => p && p.name);
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
        battleButton.disabled = true;
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
        gameMessage.textContent = `Select a player for the ${pos} position.`;
        selectionGrid.innerHTML = ''; // Clear previous options

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

        draftArea.style.display = 'block'; // Show the draft area
    }

    function selectPlayer(pos, player) {
        userTeam[pos] = player;
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
            const card = createPlayerCard(player, pos);
            if (player) {
                card.classList.add('selected');
            }
            userGrid.appendChild(card);
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

