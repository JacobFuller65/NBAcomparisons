// NBA Teams data with conference and division information
const NBA_TEAMS = {
    "Atlanta Hawks": { conference: "Eastern", division: "Southeast", abbreviation: "ATL" },
    "Boston Celtics": { conference: "Eastern", division: "Atlantic", abbreviation: "BOS" },
    "Brooklyn Nets": { conference: "Eastern", division: "Atlantic", abbreviation: "BKN" },
    "Charlotte Hornets": { conference: "Eastern", division: "Southeast", abbreviation: "CHA" },
    "Chicago Bulls": { conference: "Eastern", division: "Central", abbreviation: "CHI" },
    "Cleveland Cavaliers": { conference: "Eastern", division: "Central", abbreviation: "CLE" },
    "Dallas Mavericks": { conference: "Western", division: "Southwest", abbreviation: "DAL" },
    "Denver Nuggets": { conference: "Western", division: "Northwest", abbreviation: "DEN" },
    "Detroit Pistons": { conference: "Eastern", division: "Central", abbreviation: "DET" },
    "Golden State Warriors": { conference: "Western", division: "Pacific", abbreviation: "GSW" },
    "Houston Rockets": { conference: "Western", division: "Southwest", abbreviation: "HOU" },
    "Indiana Pacers": { conference: "Eastern", division: "Central", abbreviation: "IND" },
    "Los Angeles Clippers": { conference: "Western", division: "Pacific", abbreviation: "LAC" },
    "Los Angeles Lakers": { conference: "Western", division: "Pacific", abbreviation: "LAL" },
    "Memphis Grizzlies": { conference: "Western", division: "Southwest", abbreviation: "MEM" },
    "Miami Heat": { conference: "Eastern", division: "Southeast", abbreviation: "MIA" },
    "Milwaukee Bucks": { conference: "Eastern", division: "Central", abbreviation: "MIL" },
    "Minnesota Timberwolves": { conference: "Western", division: "Northwest", abbreviation: "MIN" },
    "New Orleans Pelicans": { conference: "Western", division: "Southwest", abbreviation: "NOP" },
    "New York Knicks": { conference: "Eastern", division: "Atlantic", abbreviation: "NYK" },
    "Oklahoma City Thunder": { conference: "Western", division: "Northwest", abbreviation: "OKC" },
    "Orlando Magic": { conference: "Eastern", division: "Southeast", abbreviation: "ORL" },
    "Philadelphia 76ers": { conference: "Eastern", division: "Atlantic", abbreviation: "PHI" },
    "Phoenix Suns": { conference: "Western", division: "Pacific", abbreviation: "PHX" },
    "Portland Trail Blazers": { conference: "Western", division: "Northwest", abbreviation: "POR" },
    "Sacramento Kings": { conference: "Western", division: "Pacific", abbreviation: "SAC" },
    "San Antonio Spurs": { conference: "Western", division: "Southwest", abbreviation: "SAS" },
    "Toronto Raptors": { conference: "Eastern", division: "Atlantic", abbreviation: "TOR" },
    "Utah Jazz": { conference: "Western", division: "Northwest", abbreviation: "UTA" },
    "Washington Wizards": { conference: "Eastern", division: "Southeast", abbreviation: "WAS" }
};

// Sample roster data - in a real application, this would come from an API
const SAMPLE_ROSTERS = {
    "Los Angeles Lakers": [
        { name: "Lebron James", position: "SF", hasPlayerPage: true },
        { name: "Anthony Davis", position: "PF/C", hasPlayerPage: true },
        { name: "Austin Reaves", position: "SG", hasPlayerPage: false },
        { name: "D'Angelo Russell", position: "PG", hasPlayerPage: false },
        { name: "Rui Hachimura", position: "PF", hasPlayerPage: false }
    ],
    "Golden State Warriors": [
        { name: "Stephen Curry", position: "PG", hasPlayerPage: true },
        { name: "Klay Thompson", position: "SG", hasPlayerPage: false },
        { name: "Draymond Green", position: "PF", hasPlayerPage: false },
        { name: "Andrew Wiggins", position: "SF", hasPlayerPage: false },
        { name: "Jonathan Kuminga", position: "PF", hasPlayerPage: false }
    ],
    "Boston Celtics": [
        { name: "Jayson Tatum", position: "SF", hasPlayerPage: true },
        { name: "Jaylen Brown", position: "SG", hasPlayerPage: false },
        { name: "Kristaps Porzingis", position: "C", hasPlayerPage: false },
        { name: "Derrick White", position: "PG", hasPlayerPage: false },
        { name: "Al Horford", position: "C", hasPlayerPage: false }
    ]
};

// Sample team stats - in a real application, this would come from an API
const SAMPLE_STATS = {
    "Los Angeles Lakers": {
        "Points Per Game": "115.2",
        "Rebounds Per Game": "45.8", 
        "Assists Per Game": "26.4",
        "Field Goal %": "47.1%",
        "3-Point %": "35.2%",
        "Record": "23-18"
    },
    "Golden State Warriors": {
        "Points Per Game": "118.6",
        "Rebounds Per Game": "44.2",
        "Assists Per Game": "29.1", 
        "Field Goal %": "46.8%",
        "3-Point %": "37.4%",
        "Record": "21-20"
    },
    "Boston Celtics": {
        "Points Per Game": "120.1",
        "Rebounds Per Game": "46.3",
        "Assists Per Game": "27.8",
        "Field Goal %": "48.2%", 
        "3-Point %": "38.1%",
        "Record": "29-12"
    }
};

