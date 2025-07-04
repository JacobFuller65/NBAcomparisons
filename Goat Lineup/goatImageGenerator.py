import json
import re

def make_bref_code(name):
    # Split name into first and last
    parts = name.lower().replace("'", "").replace(".", "").split()
    if len(parts) < 2:
        return None
    first, last = parts[0], parts[-1]
    # Remove non-alpha chars
    first = re.sub(r'[^a-z]', '', first)
    last = re.sub(r'[^a-z]', '', last)
    # Build code: first 5 of last, first 2 of first, '01'
    code = (last[:5] + first[:2] + '01')
    return code

with open('Goat Lineup/goatPlayers.json', encoding='utf-8') as f:
    players = json.load(f)

for player in players:
    code = make_bref_code(player['name'])
    if code:
        player['img'] = f"https://www.basketball-reference.com/req/202106291/images/players/{code}.jpg"
    else:
        player['img'] = ""

with open('Goat Lineup/goatPlayers_with_img.json', 'w', encoding='utf-8') as f:
    json.dump(players, f, indent=2)