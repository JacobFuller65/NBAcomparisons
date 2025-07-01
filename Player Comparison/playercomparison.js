let playerData = {};

// Load player data from JSON file
async function loadPlayerData() {
    try {
        const response = await fetch('player-data.json'); // Adjust path if needed
        playerData = await response.json();
        console.log('Player Data Loaded:', playerData);
        populatePlayerDropdowns(playerData);
        // Add event listeners here, now that playerData is loaded
        $('#player1-select').on('change', function() {
            loadYears('player1');
        });
        $('#player2-select').on('change', function() {
            loadYears('player2');
        });
    } catch (error) {
        console.error('Error loading player data:', error);
    }
}

// Populate player dropdowns dynamically (jQuery version)
function populatePlayerDropdowns(playerData) {
    const playerNames = Object.keys(playerData);
    $('#player1-select').empty().append('<option value="">Select Player 1</option>');
    $('#player2-select').empty().append('<option value="">Select Player 2</option>');
    playerNames.forEach(name => {
        $('#player1-select').append(`<option value="${name}">${name}</option>`);
        $('#player2-select').append(`<option value="${name}">${name}</option>`);
    });
}

// Populate year dropdowns based on selected player
function loadYears(player) {
    const playerSelect = $(`#${player}-select`).val();
    const yearSelectId = player === 'player1' ? 'year1-select' : 'year2-select';
    const $yearSelect = $(`#${yearSelectId}`);
    $yearSelect.empty().append('<option value="">--Choose a Year--</option>');
    if (playerSelect && playerData[playerSelect]) {
        const seasons = Array.isArray(playerData[playerSelect])
            ? playerData[playerSelect]
            : Object.values(playerData[playerSelect]);
        seasons.forEach(season => {
            if (season.Season) {
                $yearSelect.append(`<option value="${season.Season}">${season.Season}</option>`);
            }
        });
    }
}

// Fetch player stats from local data
function fetchPlayerStats(player, year) {
    const playerSeasons = playerData[player];
    if (!playerSeasons) throw new Error(`No data for player: ${player}`);
    if (Array.isArray(playerSeasons)) {
        const season = playerSeasons.find(s => s.Season === year || s.season === year);
        if (season) return season;
    } else if (playerSeasons[year]) {
        return playerSeasons[year];
    }
    throw new Error(`No stats found for ${player} in ${year}`);
}

