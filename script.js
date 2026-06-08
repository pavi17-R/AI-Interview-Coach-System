/**
 * AI Interview Coach — Frontend Logic
 * =====================================
 * Handles:
 * - Topic switching
 * - Submitting answers to Flask backend
 * - Displaying AI evaluation results
 */

// -------------------------------------------------------
// Questions map (mirrors backend)
// -------------------------------------------------------
const QUESTIONS = {
  ml:            "Explain Machine Learning in simple terms.",
  python:        "What are Python decorators and how do you use them?",
  java:          "Explain Object-Oriented Programming concepts in Java.",
  hr:            "Tell me about yourself and your greatest professional strength.",
  dsa:           "Explain the difference between a Stack and a Queue with real-life examples.",
  system_design: "How would you design a URL shortener like bit.ly?"
};

const TOPIC_LABELS = {
  ml: "ML", python: "Python", java: "Java",
  hr: "HR", dsa: "DSA", system_design: "SysDesign"
};

let currentTopic = "ml"; // default topic

// -------------------------------------------------------
// DOM Ready
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Character counter on textarea
  document.getElementById("answerBox").addEventListener("input", function () {
    document.getElementById("charCount").textContent =
      `${this.value.length} characters`;
  });

  // Topic buttons
  document.querySelectorAll(".topic-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Update active state
      document.querySelectorAll(".topic-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Switch topic
      currentTopic = btn.dataset.topic;
      document.getElementById("questionText").textContent = QUESTIONS[currentTopic];
      document.getElementById("topicBadge").textContent = TOPIC_LABELS[currentTopic];

      // Hide old results
      hideResults();
    });
  });
});

// -------------------------------------------------------
// Submit Answer — main function
// -------------------------------------------------------
async function submitAnswer() {
  const answer = document.getElementById("answerBox").value.trim();

  // Validate
  if (!answer) {
    showError("Please type your answer before submitting.");
    return;
  }
  if (answer.length < 20) {
    showError("Your answer is too short. Please provide a more detailed response.");
    return;
  }

  // Show loading state
  setLoading(true);
  hideResults();

  try {
    // Send POST request to Flask backend
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: answer,
        topic: currentTopic
      })
    });

    const data = await response.json();

    // Handle server error
    if (!response.ok || data.error) {
      showError(data.error || "Something went wrong. Please try again.");
      return;
    }

    // Display results
    displayResults(data);

  } catch (err) {
    showError("Network error: Could not reach the server. Is Flask running?");
  } finally {
    setLoading(false);
  }
}

// -------------------------------------------------------
// Display AI Results
// -------------------------------------------------------
function displayResults(data) {
  // --- Score ---
  const score = data.score || 0;
  document.getElementById("scoreNum").textContent  = score;
  document.getElementById("scoreGrade").textContent = data.grade || gradeFromScore(score);

  // Animated score bar
  const pct = (score / 10) * 100;
  document.getElementById("scoreBar").style.width = "0%";
  setTimeout(() => {
    document.getElementById("scoreBar").style.width = pct + "%";
  }, 100);

  // Color-code score circle based on score
  const circle = document.getElementById("scoreCircle");
  const scoreEl = document.getElementById("scoreNum");
  circle.style.borderColor = scoreColor(score);
  scoreEl.style.color = scoreColor(score);
  document.getElementById("scoreGrade").style.color = scoreColor(score);
  document.getElementById("scoreBar").style.background = scoreColor(score);

  // --- Strengths ---
  const strengthsList = document.getElementById("strengthsList");
  strengthsList.innerHTML = "";
  strengthsList.className = "eval-list strengths-list";
  (data.strengths || []).forEach(s => {
    const li = document.createElement("li");
    li.textContent = "✓  " + s;
    strengthsList.appendChild(li);
  });

  // --- Weaknesses ---
  const weaknessesList = document.getElementById("weaknessesList");
  weaknessesList.innerHTML = "";
  weaknessesList.className = "eval-list weaknesses-list";
  (data.weaknesses || []).forEach(w => {
    const li = document.createElement("li");
    li.textContent = "→  " + w;
    weaknessesList.appendChild(li);
  });

  // --- Improvements ---
  document.getElementById("improvementsText").textContent =
    data.improvements || "No specific suggestions provided.";

  // --- Ideal Answer ---
  document.getElementById("idealAnswerText").textContent =
    data.ideal_answer || "No ideal answer provided.";

  // Show result card with animation
  const resultCard = document.getElementById("resultCard");
  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Hide error card
  document.getElementById("errorCard").style.display = "none";
}

// -------------------------------------------------------
// Helper: color based on score
// -------------------------------------------------------
function scoreColor(score) {
  if (score >= 8) return "#3dd68c";   // green
  if (score >= 6) return "#f0c040";   // yellow
  if (score >= 4) return "#e07b30";   // orange
  return "#f06060";                    // red
}

function gradeFromScore(score) {
  if (score >= 9) return "A+";
  if (score >= 8) return "A";
  if (score >= 7) return "B+";
  if (score >= 6) return "B";
  if (score >= 5) return "C";
  if (score >= 4) return "D";
  return "F";
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function setLoading(isLoading) {
  const btn = document.getElementById("submitBtn");
  const loadingCard = document.getElementById("loadingCard");

  btn.disabled = isLoading;
  document.getElementById("btnText").textContent =
    isLoading ? "Evaluating..." : "Evaluate My Answer →";
  loadingCard.style.display = isLoading ? "flex" : "none";
}

function showError(msg) {
  document.getElementById("errorCard").style.display = "block";
  document.getElementById("errorText").textContent = msg;
  document.getElementById("resultCard").style.display = "none";
}

function hideResults() {
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorCard").style.display = "none";
  document.getElementById("loadingCard").style.display = "none";
}

function resetForm() {
  document.getElementById("answerBox").value = "";
  document.getElementById("charCount").textContent = "0 characters";
  hideResults();
  document.getElementById("answerBox").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
