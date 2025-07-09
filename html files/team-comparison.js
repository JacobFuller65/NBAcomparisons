// Team Comparison Tool JavaScript
let teamData = {};
let selectedTeam1 = null;
let selectedTeam2 = null;

// Load team data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTeamData();
});

// Load team data from JSON file
async function loadTeamData() {
    try {
        const response = await fetch('team-data.json');
        teamData = await response.json();
        console.log('Team data loaded:', teamData);
        populateTeamDropdowns();
    } catch (error) {
        console.error('Error loading team data:', error);
    }
}

// Populate team dropdown menus
function populateTeamDropdowns() {
    const team1Select = document.getElementById('team1-select');
    const team2Select = document.getElementById('team2-select');
    
    // Clear existing options
    team1Select.innerHTML = '<option value="">--Choose a Team--</option>';
    team2Select.innerHTML = '<option value="">--Choose a Team--</option>';
    
    // Add teams to dropdowns
    Object.keys(teamData).forEach(teamKey => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        
        option1.value = teamKey;
        option1.textContent = teamKey;
        option2.value = teamKey;
        option2.textContent = teamKey;
        
        team1Select.appendChild(option1);
        team2Select.appendChild(option2);
    });
}

// Compare teams function
function compareTeams() {
    const team1Key = document.getElementById('team1-select').value;
    const team2Key = document.getElementById('team2-select').value;
    
    if (!team1Key || !team2Key) {
        alert('Please select both teams to compare.');
        return;
    }
    
    if (team1Key === team2Key) {
        alert('Please select different teams to compare.');
        return;
    }
    
    selectedTeam1 = teamData[team1Key];
    selectedTeam2 = teamData[team2Key];
    
    displayTeamComparison();
}

