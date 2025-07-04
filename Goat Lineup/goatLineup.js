// Example player pool (add more as needed)
let playerPool = [];

fetch('goatPlayers_with_img.json')
  .then(response => response.json())
  .then(data => {
    playerPool = data;
    console.log("Loaded players:", playerPool); // Add this line
    randomizeTiles();
  });

const positions = [
    { key: "PG", label: "Point Guard (PG)" },
    { key: "SG", label: "Shooting Guard (SG)" },
    { key: "SF", label: "Small Forward (SF)" },
    { key: "PF", label: "Power Forward (PF)" },
    { key: "C",  label: "Center (C)" },
    { key: "6th", label: "6th Man" }
];

let selectedPlayers = {}; // { PG: playerObj, ... }
let currentTiles = {};    // { PG: playerObj, ... }

function getRandomPlayerForPosition(posKey, excludeNames = []) {
    let pool;
    if (posKey === "6th") {
        // For 6th Man, allow any player not already selected
        pool = playerPool.filter(
            p => !excludeNames.includes(p.name)
        );
    } else {
        // For other positions, filter by position
        pool = playerPool.filter(
            p => p.pos.includes(posKey) && !excludeNames.includes(p.name)
        );
    }
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function randomizeTiles() {
    positions.forEach(pos => {
        if (!selectedPlayers[pos.key]) {
            // Exclude already selected players for other positions
            const exclude = Object.values(selectedPlayers).map(p => p.name);
            currentTiles[pos.key] = getRandomPlayerForPosition(pos.key, exclude);
        }
    });
    renderTiles();
}

function selectPlayer(posKey) {
    selectedPlayers[posKey] = currentTiles[posKey];
    renderTiles();
    checkGoal();
    // Automatically randomize after selection if not all positions are filled
    if (Object.keys(selectedPlayers).length < positions.length) {
        setTimeout(randomizeTiles, 400); // slight delay for UX
    }
}

function renderTiles() {
    const container = document.getElementById('lineupContainer');
    container.innerHTML = '';
    // Track already selected player names to avoid duplicates
    const usedNames = new Set(Object.values(selectedPlayers).map(p => p && p.name));
    positions.forEach(pos => {
        let player = selectedPlayers[pos.key] || currentTiles[pos.key];
        // If the player is already selected for another position, pick a new random one
        if (player && usedNames.has(player.name) && !selectedPlayers[pos.key]) {
            // Exclude already selected players
            const exclude = Array.from(usedNames);
            player = getRandomPlayerForPosition(pos.key, exclude);
            currentTiles[pos.key] = player;
        }
        const isSelected = !!selectedPlayers[pos.key];
        const tile = document.createElement('div');
        tile.className = 'player-tile' + (isSelected ? ' selected' : '');
        tile.innerHTML = `
            <div class="tile-title">${pos.key}</div>
            <img class="player-img" src="${player ? player.img : ''}" alt="${player ? player.name : ''}">
            <div class="player-name">${player ? player.name : '---'}</div>
            <button class="select-btn" ${isSelected ? 'disabled' : ''}>
                ${isSelected ? 'Selected' : 'Select'}
            </button>
        `;
        tile.querySelector('.select-btn').onclick = () => {
            if (!isSelected) selectPlayer(pos.key);
        };
        container.appendChild(tile);
    });
}

// Calculate the combined record based on player scores
function getLineupRecord(selectedPlayers) {
    let totalScore = 0;
    positions.forEach(pos => {
        const player = selectedPlayers[pos.key];
        if (player) {
            totalScore += player.score || 0;
        }
    });
    // Clamp totalScore to a maximum of 82
    totalScore = Math.min(totalScore, 82);
    // Wins = totalScore, Losses = 82 - totalScore (never negative)
    return { wins: totalScore, losses: Math.max(0, 82 - totalScore) };
}

function checkGoal() {
    if (Object.keys(selectedPlayers).length === positions.length) {
        const { wins, losses } = getLineupRecord(selectedPlayers);
        if (wins === 82 && losses === 0) {
            document.getElementById('goalMessage').textContent =
                "Congrats! You built your 82-0 GOAT lineup!";
        } else {
            document.getElementById('goalMessage').textContent =
                `Your lineup record is ${wins}-${losses}. Try to find the 82-0 combo!`;
        }
    } else {
        document.getElementById('goalMessage').textContent =
            "Select one player for each position to build your dream team!";
    }
}

function restartGame() {
    selectedPlayers = {};
    currentTiles = {};
    randomizeTiles();
    document.getElementById('goalMessage').textContent = "Select one player for each position to build your dream team!";
}

// call to randomize the tiles  
randomizeTiles();