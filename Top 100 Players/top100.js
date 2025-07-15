// Top 100 NBA Players Data (Based on Bleacher Report's 2024 Rankings)
// This is a sample dataset - in a real implementation, this would be fetched from an API
const playersData = [
    {
        rank: 1,
        name: "Michael Jordan",
        position: "SG",
        era: "1980-1999",
        careerSpan: "1984-2003",
        ppg: 30.1,
        rpg: 6.2,
        apg: 5.3,
        trueShooting: 0.569,
        championships: 6,
        mvps: 5,
        allStars: 14,
        careerLength: 15,
        teams: ["Chicago Bulls", "Washington Wizards"]
    },
    {
        rank: 2,
        name: "LeBron James",
        position: "SF",
        era: "2000-2019",
        careerSpan: "2003-Present",
        ppg: 27.2,
        rpg: 7.5,
        apg: 7.3,
        trueShooting: 0.587,
        championships: 4,
        mvps: 4,
        allStars: 20,
        careerLength: 21,
        teams: ["Cleveland Cavaliers", "Miami Heat", "Los Angeles Lakers"]
    },
    {
        rank: 3,
        name: "Kareem Abdul-Jabbar",
        position: "C",
        era: "1960-1979",
        careerSpan: "1969-1989",
        ppg: 24.6,
        rpg: 11.2,
        apg: 3.6,
        trueShooting: 0.592,
        championships: 6,
        mvps: 6,
        allStars: 19,
        careerLength: 20,
        teams: ["Milwaukee Bucks", "Los Angeles Lakers"]
    },
    {
        rank: 4,
        name: "Magic Johnson",
        position: "PG",
        era: "1980-1999",
        careerSpan: "1979-1991, 1996",
        ppg: 19.5,
        rpg: 7.2,
        apg: 11.2,
        trueShooting: 0.610,
        championships: 5,
        mvps: 3,
        allStars: 12,
        careerLength: 13,
        teams: ["Los Angeles Lakers"]
    },
    {
        rank: 5,
        name: "Larry Bird",
        position: "SF",
        era: "1980-1999",
        careerSpan: "1979-1992",
        ppg: 24.3,
        rpg: 10.0,
        apg: 6.3,
        trueShooting: 0.564,
        championships: 3,
        mvps: 3,
        allStars: 12,
        careerLength: 13,
        teams: ["Boston Celtics"]
    },
    {
        rank: 6,
        name: "Bill Russell",
        position: "C",
        era: "1946-1959",
        careerSpan: "1956-1969",
        ppg: 15.1,
        rpg: 22.5,
        apg: 4.3,
        trueShooting: 0.440,
        championships: 11,
        mvps: 5,
        allStars: 12,
        careerLength: 13,
        teams: ["Boston Celtics"]
    },
    {
        rank: 7,
        name: "Wilt Chamberlain",
        position: "C",
        era: "1960-1979",
        careerSpan: "1959-1973",
        ppg: 30.1,
        rpg: 22.9,
        apg: 4.4,
        trueShooting: 0.547,
        championships: 2,
        mvps: 4,
        allStars: 13,
        careerLength: 14,
        teams: ["Philadelphia Warriors", "San Francisco Warriors", "Philadelphia 76ers", "Los Angeles Lakers"]
    },
    {
        rank: 8,
        name: "Tim Duncan",
        position: "PF",
        era: "2000-2019",
        careerSpan: "1997-2016",
        ppg: 19.0,
        rpg: 10.8,
        apg: 3.0,
        trueShooting: 0.551,
        championships: 5,
        mvps: 2,
        allStars: 15,
        careerLength: 19,
        teams: ["San Antonio Spurs"]
    },
    {
        rank: 9,
        name: "Kobe Bryant",
        position: "SG",
        era: "2000-2019",
        careerSpan: "1996-2016",
        ppg: 25.0,
        rpg: 5.2,
        apg: 4.7,
        trueShooting: 0.550,
        championships: 5,
        mvps: 1,
        allStars: 18,
        careerLength: 20,
        teams: ["Los Angeles Lakers"]
    },
    {
        rank: 10,
        name: "Shaquille O'Neal",
        position: "C",
        era: "2000-2019",
        careerSpan: "1992-2011",
        ppg: 23.7,
        rpg: 10.9,
        apg: 2.5,
        trueShooting: 0.586,
        championships: 4,
        mvps: 1,
        allStars: 15,
        careerLength: 19,
        teams: ["Orlando Magic", "Los Angeles Lakers", "Miami Heat", "Phoenix Suns", "Cleveland Cavaliers", "Boston Celtics"]
    }
    // Additional players would be added here for the full top 100 list
];

