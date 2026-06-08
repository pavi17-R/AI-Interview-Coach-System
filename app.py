"""
AI Interview Coach - Flask Backend
===================================
This is the main server file. It handles:
1. Serving the HTML page
2. Receiving user answers
3. Calling OpenAI GPT-4o-mini API
4. Returning structured evaluation
"""

from flask import Flask, request, jsonify, render_template
from openai import OpenAI
import json
import os

# -------------------------------------------------------
# 🔑 ADD YOUR OPENAI API KEY HERE
# -------------------------------------------------------
# Option 1: Paste it directly (for quick testing)
OPENAI_API_KEY = "sk-your-openai-api-key-here"

# Option 2 (Recommended): Set it as an environment variable
# Run in terminal: export OPENAI_API_KEY="sk-your-key"
# Then this line will pick it up automatically:
if os.environ.get("OPENAI_API_KEY"):
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
# -------------------------------------------------------

# Create Flask app
app = Flask(__name__)

# Create OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# -------------------------------------------------------
# Interview Questions for each topic
# -------------------------------------------------------
QUESTIONS = {
    "ml": "Explain Machine Learning in simple terms.",
    "python": "What are Python decorators and how do you use them?",
    "java": "Explain Object-Oriented Programming concepts in Java.",
    "hr": "Tell me about yourself and your greatest professional strength.",
    "dsa": "Explain the difference between a Stack and a Queue with real-life examples.",
    "system_design": "How would you design a URL shortener like bit.ly?"
}

# -------------------------------------------------------
# HOME ROUTE — serves the HTML page
# -------------------------------------------------------
@app.route("/")
def home():
    return render_template("index.html")

# -------------------------------------------------------
# /ask ROUTE — receives answer and returns AI evaluation
# -------------------------------------------------------
@app.route("/ask", methods=["POST"])
def ask():
    try:
        # Get data from the frontend
        data = request.get_json()
        user_answer = data.get("answer", "").strip()
        topic = data.get("topic", "ml").strip()

        # Validate input
        if not user_answer:
            return jsonify({"error": "Please provide an answer."}), 400

        # Get the correct question for the topic
        question = QUESTIONS.get(topic, QUESTIONS["ml"])

        # -----------------------------------------------
        # Build the AI prompt
        # -----------------------------------------------
        system_prompt = """You are an expert technical interviewer with 15+ years of experience at top tech companies like Google, Amazon, and Microsoft.

Your job is to evaluate interview answers strictly but fairly.

When evaluating, consider:
- Accuracy and correctness of technical facts
- Clarity and structure of the explanation
- Use of real-world examples
- Depth of understanding
- Communication quality

You MUST respond ONLY with a valid JSON object in this exact format (no extra text, no markdown):
{
  "score": <number from 1 to 10>,
  "grade": "<A/B/C/D/F>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": "<specific actionable advice in 2-3 sentences>",
  "ideal_answer": "<the best possible answer to the question in 4-6 sentences>"
}"""

        user_message = f"""Interview Question: {question}

Candidate's Answer: {user_answer}

Please evaluate this answer and respond with the JSON format specified."""

        # -----------------------------------------------
        # Call OpenAI GPT-4o-mini API
        # -----------------------------------------------
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.4,   # Lower = more consistent evaluation
            max_tokens=1000
        )

        # Extract the AI's response text
        ai_text = response.choices[0].message.content.strip()

        # Parse the JSON response from AI
        try:
            # Remove any markdown code fences if present
            if "```" in ai_text:
                ai_text = ai_text.split("```")[1]
                if ai_text.startswith("json"):
                    ai_text = ai_text[4:]
            
            evaluation = json.loads(ai_text)
        except json.JSONDecodeError:
            # If AI didn't return valid JSON, return error
            return jsonify({"error": "AI response parsing failed. Please try again."}), 500

        # Add question to response so frontend can display it
        evaluation["question"] = question

        return jsonify(evaluation)

    except Exception as e:
        # Return error message for any unexpected errors
        error_message = str(e)
        if "api_key" in error_message.lower() or "authentication" in error_message.lower():
            return jsonify({"error": "❌ Invalid OpenAI API Key. Please check your key in app.py"}), 401
        return jsonify({"error": f"Server error: {error_message}"}), 500


# -------------------------------------------------------
# Run the Flask app
# -------------------------------------------------------
if __name__ == "__main__":
    print("🧠 AI Interview Coach is starting...")
    print("📌 Open your browser and go to: http://localhost:5000")
    print("⚠️  Make sure your OpenAI API Key is set in app.py or as env variable!")
    app.run(debug=True, port=5000)
