// Save this as count82.js and run with: node count82.js
const fs = require('fs');
const players = JSON.parse(fs.readFileSync('Goat Lineup/goatPlayers.json', 'utf8'));

const positions = [
  { key: "PG" },
  { key: "SG" },
  { key: "SF" },
  { key: "PF" },
  { key: "C" }
];

function getPlayersForPosition(posKey, excludeNames = []) {
  return players.filter(p => p.pos.includes(posKey) && !excludeNames.includes(p.name));
}

let count = 0;

for (const pg of getPlayersForPosition("PG")) {
  for (const sg of getPlayersForPosition("SG", [pg.name])) {
    for (const sf of getPlayersForPosition("SF", [pg.name, sg.name])) {
      for (const pf of getPlayersForPosition("PF", [pg.name, sg.name, sf.name])) {
        for (const c of getPlayersForPosition("C", [pg.name, sg.name, sf.name, pf.name])) {
          // 6th man: any player not already chosen
          const used = [pg.name, sg.name, sf.name, pf.name, c.name];
          for (const sixth of players) {
            if (used.includes(sixth.name)) continue;
            const total = pg.score + sg.score + sf.score + pf.score + c.score + sixth.score;
            if (total === 82) {
              count++;
            }
          }
        }
      }
    }
  }
}
console.log("Number of 82-0 combinations:", count);