// Application state
let currentRankingMethod = 'original';
let currentEraFilter = 'all';
let currentPositionFilter = 'all';
let currentView = 'list';
let filteredPlayers = [...playersData];
let rankingChart = null;

// Custom weights for ranking calculations
let customWeights = {
    ppg: 20,
    efficiency: 15,
    championships: 25,
    mvps: 20,
    longevity: 10,
    allstar: 10
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderPlayers();
    updateAnalytics();
    initializeChart();
});

function initializeEventListeners() {
    // Filter controls
    document.getElementById('ranking-method').addEventListener('change', handleRankingMethodChange);
    document.getElementById('era-filter').addEventListener('change', handleFilterChange);
    document.getElementById('position-filter').addEventListener('change', handleFilterChange);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // View controls
    document.getElementById('list-view').addEventListener('click', () => changeView('list'));
    document.getElementById('card-view').addEventListener('click', () => changeView('card'));
    document.getElementById('comparison-view').addEventListener('click', () => changeView('comparison'));
    
    // Custom weights
    setupCustomWeights();
    
    // Modal controls
    setupModal();
}

function handleRankingMethodChange() {
    const method = document.getElementById('ranking-method').value;
    currentRankingMethod = method;
    
    const customWeightsDiv = document.getElementById('custom-weights');
    if (method === 'custom') {
        customWeightsDiv.style.display = 'block';
    } else {
        customWeightsDiv.style.display = 'none';
    }
    
    applyFilters();
}

function handleFilterChange() {
    currentEraFilter = document.getElementById('era-filter').value;
    currentPositionFilter = document.getElementById('position-filter').value;
}

function setupCustomWeights() {
    const weightInputs = document.querySelectorAll('.weight-item input[type="range"]');
    
    weightInputs.forEach(input => {
        input.addEventListener('input', function() {
            const weightType = this.id.replace('-weight', '');
            const value = parseInt(this.value);
            customWeights[weightType] = value;
            
            // Update display
            const valueSpan = this.parentElement.querySelector('.weight-value');
            valueSpan.textContent = value + '%';
            
            // Update total
            updateTotalWeight();
            
            // Rerank if custom method is selected
            if (currentRankingMethod === 'custom') {
                applyFilters();
            }
        });
    });
}

function updateTotalWeight() {
    const total = Object.values(customWeights).reduce((sum, weight) => sum + weight, 0);
    document.getElementById('total-weight').textContent = total + '%';
    
    // Color code based on total
    const totalElement = document.getElementById('total-weight');
    if (total === 100) {
        totalElement.style.color = '#28a745';
    } else if (total > 100) {
        totalElement.style.color = '#dc3545';
    } else {
        totalElement.style.color = '#ffc107';
    }
}

function applyFilters() {
    // Filter players
    filteredPlayers = playersData.filter(player => {
        const eraMatch = currentEraFilter === 'all' || player.era === currentEraFilter;
        const positionMatch = currentPositionFilter === 'all' || player.position === currentPositionFilter;
        return eraMatch && positionMatch;
    });
    
    // Apply ranking method
    rankPlayers();
    
    // Re-render
    renderPlayers();
    updateAnalytics();
    updateChart();
}

function rankPlayers() {
    switch (currentRankingMethod) {
        case 'original':
            filteredPlayers.sort((a, b) => a.rank - b.rank);
            break;
        case 'ppg':
            filteredPlayers.sort((a, b) => b.ppg - a.ppg);
            break;
        case 'efficiency':
            filteredPlayers.sort((a, b) => b.trueShooting - a.trueShooting);
            break;
        case 'championships':
            filteredPlayers.sort((a, b) => b.championships - a.championships);
            break;
        case 'mvps':
            filteredPlayers.sort((a, b) => b.mvps - a.mvps);
            break;
        case 'longevity':
            filteredPlayers.sort((a, b) => b.careerLength - a.careerLength);
            break;
        case 'allstar':
            filteredPlayers.sort((a, b) => b.allStars - a.allStars);
            break;
        case 'custom':
            rankByCustomWeights();
            break;
    }
    
    // Update ranks
    filteredPlayers.forEach((player, index) => {
        player.currentRank = index + 1;
    });
}

