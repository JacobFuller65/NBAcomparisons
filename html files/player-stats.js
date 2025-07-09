let playerData = {};

// Load player data from JSON file
async function loadPlayerData() {
    try {
        console.log('Attempting to fetch player data...');
        const response = await fetch('../Player Comparison/player-data.json');
        console.log('Response received:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        playerData = await response.json();
        console.log('Player Data Loaded:', Object.keys(playerData).length, 'players');
        populatePlayerDropdown(playerData);
    } catch (error) {
        console.error('Error loading player data:', error);
    }
}

// Populate player dropdown
function populatePlayerDropdown(playerData) {
    const playerNames = Object.keys(playerData).sort();
    const playerSelect = document.getElementById('player-select');
    
    playerSelect.innerHTML = '<option value="">--Select a Player--</option>';
    
    playerNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        playerSelect.appendChild(option);
    });
    
    // Add event listener for player selection
    playerSelect.addEventListener('change', function() {
        const selectedPlayer = this.value;
        if (selectedPlayer) {
            displayPlayerStats(selectedPlayer);
        } else {
            hidePlayerInfo();
        }
    });
    
    console.log('Populated dropdown with', playerNames.length, 'players');
}

// Hide player info section
function hidePlayerInfo() {
    document.getElementById('player-info').style.display = 'none';
}

// Display comprehensive player stats
function displayPlayerStats(playerName) {
    const playerSeasons = playerData[playerName];
    if (!playerSeasons) {
        console.error(`No data found for player: ${playerName}`);
        return;
    }
    
    console.log(`Displaying stats for ${playerName}`);
    
    // Show player info section
    document.getElementById('player-info').style.display = 'block';
    
    // Update player name
    document.getElementById('player-name').textContent = playerName;
    
    // Update player image
    const playerImage = document.getElementById('player-image');
    playerImage.src = `../images/${playerName.replace(/ /g, "_")}.jpg`;
    playerImage.alt = `${playerName} Image`;
    playerImage.onerror = function() {
        this.style.display = 'none'; // Hide if no image available
    };
    
    // Get seasons data
    const seasons = Array.isArray(playerSeasons) ? playerSeasons : Object.values(playerSeasons);
    
    // Display career summary
    displayCareerSummary(seasons);
    
    // Display awards
    displayPlayerAwards(playerName);
    
    // Display career stats
    displayCareerStats(seasons);
    
    // Display seasons table
    displaySeasonsTable(seasons);
}

// Display career summary
function displayCareerSummary(seasons) {
    if (!seasons || seasons.length === 0) return;
    
    const firstSeason = seasons[0];
    const lastSeason = seasons[seasons.length - 1];
    const totalSeasons = seasons.length;
    
    const summary = `
        <p><strong>Career:</strong> ${firstSeason.Season} - ${lastSeason.Season} (${totalSeasons} seasons)</p>
        <p><strong>Teams:</strong> ${[...new Set(seasons.map(s => s.Team))].join(', ')}</p>
        <p><strong>Position:</strong> ${firstSeason.Pos || 'N/A'}</p>
    `;
    
    document.getElementById('player-career-summary').innerHTML = summary;
}

// Display player awards
function displayPlayerAwards(playerName) {
    const careerAwards = getCareerAwards(playerName);
    displayPlayerAwardsIcons(careerAwards);
}

// Get career awards
function getCareerAwards(playerName) {
    const playerSeasons = playerData[playerName];
    const total = { championships: 0, mvp: 0, allnba: 0, allstar: 0 };
    
    if (!playerSeasons) return total;
    
    const seasons = Array.isArray(playerSeasons) ? playerSeasons : Object.values(playerSeasons);
    
    seasons.forEach(season => {
        if (season && season.Awards) {
            const seasonAwards = parseAwardsString(season.Awards);
            total.championships += seasonAwards.championships;
            total.mvp += seasonAwards.mvp;
            total.allnba += seasonAwards.allnba;
            total.allstar += seasonAwards.allstar;
        }
    });
    
    return total;
}

// Parse awards string
function parseAwardsString(awardsStr) {
    const result = { championships: 0, mvp: 0, allnba: 0, allstar: 0 };
    
    if (!awardsStr) return result;
    
    // Championship
    if (awardsStr.includes('Champ')) result.championships = 1;
    
    // MVP
    if (awardsStr.includes('MVP')) result.mvp = 1;
    
    // All-NBA (1st, 2nd, 3rd team)
    if (awardsStr.includes('All-NBA')) result.allnba = 1;
    
    // All-Star
    if (awardsStr.includes('AS')) result.allstar = 1;
    
    return result;
}