// Function to load team listing page
function loadTeamListing() {
    const container = document.getElementById('teams-container');
    if (!container) return;

    const teamsGrid = document.createElement('div');
    teamsGrid.className = 'teams-grid';

    Object.entries(NBA_TEAMS).forEach(([teamName, teamInfo]) => {
        const teamCard = document.createElement('a');
        teamCard.className = 'team-card';
        // Use correct relative path for team pages
        teamCard.href = `./${teamName.replace(/\s+/g, '-').toLowerCase()}.html`;
        
        teamCard.innerHTML = `
            <div class="team-name">${teamName}</div>
            <div class="team-conference">${teamInfo.conference} Conference - ${teamInfo.division} Division</div>
            <div class="team-abbreviation">${teamInfo.abbreviation}</div>
        `;
        
        teamsGrid.appendChild(teamCard);
    });

    container.appendChild(teamsGrid);
}

// Function to load individual team page
function loadTeamPage(teamName) {
    // Load team header
    const headerContainer = document.getElementById('team-header');
    if (headerContainer && NBA_TEAMS[teamName]) {
        const teamInfo = NBA_TEAMS[teamName];
        headerContainer.innerHTML = `
            <h1 class="team-title">${teamName}</h1>
            <div class="team-info">${teamInfo.conference} Conference • ${teamInfo.division} Division</div>
        `;
    }

    // Load roster
    loadRoster(teamName);
    
    // Load stats  
    loadTeamStats(teamName);
    
    // Load scores widget
    loadScoresWidget();
}

// Function to load team roster
function loadRoster(teamName) {
    const rosterContainer = document.getElementById('roster-container');
    if (!rosterContainer) return;

    const roster = SAMPLE_ROSTERS[teamName] || [
        { name: "Player 1", position: "PG", hasPlayerPage: false },
        { name: "Player 2", position: "SG", hasPlayerPage: false },
        { name: "Player 3", position: "SF", hasPlayerPage: false },
        { name: "Player 4", position: "PF", hasPlayerPage: false },
        { name: "Player 5", position: "C", hasPlayerPage: false }
    ];

    const rosterGrid = document.createElement('div');
    rosterGrid.className = 'roster-grid';

    roster.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        const playerName = player.hasPlayerPage ? 
            `<a href="../../Player Comparison/player-comparison.html" class="player-link">${player.name}</a>` :
            player.name;
            
        playerCard.innerHTML = `
            <div>${playerName}</div>
            <div class="player-position">${player.position}</div>
        `;
        
        rosterGrid.appendChild(playerCard);
    });

    rosterContainer.appendChild(rosterGrid);
}

// Function to load team stats
function loadTeamStats(teamName) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    const stats = SAMPLE_STATS[teamName] || {
        "Points Per Game": "N/A",
        "Rebounds Per Game": "N/A", 
        "Assists Per Game": "N/A",
        "Field Goal %": "N/A",
        "3-Point %": "N/A",
        "Record": "N/A"
    };

    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';

    Object.entries(stats).forEach(([label, value]) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.innerHTML = `
            <div class="stat-value">${value}</div>
            <div class="stat-label">${label}</div>
        `;
        statsGrid.appendChild(statItem);
    });

    statsContainer.appendChild(statsGrid);
}

// Function to load scores widget
function loadScoresWidget() {
    const scoresContainer = document.getElementById('scores-container');
    if (!scoresContainer) return;

    // Use 365Scores widget for live scores (same as homepage)
    scoresContainer.innerHTML = `
        <div class="widget-container">
            <div data-widget-type="entityScores" data-entity-type="league" data-entity-id="103" data-lang="en"
                data-widget-id="team-scores-${Date.now()}"></div>
        </div>
    `;

    // Load the widget script if not already loaded
    if (!document.querySelector('script[src*="365scores"]')) {
        const script = document.createElement('script');
        script.src = 'https://widgets.365scores.com/main.js';
        document.head.appendChild(script);
    }
}

// Function to get team name from URL
function getTeamNameFromUrl() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop().replace('.html', '');
    // Fix: handle dashes and capitalization for all NBA team names
    // Special cases for teams with multiple dashes (e.g., trail-blazers, 76ers)
    let name = filename
        .replace(/-/g, ' ')
        .replace(/\b(\d+)/g, match => match) // keep numbers as is
        .replace(/\b\w/g, l => l.toUpperCase());
    // Handle special cases for team names
    if (name === '76Ers') name = '76ers';
    if (name === 'Trail Blazers') name = 'Trail Blazers';
    if (name === 'Timberwolves') name = 'Timberwolves';
    if (name === 'Pelicans') name = 'Pelicans';
    // Try to match to NBA_TEAMS key
    let found = Object.keys(NBA_TEAMS).find(team => team.toLowerCase() === name.toLowerCase());
    if (found) return found;
    // Fallback: try to match by abbreviation
    found = Object.entries(NBA_TEAMS).find(([team, info]) => info.abbreviation.toLowerCase() === filename.toLowerCase());
    if (found) return found[0];
    // Fallback: return name as is
    return name;
}

// Initialize page based on type
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('teams-container')) {
        // Team listing page
        loadTeamListing();
    } else if (document.getElementById('team-header')) {
        // Individual team page
        const teamName = getTeamNameFromUrl();
        loadTeamPage(teamName);
    }
});