function rankByCustomWeights() {
    // Normalize stats to 0-100 scale for each category
    const maxPpg = Math.max(...playersData.map(p => p.ppg));
    const maxTs = Math.max(...playersData.map(p => p.trueShooting));
    const maxChampionships = Math.max(...playersData.map(p => p.championships));
    const maxMvps = Math.max(...playersData.map(p => p.mvps));
    const maxCareerLength = Math.max(...playersData.map(p => p.careerLength));
    const maxAllStars = Math.max(...playersData.map(p => p.allStars));
    
    filteredPlayers.forEach(player => {
        const ppgScore = (player.ppg / maxPpg) * 100;
        const efficiencyScore = (player.trueShooting / maxTs) * 100;
        const championshipsScore = (player.championships / maxChampionships) * 100;
        const mvpsScore = (player.mvps / maxMvps) * 100;
        const longevityScore = (player.careerLength / maxCareerLength) * 100;
        const allstarScore = (player.allStars / maxAllStars) * 100;
        
        player.customScore = (
            (ppgScore * customWeights.ppg / 100) +
            (efficiencyScore * customWeights.efficiency / 100) +
            (championshipsScore * customWeights.championships / 100) +
            (mvpsScore * customWeights.mvps / 100) +
            (longevityScore * customWeights.longevity / 100) +
            (allstarScore * customWeights.allstar / 100)
        );
    });
    
    filteredPlayers.sort((a, b) => b.customScore - a.customScore);
}

function resetFilters() {
    document.getElementById('ranking-method').value = 'original';
    document.getElementById('era-filter').value = 'all';
    document.getElementById('position-filter').value = 'all';
    document.getElementById('custom-weights').style.display = 'none';
    
    currentRankingMethod = 'original';
    currentEraFilter = 'all';
    currentPositionFilter = 'all';
    
    applyFilters();
}

function changeView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(view + '-view').classList.add('active');
    
    renderPlayers();
}

function renderPlayers() {
    const container = document.getElementById('players-container');
    
    if (currentView === 'list') {
        container.className = 'players-list';
        container.innerHTML = filteredPlayers.map(player => `
            <div class="player-item" onclick="showPlayerDetails(${player.rank})">
                <div class="player-rank">#${player.currentRank || player.rank}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-details">${player.position} • ${player.careerSpan}</div>
                </div>
                <div class="player-stats">
                    <div class="stat-item">
                        <span class="stat-value">${player.ppg}</span>
                        <span class="stat-label">PPG</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${player.championships}</span>
                        <span class="stat-label">Titles</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${player.mvps}</span>
                        <span class="stat-label">MVPs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${(player.trueShooting * 100).toFixed(1)}%</span>
                        <span class="stat-label">TS%</span>
                    </div>
                </div>
            </div>
        `).join('');
    } else if (currentView === 'card') {
        container.className = 'players-cards';
        container.innerHTML = filteredPlayers.map(player => `
            <div class="player-card" onclick="showPlayerDetails(${player.rank})">
                <div class="card-rank">#${player.currentRank || player.rank}</div>
                <div class="card-name">${player.name}</div>
                <div class="card-position">${player.position} • ${player.careerSpan}</div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-value">${player.ppg}</span>
                        <span class="stat-label">PPG</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${player.rpg}</span>
                        <span class="stat-label">RPG</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${player.apg}</span>
                        <span class="stat-label">APG</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${player.championships}</span>
                        <span class="stat-label">Titles</span>
                    </div>
                </div>
            </div>
        `).join('');
    } else if (currentView === 'comparison') {
        container.className = 'comparison-container';
        // Show top 10 in comparison view
        const topPlayers = filteredPlayers.slice(0, 10);
        container.innerHTML = `
            <div class="comparison-chart">
                <canvas id="comparison-chart"></canvas>
            </div>
            <div class="comparison-list">
                ${topPlayers.map(player => `
                    <div class="player-item" onclick="showPlayerDetails(${player.rank})">
                        <div class="player-rank">#${player.currentRank || player.rank}</div>
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-details">${player.position} • ${player.championships} Titles • ${player.mvps} MVPs</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Initialize comparison chart
        setTimeout(() => initializeComparisonChart(topPlayers), 100);
    }
}

function updateAnalytics() {
    updateEraDistribution();
    updatePositionDistribution();
    updateAverageStats();
}

function updateEraDistribution() {
    const eraCount = {};
    filteredPlayers.forEach(player => {
        eraCount[player.era] = (eraCount[player.era] || 0) + 1;
    });
    
    document.getElementById('era-distribution').innerHTML = Object.entries(eraCount)
        .map(([era, count]) => `<div>${era}: ${count} players</div>`)
        .join('');
}

