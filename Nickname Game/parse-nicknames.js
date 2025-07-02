const fs = require('fs');

const text = fs.readFileSync('./Nickname Game/nickname.readme', 'utf8');
const lines = text.split('\n').filter(line => line.trim());

const result = [];

lines.forEach(line => {
  // Remove "No match:" prefix
  line = line.replace(/^No match:\s*/i, '');
  // Remove references like [1], [2], etc.
  line = line.replace(/\[\d+\]/g, '');
  // Remove parenthetical notes
  line = line.replace(/\([^)]*\)/g, '');
  // Match player and nicknames using any dash (en dash, em dash, hyphen, minus, etc.)
  const match = line.match(/^(.+?)\s*[\u2012\u2013\u2014\u2015\-]\s*(.+)$/);
  if (!match) return;
  const player = match[1].trim();
  // Find all quoted nicknames
  let nicknames = [];
  const nicknameRegex = /"([^"]+)"/g;
  let m;
  while ((m = nicknameRegex.exec(match[2])) !== null) {
    nicknames.push(m[1].trim());
  }
  // If no quoted nicknames, try splitting by comma or space
  if (nicknames.length === 0) {
    nicknames = match[2]
      .split(/,|\s+or\s+| and | or /i)
      .map(n => n.replace(/["']/g, '').trim())
      .filter(n => n.length > 0);
  }
  result.push({ player, nicknames });
});

fs.writeFileSync('nicknames.json', JSON.stringify(result, null, 2));
console.log('nicknames.json created!');