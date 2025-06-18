import random
import json

def load_data(file_path):
    """Load data from a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:  # Specify UTF-8 encoding
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from {file_path}")
        return []

def generate_dynamic_questions():
    """Dynamically generate NBA trivia questions."""
    # Load players and teams from JSON files
    players = load_data(r"Data/modernNbaPlayers.json")  # Use raw string or forward slashes
    teams = load_data(r"Data/modernNbaTeams.json")
    
    records = [
        "most points scored in a single NBA game",
        "most career assists in NBA history",
        "most NBA championships won by a team",
        "all-time leading scorer in NBA history"
    ]

    # Generate random questions
    questions = []
    for _ in range(5):  # Generate 5 random questions
        record = random.choice(records)
        if "points" in record or "scorer" in record:
            correct_answer = random.choice(players)
        elif "championships" in record:
            correct_answer = random.choice(teams)
        elif "assists" in record:
            correct_answer = random.choice(["John Stockton", "Magic Johnson", "Jason Kidd", "Steve Nash"])
        else:
            correct_answer = random.choice(players + teams)

        # Generate random choices
        choices = random.sample(players + teams, 3)  # Pick 3 random incorrect choices
        if correct_answer not in choices:
            choices.append(correct_answer)
        random.shuffle(choices)  # Shuffle the choices

        # Create the question
        question = {
            "question": f"Who holds the record for {record}?",
            "choices": choices,
            "correct_answer": correct_answer
        }
        questions.append(question)

    return questions

def get_random_question(questions):
    """Select a random question from the list."""
    if not questions:
        print("No questions available.")
        return None
    return random.choice(questions)

def export_question_to_file(question, file_path):
    """Export the question and its choices to a file."""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(f"Q: {question['question']}\n")
            file.write("Choices:\n")
            for idx, choice in enumerate(question['choices'], start=1):
                file.write(f"{idx}. {choice}\n")
            file.write(f"Correct Answer: {question['correct_answer']}\n")
        print(f"Question exported to {file_path}")
    except Exception as e:
        print(f"Error exporting question to file: {e}")

def main():
    # Generate dynamic questions
    questions = generate_dynamic_questions()
    
    # Get a random question
    question = get_random_question(questions)
    
    if question:
        print("Here's your NBA trivia question:")
        print(f"Q: {question['question']}")
        print("Choices:")
        for idx, choice in enumerate(question['choices'], start=1):
            print(f"{idx}. {choice}")
        
        # Export the question to a file
        export_question_to_file(question, "c:\\Users\\Union\\NBA Trivia Game\\NBAtriviaGame\\Data\\output_question.txt")

if __name__ == "__main__":
    main()