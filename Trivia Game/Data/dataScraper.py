import random
import json
import requests

def fetch_leaders(stat='PTS'):
    url = f'https://stats.nba.com/stats/leagueLeaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2024-25&SeasonType=Regular+Season&StatCategory={stat}'
    
    headers = {
        'Accept': 'application/json',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true',
        'Referer': 'https://www.nba.com/',
        'User-Agent': 'Mozilla/5.0'
    }
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        result_set = data.get('resultSet', {})
        headers_list = result_set.get('headers', [])
        rows = result_set.get('rowSet', [])

        # Find indexes dynamically for safe extraction
        player_idx = headers_list.index('PLAYER')
        team_idx = headers_list.index('TEAM')
        stat_idx = headers_list.index(stat)

        leaders = [
            {
                'name': row[player_idx],
                'team': row[team_idx],
                'stat': row[stat_idx]
            }
            for row in rows
        ]

        return leaders

    except Exception as e:
        print(f'Error fetching data: {e}')
        return []

def build_trivia_questions(stats=['PTS', 'REB', 'AST']):
    questions = []
    for stat in stats:
        leaders = fetch_leaders(stat)
        if not leaders:
            continue

        # Generate a trivia question for the top player
        top_player = leaders[0]
        question = {
            'question': f"Who is the current leader in {stat} per game?",
            'correct_answer': top_player['name'],
            'choices': [top_player['name']] + random.sample(
                [player['name'] for player in leaders[1:5]], 3
            )
        }
        random.shuffle(question['choices'])  # Shuffle the choices
        questions.append(question)

    return questions

# Example usage
if __name__ == "__main__":
    trivia_questions = build_trivia_questions(['PTS', 'REB', 'AST'])
    with open('trivia_questions.json', 'w') as f:
        json.dump(trivia_questions, f, indent=2)
    print("Trivia questions saved to trivia_questions.json")
