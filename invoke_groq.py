import sys
import os
import json
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

def initialize_client():
    """Initialize and return the Groq client"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=api_key)

def generate_story_explanation(topic, level, action):
    """Generate a story-based explanation using Groq API"""
    try:
        client = initialize_client()
        
        # Current model configuration
        model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
        
        # Enhanced system prompt
        system_prompt = f"""
        You are StoryLearn AI, an expert educator who explains complex topics through engaging, memorable stories.
        The user wants to learn about: {topic}
        
        Knowledge Level: {level.capitalize()}
        - Beginner: Use simple language with basic concepts
        - Intermediate: Include some technical terms with explanations
        - Advanced: Detailed explanation with proper terminology
        
        Learning Mode: {action.capitalize()}
        - Learn: Clear fundamentals with foundational concepts
        - Revise: Highlight key concepts with practical examples
        - Practice: Include interactive questions or thought experiments
        
        Story Requirements:
        1. Create a compelling narrative with characters/situations that illustrate the concept
        2. Structure with clear beginning, middle, and end
        3. Use real-world analogies where appropriate
        4. Include subtle humor when possible to enhance engagement
        
        Output Format:
        ---
        Title: [Creative Story Title]
        
        [Story Body]
        - Weave explanations naturally into the narrative
        - Use dialogue between characters to explain concepts
        - Include 1-2 visual metaphors (describe them)
        
        Key Takeaways:
        1. [Main concept 1]
        2. [Main concept 2]
        3. [Practical application]
        
        {"" if action != "practice" else "Practice Question:\n- [Thought-provoking question]\n- [Follow-up discussion prompt]"}
        """
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create a {level}-level story to help me {action} the concept of {topic}"}
            ],
            max_tokens=2000,
            temperature=0.7,
            top_p=0.9,
            frequency_penalty=0.2,
            presence_penalty=0.2
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        error_msg = str(e)
        # Handle specific Groq API errors
        if hasattr(e, 'response') and e.response:
            try:
                error_details = e.response.json()
                error_msg = error_details.get('error', {}).get('message', error_msg)
            except:
                pass
        return json.dumps({"error": error_msg})

if __name__ == "__main__":
    try:
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Usage: python invoke_groq.py <topic> <level> <action>"}))
            sys.exit(1)
            
        topic, level, action = sys.argv[1], sys.argv[2], sys.argv[3]
        response = generate_story_explanation(topic, level, action)
        print(response)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)