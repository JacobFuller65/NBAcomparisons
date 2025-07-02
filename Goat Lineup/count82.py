import json
from tqdm import tqdm

with open('Goat Lineup/goatPlayers.json', encoding='utf-8') as f:
    players = json.load(f)

def get_players_for_position(pos_key, exclude_names):
    return [p for p in players if pos_key in p["pos"] and p["name"] not in exclude_names]

positions = ["PG", "SG", "SF", "PF", "C"]

# First, count total possible lineups
total_lineups = 0
for pg in get_players_for_position("PG", []):
    for sg in get_players_for_position("SG", [pg["name"]]):
        for sf in get_players_for_position("SF", [pg["name"], sg["name"]]):
            for pf in get_players_for_position("PF", [pg["name"], sg["name"], sf["name"]]):
                for c in get_players_for_position("C", [pg["name"], sg["name"], sf["name"], pf["name"]]):
                    used = {pg["name"], sg["name"], sf["name"], pf["name"], c["name"]}
                    total_lineups += len([sixth for sixth in players if sixth["name"] not in used])

# Now, count 82-0 lineups with a progress bar
count = 0
with tqdm(total=total_lineups, desc="Checking lineups") as pbar:
    for pg in get_players_for_position("PG", []):
        for sg in get_players_for_position("SG", [pg["name"]]):
            for sf in get_players_for_position("SF", [pg["name"], sg["name"]]):
                for pf in get_players_for_position("PF", [pg["name"], sg["name"], sf["name"]]):
                    for c in get_players_for_position("C", [pg["name"], sg["name"], sf["name"], pf["name"]]):
                        used = {pg["name"], sg["name"], sf["name"], pf["name"], c["name"]}
                        for sixth in players:
                            if sixth["name"] in used:
                                continue
                            total = pg["score"] + sg["score"] + sf["score"] + pf["score"] + c["score"] + sixth["score"]
                            if total == 82:
                                count += 1
                            pbar.update(1)

print("Number of 82-0 combinations:", count)
if count > 0:
    print(f"Odds of getting a perfect lineup: 1 in {total_lineups // count}")
else:
    print("Odds of getting a perfect lineup: Impossible")