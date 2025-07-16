const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('Full_BR_Top_100_NBA_Players.json', 'utf8'));

function extractNumber(str, pattern) {
    const match = str.match(pattern);
    return match ? parseInt(match[1], 10) : 0;
}

const playersData = raw.map(player => {
    const awards = player.Awards || "";
    return {
        rank: player["Rank"],
        name: player["Player Name"],
        position: "", // You may need to fill this manually or with another source
        era: "",      // You may need to fill this manually or with another source
        careerSpan: "", // You may need to fill this manually or with another source
        ppg: 0,       // Not available in your file
        rpg: 0,       // Not available in your file
        apg: 0,       // Not available in your file
        trueShooting: 0, // Not available in your file
        championships: extractNumber(awards, /(\d+)× NBA Champion/),
        mvps: extractNumber(awards, /(\d+)× NBA MVP/),
        allStars: extractNumber(awards, /(\d+)× All[\-\u2011]Star/),
        careerLength: 0, // Not available in your file
        teams: [] // Not available in your file
    };
});

fs.writeFileSync('playersData.js', 'const playersData = ' + JSON.stringify(playersData, null, 2) + ';');
console.log('Conversion complete. Check playersData.js for output.');