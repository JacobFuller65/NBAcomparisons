// Example player pool (add more as needed)
const playerPool = [
    { name: "Magic Johnson", img: "images/magic_johnson.jpg", pos: ["PG"], score: 16 },
    { name: "Stephen Curry", img: "images/stephen_curry.jpg", pos: ["PG"], score: 15 },
    { name: "Oscar Robertson", img: "images/oscar_robertson.jpg", pos: ["PG"], score: 13 },
    { name: "Michael Jordan", img: "images/michael_jordan.jpg", pos: ["SG"], score: 18 },
    { name: "Kobe Bryant", img: "images/kobe_bryant.jpg", pos: ["SG"], score: 16 },
    { name: "Dwyane Wade", img: "images/dwyane_wade.jpg", pos: ["SG"], score: 14 },
    { name: "LeBron James", img: "images/lebron_james.jpg", pos: ["SF", "PF"], score: 18 },
    { name: "Larry Bird", img: "images/larry_bird.jpg", pos: ["SF"], score: 15 },
    { name: "Kevin Durant", img: "images/kevin_durant.jpg", pos: ["SF", "PF"], score: 16 },
    { name: "Tim Duncan", img: "images/tim_duncan.jpg", pos: ["PF", "C"], score: 17 },
    { name: "Giannis Antetokounmpo", img: "images/giannis.jpg", pos: ["PF"], score: 15 },
    { name: "Karl Malone", img: "images/karl_malone.jpg", pos: ["PF"], score: 13 },
    { name: "Shaquille O'Neal", img: "images/shaquille_oneal.jpg", pos: ["C"], score: 16 },
    { name: "Kareem Abdul-Jabbar", img: "images/kareem_abdul_jabbar.jpg", pos: ["C"], score: 17 },
    { name: "Hakeem Olajuwon", img: "images/hakeem_olajuwon.jpg", pos: ["C"], score: 14 },
    { name: "Manu Ginóbili", img: "images/manu_ginobili.jpg", pos: ["SG", "6th"], score: 11 },
    { name: "Jamal Crawford", img: "images/jamal_crawford.jpg", pos: ["6th"], score: 10 },
    { name: "Lou Williams", img: "images/lou_williams.jpg", pos: ["6th"], score: 11 },
    { name: "Andre Iguodala", img: "images/andre_iguodala.jpg", pos: ["SF", "6th"], score: 10 },
    // Add more players and images as needed
];

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
    // Filter pool for this position and not already selected
    const pool = playerPool.filter(
        p => p.pos.includes(posKey) && !excludeNames.includes(p.name)
    );
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
    positions.forEach(pos => {
        const player = selectedPlayers[pos.key] || currentTiles[pos.key];
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
    // Wins = totalScore, Losses = 82 - totalScore
    return { wins: totalScore, losses: 82 - totalScore };
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

// call to randomize the tiles  
randomizeTiles();