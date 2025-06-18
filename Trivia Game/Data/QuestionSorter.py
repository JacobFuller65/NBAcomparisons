import json
import os

def load_existing_questions(file_path):
    """Load existing questions from a file if it exists."""
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        except json.JSONDecodeError:
            print(f"Warning: Failed to decode JSON from {file_path}. Starting with an empty list.")
            return []
    return []

def sort_questions_by_difficulty(file_path, base_output_dir):
    """Sort questions by difficulty and save them to separate directories."""
    try:
        # Load the JSON file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Group questions by difficulty
        difficulties = {}
        for entry in data:
            difficulty = entry.get('difficulty', 'Unknown')  # Default to 'Unknown' if no difficulty is specified
            if difficulty not in difficulties:
                difficulties[difficulty] = []
            difficulties[difficulty].append(entry)
        
        # Write each difficulty group to a separate directory
        for difficulty, questions in difficulties.items():
            difficulty_dir = os.path.join(base_output_dir, difficulty)  # Create a directory for each difficulty
            os.makedirs(difficulty_dir, exist_ok=True)
            
            output_file = os.path.join(difficulty_dir, f"{difficulty}Questions.json")
            
            # Load existing questions and append new ones
            existing_questions = load_existing_questions(output_file)
            all_questions = existing_questions + questions
            
            # Save the combined questions back to the file
            with open(output_file, 'w', encoding='utf-8') as file:
                json.dump(all_questions, file, indent=4, ensure_ascii=False)
            print(f"Appended {len(questions)} questions to {output_file}")
    
    except Exception as e:
        print(f"Error: {e}")

# Path to your JSON file
file_path = r"Data\AllQuestions.json"

# Base directory to save the sorted files
base_output_dir = r"Data\SortedQuestions"

# Call the function
sort_questions_by_difficulty(file_path, base_output_dir)