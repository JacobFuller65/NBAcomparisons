const fs = require('fs');
const path = require('path');

const playerDataDir = path.join(__dirname, 'Player Data');
const outputFile = path.join(__dirname, 'player-data.json');

// Load existing player-data.json if it exists
let mergedData = {};
if (fs.existsSync(outputFile)) {
  mergedData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
}

// Read all JSON files in Player Data folder
fs.readdirSync(playerDataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(playerDataDir, file);
    const playerJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // If the file is structured as { "Player Name": { ... } }
    // Use the top-level key as the player name
    if (typeof playerJson === 'object' && !Array.isArray(playerJson)) {
      Object.assign(mergedData, playerJson);
    }
    // If the file is an array or just stats, use the filename (without .json) as the key
    else {
      const playerName = file.replace('.json', '').replace(/_/g, ' ');
      mergedData[playerName] = playerJson;
    }
  }
});

// Write merged data to player-data.json
fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2), 'utf8');
console.log('player-data.json updated!');