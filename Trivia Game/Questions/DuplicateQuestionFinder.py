import json
from collections import Counter

def check_duplicate_questions(file_path):
    """Check for duplicate questions in the JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Extract all questions
        questions = [entry['question'] for entry in data]
        
        # Count occurrences of each question
        question_counts = Counter(questions)
        
        # Find duplicates
        duplicates = {question: count for question, count in question_counts.items() if count > 1}
        
        if duplicates:
            print("Duplicate questions found:")
            for question, count in duplicates.items():
                print(f"'{question}' appears {count} times.")
        else:
            print("No duplicate questions found.")
    
    except Exception as e:
        print(f"Error: {e}")

# Path to your JSON file
file_path = r"Data\AllQuestions.json"
check_duplicate_questions(file_path)