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
    
    // Results Modal Elements
    const resultsModal = document.getElementById('resultsModal');
    const simulationLog = document.getElementById('simulationLog');
    const finalScoreEl = document.getElementById('finalScore');
    const userBoxScoreTable = document.querySelector('#userBoxScore table');
    const cpuBoxScoreTable = document.querySelector('#cpuBoxScore table');
    const playAgainButton = document.getElementById('playAgainButton');

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
            draftArea.style.display = 'none'; // Hide draft area when done
        }
    }

    battleButton.addEventListener('click', startBattle);
    playAgainButton.addEventListener('click', () => {
        resultsModal.style.display = 'none';
        initializeGame();
    });

    function calculateTeamRatings(team) {
        let offense = 0, defense = 0, chemistry = 0;
        Object.values(team).forEach(p => {
            if (p && p.stats) {
                offense += p.stats.offense + p.stats.playmaking;
                defense += p.stats.defense + p.stats.athleticism;
                chemistry += p.stats.chemistry;
            }
        });
        return { offense, defense, chemistry };
    }

    function startBattle() {
        battleButton.disabled = true;
        const userRatings = calculateTeamRatings(userTeam);
        const cpuRatings = calculateTeamRatings(cpuTeam);

        // --- Game Simulation Logic ---
        const baseScore = 70;
        const offenseFactor = 0.15;
        const defenseFactor = 0.12;
        const chemBonus = userRatings.chemistry / 50; // Chemistry bonus

        let userScore = baseScore + (userRatings.offense * offenseFactor) - (cpuRatings.defense * defenseFactor) + chemBonus;
        let cpuScore = baseScore + (cpuRatings.offense * offenseFactor) - (userRatings.defense * defenseFactor);

        // Add clutch randomness
        const userClutch = Object.values(userTeam).reduce((sum, p) => sum + (p.stats.clutch || 0), 0);
        const cpuClutch = Object.values(cpuTeam).reduce((sum, p) => sum + (p.stats.clutch || 0), 0);
        userScore += (Math.random() * userClutch / 50);
        cpuScore += (Math.random() * cpuClutch / 50);

        userScore = Math.round(userScore);
        cpuScore = Math.round(cpuScore);

        const winner = userScore > cpuScore ? 'user' : 'cpu';

        // --- Display Simulation ---
        simulationLog.innerHTML = '';
        finalScoreEl.innerHTML = '';
        resultsModal.style.display = 'flex';

        const logMessages = [
            "The game is underway!",
            userScore > cpuScore ? "Your team starts strong with a scoring run!" : "The CPU team comes out firing on all cylinders.",
            "Both teams are trading baskets in a tight contest.",
            "A key defensive stop shifts the momentum.",
            "Down to the wire... every possession counts!",
            `And the final buzzer sounds!`
        ];

        logMessages.forEach((msg, i) => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.textContent = msg;
                simulationLog.appendChild(p);
                simulationLog.scrollTop = simulationLog.scrollHeight;
            }, i * 1200);
        });

        setTimeout(() => {
            displayFinalResults(userScore, cpuScore, winner);
        }, logMessages.length * 1200);
    }

    function displayFinalResults(userScore, cpuScore, winner) {
        const userScoreSpan = `<span class="${winner === 'user' ? 'winner' : 'loser'}">${userScore}</span>`;
        const cpuScoreSpan = `<span class="${winner === 'cpu' ? 'winner' : 'loser'}">${cpuScore}</span>`;
        finalScoreEl.innerHTML = `Your Team: ${userScoreSpan} - CPU Team: ${cpuScoreSpan}`;

        // Generate and display box scores
        generateBoxScore(userBoxScoreTable, userTeam, userScore);
        generateBoxScore(cpuBoxScoreTable, cpuTeam, cpuScore);
    }

    function generateBoxScore(table, team, teamScore) {
        const players = Object.values(team).filter(p => p);
        if (players.length === 0) return;

        // Positional multipliers to generate more realistic stat lines
        const positionalMultipliers = {
            rebounds: { PG: 0.6, SG: 0.8, SF: 1.0, PF: 1.3, C: 1.5, '6th': 0.9 },
            assists:  { PG: 1.4, SG: 1.1, SF: 1.0, PF: 0.8, C: 0.7, '6th': 0.9 }
        };

        let playerStats = [];
        let totalTeamPlaymaking = 0;
        let totalTeamOffense = 0;
        let totalReboundPotential = 0;

        players.forEach(p => {
            totalTeamPlaymaking += p.stats.playmaking;
            totalTeamOffense += p.stats.offense;
            
            // Calculate individual rebound potential to be used for distribution
            const playerPosition = p.position || '6th';
            const rebMultiplier = positionalMultipliers.rebounds[playerPosition] || 1.0;
            const reboundScore = (p.stats.defense * 0.7 + p.stats.athleticism * 0.3) * rebMultiplier;
            playerStats.push({ player: p, pts: 0, reb: 0, ast: 0, reboundScore: reboundScore });
            totalReboundPotential += reboundScore;
        });

        // 1. Generate Assists and Rebounds for each player first
        let totalTeamAssists = 0;
        const targetTeamRebounds = 42 + Math.floor(Math.random() * 7); // Target ~45 rebounds

        playerStats.forEach(stat => {
            const p = stat.player;
            const playerPosition = p.position || '6th';
            const astMultiplier = positionalMultipliers.assists[playerPosition] || 1.0;

            // Distribute rebounds based on each player's share of the team's total rebound potential
            const shareOfRebounds = stat.reboundScore / totalReboundPotential;
            stat.reb = Math.round(targetTeamRebounds * shareOfRebounds);

            // Assists based on player's share of team's total playmaking, modified by position
            const ast = Math.round((((p.stats.playmaking / totalTeamPlaymaking) * (teamScore * 0.22)) + Math.random() * 2) * astMultiplier);
            stat.ast = ast;
            totalTeamAssists += ast;
        });

        // 2. Calculate points generated from assists
        let pointsFromAssists = 0;
        for (let i = 0; i < totalTeamAssists; i++) {
            pointsFromAssists += (Math.random() < 0.3) ? 3 : 2; // 30% chance of an assist being for a 3-pointer
        }

        // 3. Distribute all points (assisted and unassisted) based on offense rating
        let pointsToDistribute = teamScore;
        let distributedPoints = 0;
        
        playerStats.forEach((stat, index) => {
            const shareOfOffense = stat.player.stats.offense / totalTeamOffense;
            let calculatedPoints = 0;
            // Ensure the last player gets the remaining points to match the total score
            if (index === playerStats.length - 1) {
                calculatedPoints = pointsToDistribute - distributedPoints;
            } else {
                calculatedPoints = Math.round(pointsToDistribute * shareOfOffense);
            }
            stat.pts = calculatedPoints;
            distributedPoints += calculatedPoints;
        });

        // 4. Calculate totals and build the table body
        let totalPts = 0, totalReb = 0, totalAst = 0;
        let tableBodyHtml = '';
        playerStats.forEach(s => {
            tableBodyHtml += `<tr><td>${s.player.name}</td><td>${s.pts}</td><td>${s.reb}</td><td>${s.ast}</td></tr>`;
            totalPts += s.pts;
            totalReb += s.reb;
            totalAst += s.ast;
        });

        table.innerHTML = `
            <thead>
                <tr><th>Player</th><th>PTS</th><th>REB</th><th>AST</th></tr>
            </thead>
            <tbody>
                ${tableBodyHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>Totals</strong></td>
                    <td><strong>${totalPts}</strong></td>
                    <td><strong>${totalReb}</strong></td>
                    <td><strong>${totalAst}</strong></td>
                </tr>
            </tfoot>
        `;
    }
});