// Display stats and awards for selected players
async function displayStats() {
    const player1 = $('#player1-select').val();
    const year1 = $('#year1-select').val();
    const player2 = $('#player2-select').val();
    const year2 = $('#year2-select').val();

    const statsDisplay1 = document.getElementById('stats-display1');
    const statsContent1 = document.getElementById('stats-content1');
    const player1Image = document.getElementById('player1-image');
    const statsDisplay2 = document.getElementById('stats-display2');
    const statsContent2 = document.getElementById('stats-content2');
    const player2Image = document.getElementById('player2-image');

    // Display career awards for player 1 and player 2
    if (player1) {
        const player1CareerAwards = getCareerAwards(player1);
        displayPlayerAwards(player1CareerAwards, '-1');
    }
    if (player2) {
        const player2CareerAwards = getCareerAwards(player2);
        displayPlayerAwards(player2CareerAwards, '-2');
    }

    try {
        let stats1, stats2;

        if (player1 && year1) {
            stats1 = fetchPlayerStats(player1, year1);
            player1Image.src = `../images/${player1.replace(/ /g, "_")}.jpg`;
            player1Image.alt = `${player1} Image`;
            statsContent1.innerHTML = `
                <strong>${player1} (${year1})</strong><br>
                Age: ${stats1.Age || "N/A"}<br>
                Team: ${stats1.Team || "N/A"}<br>
                Position: ${stats1.Pos || "N/A"}<br>
                Games Played: ${stats1.G || "N/A"}<br>
                Points Per Game: ${stats1.PTS || "N/A"}<br>
                Assists Per Game: ${stats1.AST || "N/A"}<br>
                Rebounds Per Game: ${stats1.TRB || "N/A"}<br>
                Awards: ${stats1.Awards || "N/A"}
            `;
            statsDisplay1.style.display = "block";
        }

        if (player2 && year2) {
            stats2 = fetchPlayerStats(player2, year2);
            player2Image.src = `../images/${player2.replace(/ /g, "_")}.jpg`;
            player2Image.alt = `${player2} Image`;
            statsContent2.innerHTML = `
                <strong>${player2} (${year2})</strong><br>
                Age: ${stats2.Age || "N/A"}<br>
                Team: ${stats2.Team || "N/A"}<br>
                Position: ${stats2.Pos || "N/A"}<br>
                Games Played: ${stats2.G || "N/A"}<br>
                Points Per Game: ${stats2.PTS || "N/A"}<br>
                Assists Per Game: ${stats2.AST || "N/A"}<br>
                Rebounds Per Game: ${stats2.TRB || "N/A"}<br>
                Awards: ${stats2.Awards || "N/A"}
            `;
            statsDisplay2.style.display = "block";
        }

        // Render the main comparison chart
        if (stats1 && stats2) {
            const ctx = document.getElementById('comparisonChart').getContext('2d');
            if (window.comparisonChart instanceof Chart) window.comparisonChart.destroy();
            window.comparisonChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Points Per Game', 'Rebounds Per Game', 'Assists Per Game'],
                    datasets: [
                        {
                            label: `${player1} (${year1})`,
                            data: [stats1.PTS || 0, stats1.TRB || 0, stats1.AST || 0],
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: `${player2} (${year2})`,
                            data: [stats2.PTS || 0, stats2.TRB || 0, stats2.AST || 0],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: value => value.toFixed(1),
                            font: { weight: 'bold' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Stats' }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });

            // Render the percentage comparison chart
            const percentageCtx = document.getElementById('percentageComparisonChart').getContext('2d');
            if (window.percentageComparisonChart instanceof Chart) window.percentageComparisonChart.destroy();
            window.percentageComparisonChart = new Chart(percentageCtx, {
                type: 'bar',
                data: {
                    labels: ['Field Goal %', 'Three-Point %', 'Free Throw %', 'Effective FG %'],
                    datasets: [
                        {
                            label: `${player1} (${year1})`,
                            data: [
                                (stats1["FG%"] || 0) * 100,
                                (stats1["3P%"] || 0) * 100,
                                (stats1["FT%"] || 0) * 100,
                                (stats1["eFG%"] || 0) * 100
                            ],
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: `${player2} (${year2})`,
                            data: [
                                (stats2["FG%"] || 0) * 100,
                                (stats2["3P%"] || 0) * 100,
                                (stats2["FT%"] || 0) * 100,
                                (stats2["eFG%"] || 0) * 100
                            ],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: value => `${value.toFixed(1)}%`,
                            font: { weight: 'bold' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Percentage (%)' }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Awards and accomplishments display (optional, for text lists)
function displayAwardsAndAccomplishments(playerData) {
    const individualList = document.getElementById('individual-awards-list');
    const teamList = document.getElementById('team-accomplishments-list');
    individualList.innerHTML = '';
    teamList.innerHTML = '';
    if (playerData.awards && playerData.awards.length) {
        playerData.awards.forEach(award => {
            const li = document.createElement('li');
            li.textContent = award;
            individualList.appendChild(li);
        });
    } else {
        individualList.innerHTML = '<li>No individual awards found.</li>';
    }
    if (playerData.teamAccomplishments && playerData.teamAccomplishments.length) {
        playerData.teamAccomplishments.forEach(acc => {
            const li = document.createElement('li');
            li.textContent = acc;
            teamList.appendChild(li);
        });
    } else {
        teamList.innerHTML = '<li>No team accomplishments found.</li>';
    }
}

// Render SVG award icons
function renderAwardIcons(containerId, count, max, svgFunc) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 0; i < max; i++) {
        container.innerHTML += svgFunc(i < count);
    }
}

// SVG generators for each award
function championshipSVG(filled) {
    return `<svg width="28" height="40" viewBox="0 0 40 60">
        <circle cx="20" cy="15" r="12" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
        <rect x="12" y="27" width="16" height="18" rx="4" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
        <rect x="16" y="47" width="8" height="8" rx="2" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
    </svg>`;
}
function mvpSVG(filled) {
    return `<svg width="28" height="40" viewBox="0 0 40 60">
        <rect x="10" y="40" width="20" height="10" rx="2" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
        <rect x="16" y="25" width="8" height="15" rx="2" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
        <circle cx="20" cy="18" r="5" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
    </svg>`;
}
function allnbaSVG(filled) {
    return `<svg width="28" height="35" viewBox="0 0 40 50">
        <rect x="8" y="10" width="24" height="30" rx="4" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
    </svg>`;
}
function allstarSVG(filled) {
    return `<svg width="28" height="28" viewBox="0 0 40 40">
        <polygon points="20,5 24,16 36,16 26,23 30,34 20,27 10,34 14,23 4,16 16,16"
            stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
    </svg>`;
}

// Display award icons for a player
function displayPlayerAwards(playerAwards, suffix = '') {
    renderAwardIcons(`championship-icons${suffix}`, playerAwards.championships, 7, championshipSVG);
    document.getElementById(`championship-count${suffix}`).textContent = playerAwards.championships ? `×${playerAwards.championships}` : '';
    renderAwardIcons(`mvp-icons${suffix}`, playerAwards.mvp, 5, mvpSVG);
    document.getElementById(`mvp-count${suffix}`).textContent = playerAwards.mvp ? `×${playerAwards.mvp}` : '';
    renderAwardIcons(`allnba-icons${suffix}`, playerAwards.allnba, 10, allnbaSVG);
    document.getElementById(`allnba-count${suffix}`).textContent = playerAwards.allnba ? `×${playerAwards.allnba}` : '';
    renderAwardIcons(`allstar-icons${suffix}`, playerAwards.allstar, 15, allstarSVG);
    document.getElementById(`allstar-count${suffix}`).textContent = playerAwards.allstar ? `×${playerAwards.allstar}` : '';
}

// Parse awards string for a season
function parseAwardsString(awardsStr) {
    const result = { championships: 0, mvp: 0, allnba: 0, allstar: 0 };
    if (!awardsStr) return result;
    const awards = awardsStr.split(',').map(a => a.trim().toUpperCase());
    awards.forEach(a => {
        if (a.startsWith("MVP-")) {
            if (a === "MVP-1") result.mvp += 1;
        } else if (a === "MVP") {
            result.mvp += 1;
        } else if (a === "AS") {
            result.allstar += 1;
        } else if (a.startsWith("NBA1") || a.startsWith("NBA2") || a.startsWith("NBA3")) {
            result.allnba += 1;
        } else if (a.startsWith("CHAMP") || a === "CHAMPIONSHIP" || a === "NBA CHAMPION") {
            result.championships += 1;
        }
    });
    return result;
}

// Get career totals for a player
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

// Initialize Select2 and set up event listeners
$(document).ready(function () {
    $('#player1-select').select2({
        placeholder: "Search for Player 1",
        allowClear: true
    });
    $('#player2-select').select2({
        placeholder: "Search for Player 2",
        allowClear: true
    });
    // When both player and year are selected, show stats
    $('#player1-select, #year1-select, #player2-select, #year2-select').on('change', displayStats);
});

// Load player data on page load
document.addEventListener('DOMContentLoaded', loadPlayerData);

