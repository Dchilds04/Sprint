const apiUrl = "https://sprint-nn2e.onrender.com";

let currentMonth = new Date();
const monthDisplay = document.getElementById("month-display");
const ctx = document.getElementById("expense-chart").getContext("2d");
let chart;

function formatMonth(date) {
  return date.toISOString().slice(0, 7);
}

function changeMonth(delta) {
  currentMonth.setMonth(currentMonth.getMonth() + delta);
  loadExpenses();
}

window.changeMonth = changeMonth;

async function loadExpenses() {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  const monthStr = formatMonth(currentMonth);
  monthDisplay.textContent = monthStr;

  const res = await fetch(`${apiUrl}/expenses?month=${monthStr}`, {
    headers: { Authorization: token }
  });
  const data = await res.json();

  const categoryTotals = {};
  data.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const values = labels.map(k => categoryTotals[k]);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values }]
    }
  });
}

const form = document.getElementById("expense-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const name = document.getElementById("name").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  await fetch(`${apiUrl}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ name, amount, category, date })
  });

  e.target.reset();
  loadExpenses();
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

loadExpenses();
