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
            // If pos is 'ANY', we don't filter by position. Otherwise, we check.
            const isCorrectPosition = pos === 'ANY' || pos === '6th' || (p.position && p.position.includes(pos));
            return isCorrectPosition && !exclude.some(ex => ex && ex.name === p.name);
        });
        if (eligiblePlayers.length === 0) {
            // Fallback: if no player is found for a specific position, grab any player.
            const fallbackPlayers = playerPool.filter(p => !exclude.some(ex => ex && ex.name === p.name));
            if (fallbackPlayers.length === 0) return null;
            return fallbackPlayers[Math.floor(Math.random() * fallbackPlayers.length)];
        };
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
        selectionTitle.textContent = `Choose Your Player`;
        selectionGrid.innerHTML = '';

        const excludedForDraft = [...Object.values(userTeam), ...Object.values(cpuTeam)];
        const options = [];
        
        const corePositions = ["PG", "SG", "SF", "PF", "C"];
        const userTeamPositions = Object.values(userTeam).map(p => p.position);
        const neededPositions = corePositions.filter(p => !userTeamPositions.includes(p));

        let draftModePos;
        // For the first 4 picks, allow any position. For the last 2, guarantee needed positions.
        if (index < 4 && neededPositions.length > 0) {
            gameMessage.textContent = `Select any player for the ${pos} slot.`;
            draftModePos = 'ANY';
        } else {
            // If there are still core positions needed, pick one of them.
            if (neededPositions.length > 0) {
                gameMessage.textContent = `Your team needs a ${neededPositions.join('/')}. Select one.`;
                // Pick a random needed position to offer players from
                draftModePos = neededPositions[Math.floor(Math.random() * neededPositions.length)];
            } else {
                // If all core positions are filled, the 6th man can be anyone
                gameMessage.textContent = `Your core team is set! Choose a 6th man.`;
                draftModePos = 'ANY';
            }
        }

        for (let i = 0; i < 5; i++) {
            const option = getRandomPlayer(draftModePos, [...excludedForDraft, ...options]);
            if (option) options.push(option);
        }

        options.forEach(player => {
            const card = createPlayerCard(player, player.position || 'Bench'); // Show actual position on card
            card.onclick = () => selectPlayer(player); // Pass only the player object
            selectionGrid.appendChild(card);
        });

        draftArea.style.display = 'block';
    }

    function selectPlayer(player) {
        const primaryPos = player.position;

        // Check if the player's primary position is available
        if (primaryPos && !userTeam[primaryPos]) {
            userTeam[primaryPos] = player;
        } 
        // If primary position is taken or doesn't exist, try the 6th man slot
        else if (!userTeam['6th']) {
            userTeam['6th'] = player;
        } 
        // If both are taken, find the first available empty slot from the core positions
        else {
            const openSlot = positions.find(p => p !== '6th' && !userTeam[p]);
            if (openSlot) {
                userTeam[openSlot] = player;
            }
            // If no slots are open, the pick can't be made (this is a fallback)
            else {
                 console.error("No available slot for this player.");
                 // Don't advance the draft if no slot is found
                 return;
            }
        }

        renderUserGrid();
        renderCpuGrid();
        
        currentDraftPositionIndex++;
        startDraftForPosition(currentDraftPositionIndex);
    }

    function createPlayerCard(player, title) {
        const card = document.createElement('div');
        card.className = 'player-card';

        if (!player) {
            card.innerHTML = `<div class="card-title">${title}</div>`;
            return card;
        }

        // --- Archetype Icon Logic ---
        const archetypeIcons = {
            '3PT Specialist': 'fa-solid fa-crosshairs',
            'Slasher': 'fa-solid fa-bolt',
            'Lockdown Defender': 'fa-solid fa-shield-halved',
            'Floor General': 'fa-solid fa-chess-king',
            'Mid-Range Assassin': 'fa-solid fa-bullseye',
            'All-Around': 'fa-solid fa-star',
            'Gravity': 'fa-solid fa-magnet'
        };

        let archetypeIconsHtml = '<div class="archetype-icons">';
        if (player.tags) {
            player.tags.forEach(tag => {
                if (archetypeIcons[tag]) {
                    archetypeIconsHtml += `<i class="${archetypeIcons[tag]}" title="${tag}"></i>`;
                }
            });
        }
        archetypeIconsHtml += '</div>';
        // --- End of Icon Logic ---

        // Build stats HTML
        let statsHtml = '<div class="player-stats">';
        for (const [stat, value] of Object.entries(player.stats)) {
            statsHtml += `<div class="stat-item">
                            <span class="stat-name">${stat.substring(0, 3).toUpperCase()}</span>
                            <span class="stat-value">${value}</span>
                          </div>`;
        }
        statsHtml += '</div>';

        // Build tags HTML
        let tagsHtml = '<div class="player-tags">';
        if (player.tags && player.tags.length > 0) {
            player.tags.forEach(tag => {
                tagsHtml += `<span class="tag-badge">${tag}</span>`;
            });
        }
        tagsHtml += '</div>';

        card.innerHTML = `
            ${archetypeIconsHtml}
            <div class="card-title">${title}</div>
            <img src="${player.photo}" alt="${player.name}" style="width:120px; height:auto;">
            <div>${player.name}</div>
            ${statsHtml}
            ${tagsHtml}
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
            // Check if the user has drafted for this position yet
            if (userTeam[pos]) {
                const player = cpuTeam[pos];
                const card = createPlayerCard(player, pos);
                card.classList.add('selected');
                cpuGrid.appendChild(card);
            } else {
                // If not, render a placeholder card
                const placeholderCard = createPlayerCard(null, pos);
                cpuGrid.appendChild(placeholderCard);
            }
        });
    }

    function checkCompletion() {
        if (Object.keys(userTeam).length === positions.length) {
            gameMessage.textContent = "Your team is ready! Hit Start Battle!";
            battleButton.disabled = false;
        }
    }
});

