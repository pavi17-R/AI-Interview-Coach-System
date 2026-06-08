# 🧠 AI Interview Coach

An AI-powered interview preparation app built with **Flask + GPT-4o-mini**.

---

## 📁 Folder Structure

```
ai-interview-coach/
├── app.py                  ← Flask backend (main server)
├── requirements.txt        ← Python dependencies
├── templates/
│   └── index.html          ← Frontend HTML page
└── static/
    ├── style.css           ← Styles
    └── script.js           ← Frontend logic
```

---

## ⚙️ Setup Instructions (Step-by-Step)

### Step 1 — Make sure Python is installed
```bash
python --version   # Should be 3.8+
```

### Step 2 — Create a virtual environment (recommended)
```bash
cd ai-interview-coach
python -m venv venv

# Activate it:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### Step 3 — Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4 — Add your OpenAI API Key

**Option A (quick):** Open `app.py` and replace:
```python
OPENAI_API_KEY = "sk-your-openai-api-key-here"
```
with your actual key:
```python
OPENAI_API_KEY = "sk-proj-xxxxxxxxxxxxxxxxxxxx"
```

**Option B (recommended, more secure):** Set an environment variable:
```bash
# Mac/Linux:
export OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxx"

# Windows:
set OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

👉 Get your key at: https://platform.openai.com/api-keys

### Step 5 — Run the app
```bash
python app.py
```

### Step 6 — Open in browser
Go to: **http://localhost:5000**

---

## 🎯 Features

- 6 topic categories: ML, Python, Java, HR, DSA, System Design
- AI evaluation with score (1–10), grade (A/B/C/D/F)
- Strengths and weaknesses breakdown
- Actionable improvement tips
- Ideal answer from GPT-4o-mini

---

## 🔑 Where is the API key?

In `app.py`, line 18:
```python
OPENAI_API_KEY = "sk-your-openai-api-key-here"
```

---

## ❓ Common Issues

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: flask` | Run `pip install -r requirements.txt` |
| `Invalid API key` | Double-check your OpenAI key in app.py |
| Port already in use | Change `port=5000` to `port=5001` in app.py |
| Blank page | Make sure you ran `python app.py` and opened localhost:5000 |