// Display award icons
function displayPlayerAwardsIcons(playerAwards) {
    // Update count text
    document.getElementById('championship-count').textContent = playerAwards.championships ? `×${playerAwards.championships}` : '0';
    document.getElementById('mvp-count').textContent = playerAwards.mvp ? `×${playerAwards.mvp}` : '0';
    document.getElementById('allnba-count').textContent = playerAwards.allnba ? `×${playerAwards.allnba}` : '0';
    document.getElementById('allstar-count').textContent = playerAwards.allstar ? `×${playerAwards.allstar}` : '0';
    
    // Add simple emoji indicators
    const championships = document.getElementById('championship-icons');
    const mvp = document.getElementById('mvp-icons');
    const allnba = document.getElementById('allnba-icons');
    const allstar = document.getElementById('allstar-icons');
    
    championships.innerHTML = createAwardIndicators(playerAwards.championships, '🏆');
    mvp.innerHTML = createAwardIndicators(playerAwards.mvp, '👑');
    allnba.innerHTML = createAwardIndicators(playerAwards.allnba, '⭐');
    allstar.innerHTML = createAwardIndicators(playerAwards.allstar, '🌟');
}

// Create award indicators
function createAwardIndicators(count, emoji) {
    let indicators = '';
    for (let i = 0; i < Math.min(count, 10); i++) { // Limit to 10 for display
        indicators += `<span style="margin-right: 3px; font-size: 16px;">${emoji}</span>`;
    }
    return indicators;
}

// Display career statistics
function displayCareerStats(seasons) {
    if (!seasons || seasons.length === 0) return;
    
    // Calculate career averages
    const totalGames = seasons.reduce((sum, season) => sum + (season.G || 0), 0);
    const avgPTS = (seasons.reduce((sum, season) => sum + (season.PTS || 0) * (season.G || 0), 0) / totalGames).toFixed(1);
    const avgAST = (seasons.reduce((sum, season) => sum + (season.AST || 0) * (season.G || 0), 0) / totalGames).toFixed(1);
    const avgTRB = (seasons.reduce((sum, season) => sum + (season.TRB || 0) * (season.G || 0), 0) / totalGames).toFixed(1);
    const avgFG = (seasons.reduce((sum, season) => sum + (season["FG%"] || 0) * (season.G || 0), 0) / totalGames * 100).toFixed(1);
    
    // Find best season stats
    const bestPTS = Math.max(...seasons.map(s => s.PTS || 0));
    const bestAST = Math.max(...seasons.map(s => s.AST || 0));
    const bestTRB = Math.max(...seasons.map(s => s.TRB || 0));
    
    const careerStatsHTML = `
        <div class="stat-box">
            <div class="stat-value">${avgPTS}</div>
            <div class="stat-label">PPG (Career)</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${avgAST}</div>
            <div class="stat-label">APG (Career)</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${avgTRB}</div>
            <div class="stat-label">RPG (Career)</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${avgFG}%</div>
            <div class="stat-label">FG% (Career)</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${bestPTS}</div>
            <div class="stat-label">Best PPG</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${totalGames}</div>
            <div class="stat-label">Total Games</div>
        </div>
    `;
    
    document.getElementById('career-stats').innerHTML = careerStatsHTML;
}

// Display seasons table
function displaySeasonsTable(seasons) {
    if (!seasons || seasons.length === 0) return;
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Season</th>
                    <th>Age</th>
                    <th>Team</th>
                    <th>G</th>
                    <th>PTS</th>
                    <th>AST</th>
                    <th>REB</th>
                    <th>FG%</th>
                    <th>3P%</th>
                    <th>Awards</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    seasons.forEach(season => {
        tableHTML += `
            <tr>
                <td>${season.Season || 'N/A'}</td>
                <td>${season.Age || 'N/A'}</td>
                <td>${season.Team || 'N/A'}</td>
                <td>${season.G || 'N/A'}</td>
                <td>${season.PTS || 'N/A'}</td>
                <td>${season.AST || 'N/A'}</td>
                <td>${season.TRB || 'N/A'}</td>
                <td>${season["FG%"] ? (season["FG%"] * 100).toFixed(1) + '%' : 'N/A'}</td>
                <td>${season["3P%"] ? (season["3P%"] * 100).toFixed(1) + '%' : 'N/A'}</td>
                <td>${season.Awards || 'N/A'}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    document.getElementById('seasons-table').innerHTML = tableHTML;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired, loading player data...');
    loadPlayerData();
});