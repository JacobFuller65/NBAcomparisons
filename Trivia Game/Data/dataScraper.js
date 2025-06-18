const fs = require('fs'); // File system module for saving data
const fetch = require('node-fetch');

async function fetchLeaders(stat = 'PTS') {
  const url = `https://stats.nba.com/stats/leagueLeaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2024-25&SeasonType=Regular+Season&StatCategory=${stat}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-nba-stats-origin': 'stats',
        'x-nba-st-token': 'true',
        'Referer': 'https://www.nba.com/',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = await res.json();

    if (data.resultSet && data.resultSet.rowSet) {
      const players = data.resultSet.rowSet.map(row => ({
        name: row[2],
        team: row[3],
        stat: row[4] // Points per game for "PTS"
      }));

      // Save to a JSON file
      fs.writeFileSync('leaders.json', JSON.stringify(players, null, 2));
      console.log('Data saved to leaders.json');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchLeaders('PTS');
