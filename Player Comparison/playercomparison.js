let playerData = {};

        // Load player data from JSON file
        async function loadPlayerData() {
            try {
                const response = await fetch('player-data.json'); // Adjust the path as necessary
                playerData = await response.json();
                console.log('Player Data Loaded:', playerData); // Debugging line
                populatePlayers();
            } catch (error) {
                console.error('Error loading player data:', error);
            }
        }

        // Hardcoded player data
        const years = ["2021", "2022"]; // Predefined years

        // Populate player dropdowns dynamically
        function populatePlayers() {
            const player1Select = document.getElementById('player1-select');
            const player2Select = document.getElementById('player2-select');

            // Clear existing options
            player1Select.innerHTML = '<option value="">--Choose a Player--</option>';
            player2Select.innerHTML = '<option value="">--Choose a Player--</option>';

            // Populate the dropdowns with player names
            Object.keys(playerData).forEach(player => {
                const option1 = document.createElement('option');
                option1.value = player;
                option1.textContent = player;

                const option2 = option1.cloneNode(true);

                player1Select.appendChild(option1);
                player2Select.appendChild(option2);
            });
        }

        // Populate year dropdowns based on selected player
        function loadYears(player) {
            const playerSelect = document.getElementById(`${player}-select`).value;
            const yearSelect = document.getElementById(`${player === 'player1' ? 'year1-select' : 'year2-select'}`);

            // Clear existing options
            yearSelect.innerHTML = '<option value="">--Choose a Year--</option>';

            if (playerSelect && playerData[playerSelect]) {
                Object.keys(playerData[playerSelect]).forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });
            }
        }

        // Fetch player stats from local data
        function fetchPlayerStats(player, year) {
            if (playerData[player] && playerData[player][year]) {
                return playerData[player][year];
            } else {
                throw new Error(`No stats found for ${player} in ${year}`);
            }
        }

        async function displayStats() {
            const player1 = document.getElementById('player1-select').value;
            const year1 = document.getElementById('year1-select').value;
            const player2 = document.getElementById('player2-select').value;
            const year2 = document.getElementById('year2-select').value;

            const statsDisplay1 = document.getElementById('stats-display1');
            const statsContent1 = document.getElementById('stats-content1');
            const player1Image = document.getElementById('player1-image');
            const statsDisplay2 = document.getElementById('stats-display2');
            const statsContent2 = document.getElementById('stats-content2');
            const player2Image = document.getElementById('player2-image');

            try {
                let stats1, stats2;

                if (player1 && year1) {
                    stats1 = fetchPlayerStats(player1, year1);

                    // Set the player image
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

                    // Set the player image
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

                    // Destroy the previous chart instance if it exists
                    if (window.comparisonChart instanceof Chart) {
                        window.comparisonChart.destroy();
                    }

                    // Create a new chart with a single y-axis
                    window.comparisonChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Points Per Game', 'Rebounds Per Game', 'Assists Per Game'],
                            datasets: [
                                {
                                    label: `${player1} (${year1})`,
                                    data: [
                                        stats1.PTS || 0,
                                        stats1.TRB || 0,
                                        stats1.AST || 0
                                    ],
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: `${player2} (${year2})`,
                                    data: [
                                        stats2.PTS || 0,
                                        stats2.TRB || 0,
                                        stats2.AST || 0
                                    ],
                                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top'
                                },
                                tooltip: {
                                    enabled: true
                                },
                                datalabels: {
                                    anchor: 'end',
                                    align: 'top',
                                    formatter: (value) => value.toFixed(1),
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
                                        text: 'Stats'
                                    }
                                }
                            }
                        },
                        plugins: [ChartDataLabels] // Enable the Data Labels plugin
                    });

                    // Render the percentage comparison chart
                    const percentageCtx = document.getElementById('percentageComparisonChart').getContext('2d');

                    // Destroy the previous percentage chart instance if it exists
                    if (window.percentageComparisonChart instanceof Chart) {
                        window.percentageComparisonChart.destroy();
                    }

                    // Create a new chart for percentages
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
                                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top'
                                },
                                tooltip: {
                                    enabled: true
                                },
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
                        plugins: [ChartDataLabels] // Enable the Data Labels plugin
                    });
                }
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        }

        // Example: get unique player names from your data
        const playerNames = Object.keys(playerData);
        const searchInput = document.getElementById('player1-search');
        const resultsList = document.getElementById('player1-search-results');
        const playerSelect = document.getElementById('player1-select');

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            resultsList.innerHTML = '';
            if (!query) {
                resultsList.style.display = 'none';
                return;
            }
            const matches = playerNames.filter(name => name.toLowerCase().includes(query));
            matches.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                li.addEventListener('click', function() {
                    searchInput.value = name;
                    resultsList.innerHTML = '';
                    // Set the select dropdown to this player
                    for (let i = 0; i < playerSelect.options.length; i++) {
                        if (playerSelect.options[i].value === name) {
                            playerSelect.selectedIndex = i;
                            break;
                        }
                    }
                    // Trigger any change event or update function
                    playerSelect.dispatchEvent(new Event('change'));
                });
                resultsList.appendChild(li);
            });
            resultsList.style.display = matches.length ? 'block' : 'none';
        });

        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
                resultsList.innerHTML = '';
                resultsList.style.display = 'none';
                console.log("Player 1 Awards:",getCareerAwards(player1));
                console.log("Player 2 Awards:",getCareerAwards(player2));
            }
        });

        // Populate player dropdowns for the first time
        function populatePlayerDropdowns(playerData) {
            // Get unique player names
            const playerNames = Array.isArray(playerData)
                ? [...new Set(playerData.map(d => d.player))]
                : Object.keys(playerData);

            // Clear existing options
            $('#player1-select').empty();
            $('#player2-select').empty();

            // Add a placeholder option
            $('#player1-select').append('<option value="">Select Player 1</option>');
            $('#player2-select').append('<option value="">Select Player 2</option>');

            // Add player options
            playerNames.forEach(name => {
                $('#player1-select').append(`<option value="${name}">${name}</option>`);
                $('#player2-select').append(`<option value="${name}">${name}</option>`);
            });
        }

        // Call loadPlayerData on page load
        loadPlayerData();

        $(document).ready(function() {
            $('#player1-select').select2({
                placeholder: "Search for Player 1",
                allowClear: true
            });
            $('#player2-select').select2({
                placeholder: "Search for Player 2",
                allowClear: true
            });
        });

        console.log(playerNames); // or your array of player names

        function displayAwardsAndAccomplishments(playerData) {
            // Example: playerData.awards = ["MVP (2008)", "All-Star (18x)", ...]
            //          playerData.teamAccomplishments = ["NBA Champion (5x)", ...]
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
    <rect x="14" y="40" width="12" height="6" rx="2" stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
  </svg>`;
        }
        function allstarSVG(filled) {
          return `<svg width="28" height="28" viewBox="0 0 40 40">
    <polygon points="20,5 24,16 36,16 26,23 30,34 20,27 10,34 14,23 4,16 16,16"
      stroke="#bfa14a" stroke-width="3" fill="${filled ? '#bfa14a' : 'none'}"/>
  </svg>`;
        }

        // Example usage: call this after loading player data
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

        function parseAwardsString(awardsStr) {
    // Example: "MVP-1,AS,NBA1"
    const result = {
        championships: 0,
        mvp: 0,
        allnba: 0,
        allstar: 0
    };
    if (!awardsStr) return result;
    const awards = awardsStr.split(',').map(a => a.trim().toUpperCase());
    awards.forEach(a => {
        if (a.startsWith("MVP-")) {
            // Only count if MVP-1 (won MVP)
            if (a === "MVP-1") result.mvp += 1;
        } else if (a === "MVP") {
            result.mvp += 1;
        } else if (a === "AS") {
            result.allstar += 1;
        } else if (a.startsWith("NBA1")) {
            result.allnba += 1;
        } else if (a.startsWith("NBA2")) {
            result.allnba += 1;
        } else if (a.startsWith("NBA3")) {
            result.allnba += 1;
        } else if (a.startsWith("CHAMP") || a === "CHAMPIONSHIP" || a === "NBA CHAMPION") {
            result.championships += 1;
        }
    });
    return result;
}

// For Player 1
//const player1Awards = parseAwardsString(stats1.Awards);
//displayPlayerAwards(player1Awards);

// For Player 2 (if you want to show both)
//const player2Awards = parseAwardsString(stats2.Awards);
//displayPlayerAwards(player2Awards);

function getCareerAwards(playerName) {
    const playerSeasons = playerData[playerName];
    const total = {
        championships: 0,
        mvp: 0,
        allnba: 0,
        allstar: 0
    };
    if (!playerSeasons) return total;
    Object.values(playerSeasons).forEach(season => {
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

if (player1) {
    const player1CareerAwards = getCareerAwards(player1);
    displayPlayerAwards(player1CareerAwards, '-1');
    console.log("Player 1 Awards:",getCareerAwards(player1));
}
if (player2) {
    const player2CareerAwards = getCareerAwards(player2);
    displayPlayerAwards(player2CareerAwards, '-2');
    console.log("Player 2 Awards:",getCareerAwards(player2));
}