// Display team comparison
function displayTeamComparison() {
    const resultsDiv = document.getElementById('comparison-results');
    resultsDiv.style.display = 'block';
    
    // Update team info sections
    updateTeamInfo();
    
    // Update rosters
    updateRosters();
    
    // Update stats comparison
    updateStatsComparison();
    
    // Create charts
    createCharts();
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Update team info sections
function updateTeamInfo() {
    const team1Info = document.getElementById('team1-info');
    const team2Info = document.getElementById('team2-info');
    
    // Update team 1 info
    team1Info.querySelector('h3').textContent = selectedTeam1.team + ' (' + selectedTeam1.season + ')';
    team1Info.querySelector('.team-stats').innerHTML = generateTeamStatsHTML(selectedTeam1);
    
    // Update team 2 info
    team2Info.querySelector('h3').textContent = selectedTeam2.team + ' (' + selectedTeam2.season + ')';
    team2Info.querySelector('.team-stats').innerHTML = generateTeamStatsHTML(selectedTeam2);
}

// Generate team stats HTML
function generateTeamStatsHTML(team) {
    return `
        <div class="stat-row">
            <span class="stat-label">Record:</span>
            <span class="stat-value">${team.wins}-${team.losses}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Win %:</span>
            <span class="stat-value">${(team.winPct * 100).toFixed(1)}%</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Playoffs:</span>
            <span class="stat-value">${team.playoffs}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Offensive Rating:</span>
            <span class="stat-value">${team.offRating}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Defensive Rating:</span>
            <span class="stat-value">${team.defRating}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Net Rating:</span>
            <span class="stat-value">${team.netRating}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Pace:</span>
            <span class="stat-value">${team.pace}</span>
        </div>
        <div class="achievements-list">
            <h4>Achievements:</h4>
            <ul>
                ${team.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Update rosters
function updateRosters() {
    const team1RosterBody = document.getElementById('team1-roster-body');
    const team2RosterBody = document.getElementById('team2-roster-body');
    
    // Update team 1 roster
    team1RosterBody.innerHTML = generateRosterHTML(selectedTeam1.roster);
    
    // Update team 2 roster
    team2RosterBody.innerHTML = generateRosterHTML(selectedTeam2.roster);
    
    // Update roster headers
    document.querySelector('#team1-roster h4').textContent = selectedTeam1.team + ' Roster';
    document.querySelector('#team2-roster h4').textContent = selectedTeam2.team + ' Roster';
}

// Generate roster HTML
function generateRosterHTML(roster) {
    return roster.map(player => `
        <tr>
            <td>${player.name}</td>
            <td>${player.position}</td>
            <td>${player.age}</td>
            <td>${player.ppg}</td>
            <td>${player.rpg}</td>
            <td>${player.apg}</td>
        </tr>
    `).join('');
}

// Update stats comparison
function updateStatsComparison() {
    const statsBody = document.getElementById('stats-comparison-body');
    const team1Header = document.getElementById('team1-header');
    const team2Header = document.getElementById('team2-header');
    
    // Update headers
    team1Header.textContent = selectedTeam1.team;
    team2Header.textContent = selectedTeam2.team;
    
    // Define stats to compare
    const statsToCompare = [
        { key: 'wins', label: 'Wins', higherIsBetter: true },
        { key: 'losses', label: 'Losses', higherIsBetter: false },
        { key: 'winPct', label: 'Win %', higherIsBetter: true, format: (val) => (val * 100).toFixed(1) + '%' },
        { key: 'offRating', label: 'Offensive Rating', higherIsBetter: true },
        { key: 'defRating', label: 'Defensive Rating', higherIsBetter: false },
        { key: 'netRating', label: 'Net Rating', higherIsBetter: true },
        { key: 'pace', label: 'Pace', higherIsBetter: null }
    ];
    
    statsBody.innerHTML = statsToCompare.map(stat => {
        const val1 = selectedTeam1[stat.key];
        const val2 = selectedTeam2[stat.key];
        const diff = val1 - val2;
        
        let team1Class = '';
        let team2Class = '';
        
        if (stat.higherIsBetter !== null) {
            if (stat.higherIsBetter) {
                team1Class = val1 > val2 ? 'better-stat' : '';
                team2Class = val2 > val1 ? 'better-stat' : '';
            } else {
                team1Class = val1 < val2 ? 'better-stat' : '';
                team2Class = val2 < val1 ? 'better-stat' : '';
            }
        }
        
        const formatValue = stat.format || ((val) => val);
        const diffText = stat.higherIsBetter !== null ? 
            (diff > 0 ? '+' : '') + (stat.format ? formatValue(diff) : diff.toFixed(1)) : 'N/A';
        
        return `
            <tr>
                <td>${stat.label}</td>
                <td class="${team1Class}">${formatValue(val1)}</td>
                <td class="${team2Class}">${formatValue(val2)}</td>
                <td>${diffText}</td>
            </tr>
        `;
    }).join('');
}

// Create charts
function createCharts() {
    createTeamStatsChart();
    createWinLossChart();
}

// Create team stats chart
function createTeamStatsChart() {
    const ctx = document.getElementById('team-stats-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.teamStatsChart instanceof Chart) {
        window.teamStatsChart.destroy();
    }
    
    window.teamStatsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Offensive Rating', 'Defensive Rating (Inv)', 'Net Rating', 'Win %', 'Pace'],
            datasets: [
                {
                    label: selectedTeam1.team,
                    data: [
                        selectedTeam1.offRating,
                        120 - selectedTeam1.defRating, // Invert defensive rating (lower is better)
                        selectedTeam1.netRating + 20, // Adjust for visualization
                        selectedTeam1.winPct * 100,
                        selectedTeam1.pace
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                },
                {
                    label: selectedTeam2.team,
                    data: [
                        selectedTeam2.offRating,
                        120 - selectedTeam2.defRating,
                        selectedTeam2.netRating + 20,
                        selectedTeam2.winPct * 100,
                        selectedTeam2.pace
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Team Performance Comparison'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 120
                }
            }
        }
    });
}

// Create win/loss chart
function createWinLossChart() {
    const ctx = document.getElementById('win-loss-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.winLossChart instanceof Chart) {
        window.winLossChart.destroy();
    }
    
    window.winLossChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [
                {
                    label: selectedTeam1.team,
                    data: [selectedTeam1.wins, selectedTeam1.losses],
                    backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                    borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
                    borderWidth: 1
                },
                {
                    label: selectedTeam2.team,
                    data: [selectedTeam2.wins, selectedTeam2.losses],
                    backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
                    borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Win-Loss Comparison'
                },
                legend: {
                    position: 'top'
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value,
                    font: {
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Games'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}