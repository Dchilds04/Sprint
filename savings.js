const apiUrl = "https://sprint-nn2e.onrender.com";

let currentMonth = new Date();
const monthDisplay = document.getElementById("month-display");
const form = document.getElementById("savings-form");
const ctx = document.getElementById("savings-chart").getContext("2d");
let chart;

function formatMonth(date) {
  return date.toISOString().slice(0, 7);
}

function updateMonthDisplay() {
  monthDisplay.textContent = formatMonth(currentMonth);
  loadSavings();
}

function changeMonth(delta) {
  currentMonth.setMonth(currentMonth.getMonth() + delta);
  updateMonthDisplay();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const goal = document.getElementById("goal").value;
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;

  await fetch(`${apiUrl}/savings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ goal, amount, date })
  });

  e.target.reset();
  loadSavings();
});

async function loadSavings() {
  const token = localStorage.getItem("token");
  const month = formatMonth(currentMonth);

  const res = await fetch(`${apiUrl}/savings?month=${month}`, {
    headers: { "Authorization": token }
  });
  const savings = await res.json();

  const dataByGoal = {};
  savings.forEach(s => {
    dataByGoal[s.goal] = (dataByGoal[s.goal] || 0) + parseFloat(s.amount);
  });

  const labels = Object.keys(dataByGoal);
  const data = labels.map(l => dataByGoal[l]);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Savings Breakdown',
        data,
        backgroundColor: [
          '#4caf50', '#ffeb3b', '#ff9800', '#2196f3', '#9c27b0', '#f44336'
        ]
      }]
    }
  });
}

updateMonthDisplay();
