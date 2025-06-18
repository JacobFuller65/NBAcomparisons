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
                            labels: ['Field Goal %', 'Three-Point %', 'Free Throw %', 'True Shooting %'],
                            datasets: [
                                {
                                    label: `${player1} (${year1})`,
                                    data: [
                                        stats1.FG_Percentage * 100 || 0,
                                        stats1.ThreeP_Percentage * 100 || 0,
                                        stats1.FT_Percentage * 100 || 0,
                                        stats1.TS_Percentage * 100 || 0 // Add TS%
                                    ],
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: `${player2} (${year2})`,
                                    data: [
                                        stats2.FG_Percentage * 100 || 0,
                                        stats2.ThreeP_Percentage * 100 || 0,
                                        stats2.FT_Percentage * 100 || 0,
                                        stats2.TS_Percentage * 100 || 0 // Add TS%
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
                                    formatter: (value) => `${value.toFixed(1)}%`,
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
                                        text: 'Percentage (%)'
                                    }
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