function updatePositionDistribution() {
    const positionCount = {};
    filteredPlayers.forEach(player => {
        positionCount[player.position] = (positionCount[player.position] || 0) + 1;
    });
    
    document.getElementById('position-distribution').innerHTML = Object.entries(positionCount)
        .map(([position, count]) => `<div>${position}: ${count} players</div>`)
        .join('');
}

function updateAverageStats() {
    const avgPpg = (filteredPlayers.reduce((sum, p) => sum + p.ppg, 0) / filteredPlayers.length).toFixed(1);
    const avgRpg = (filteredPlayers.reduce((sum, p) => sum + p.rpg, 0) / filteredPlayers.length).toFixed(1);
    const avgApg = (filteredPlayers.reduce((sum, p) => sum + p.apg, 0) / filteredPlayers.length).toFixed(1);
    const avgChampionships = (filteredPlayers.reduce((sum, p) => sum + p.championships, 0) / filteredPlayers.length).toFixed(1);
    const avgMvps = (filteredPlayers.reduce((sum, p) => sum + p.mvps, 0) / filteredPlayers.length).toFixed(1);
    
    document.getElementById('average-stats').innerHTML = `
        <div>PPG: ${avgPpg}</div>
        <div>RPG: ${avgRpg}</div>
        <div>APG: ${avgApg}</div>
        <div>Championships: ${avgChampionships}</div>
        <div>MVPs: ${avgMvps}</div>
    `;
}

function initializeChart() {
    const ctx = document.getElementById('rankings-chart').getContext('2d');
    
    rankingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredPlayers.slice(0, 10).map(p => p.name),
            datasets: [{
                label: 'Original Rank',
                data: filteredPlayers.slice(0, 10).map(p => p.rank),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4
            }, {
                label: 'Current Rank',
                data: filteredPlayers.slice(0, 10).map((p, i) => i + 1),
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    reverse: true,
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Rank'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Ranking Changes (Top 10)'
                },
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateChart() {
    if (rankingChart) {
        rankingChart.data.labels = filteredPlayers.slice(0, 10).map(p => p.name);
        rankingChart.data.datasets[0].data = filteredPlayers.slice(0, 10).map(p => p.rank);
        rankingChart.data.datasets[1].data = filteredPlayers.slice(0, 10).map((p, i) => i + 1);
        rankingChart.update();
    }
}

function initializeComparisonChart(players) {
    const ctx = document.getElementById('comparison-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['PPG', 'Championships', 'MVPs', 'All-Stars', 'TS%', 'Career Length'],
            datasets: players.slice(0, 5).map((player, index) => ({
                label: player.name,
                data: [
                    player.ppg / 35 * 100, // Normalize to 100
                    player.championships / 11 * 100,
                    player.mvps / 6 * 100,
                    player.allStars / 20 * 100,
                    player.trueShooting * 100,
                    player.careerLength / 25 * 100
                ],
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
                pointBackgroundColor: `hsl(${index * 60}, 70%, 50%)`
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function setupModal() {
    const modal = document.getElementById('comparison-modal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function showPlayerDetails(playerRank) {
    const player = playersData.find(p => p.rank === playerRank);
    if (!player) return;
    
    const modal = document.getElementById('comparison-modal');
    const content = document.getElementById('comparison-content');
    
    content.innerHTML = `
        <div class="player-details-full">
            <h2>${player.name}</h2>
            <div class="player-overview">
                <div class="overview-item">
                    <strong>Position:</strong> ${player.position}
                </div>
                <div class="overview-item">
                    <strong>Career:</strong> ${player.careerSpan}
                </div>
                <div class="overview-item">
                    <strong>Teams:</strong> ${player.teams.join(', ')}
                </div>
                <div class="overview-item">
                    <strong>Original Rank:</strong> #${player.rank}
                </div>
                <div class="overview-item">
                    <strong>Current Rank:</strong> #${player.currentRank || player.rank}
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-category">
                    <h3>Scoring</h3>
                    <div>Points Per Game: ${player.ppg}</div>
                    <div>True Shooting %: ${(player.trueShooting * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-category">
                    <h3>All-Around</h3>
                    <div>Rebounds Per Game: ${player.rpg}</div>
                    <div>Assists Per Game: ${player.apg}</div>
                </div>
                <div class="stat-category">
                    <h3>Achievements</h3>
                    <div>Championships: ${player.championships}</div>
                    <div>MVP Awards: ${player.mvps}</div>
                    <div>All-Star Selections: ${player.allStars}</div>
                </div>
                <div class="stat-category">
                    <h3>Career</h3>
                    <div>Career Length: ${player.careerLength} seasons</div>
                    <div>Era: ${player.era}</div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}