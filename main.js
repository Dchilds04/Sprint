const apiUrl = "https://your-render-url.onrender.com"; // update to your Render URL

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("index.html") || path === "/") {
    // Register
    document.getElementById("register-form").addEventListener("submit", async e => {
      e.preventDefault();
      const u = document.getElementById("register-username").value;
      const p = document.getElementById("register-password").value;
      const res = await fetch(`${apiUrl}/register`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ username:u, password:p })
      });
      alert(res.ok ? "Registered! Please log in." : (await res.json()).error);
    });

    // Login
    document.getElementById("login-form").addEventListener("submit", async e => {
      e.preventDefault();
      const u = document.getElementById("login-username").value;
      const p = document.getElementById("login-password").value;
      const res = await fetch(`${apiUrl}/login`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ username:u, password:p })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else {
        alert(data.error);
      }
    });

  } else if (path.endsWith("dashboard.html")) {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    // Logout
    document.getElementById("logout-btn").onclick = () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    };

    // Add Expense
    document.getElementById("expense-form").addEventListener("submit", async e => {
      e.preventDefault();
      const name = document.getElementById("expense-name").value;
      const amount = document.getElementById("expense-amount").value;
      const date = document.getElementById("expense-date").value;
      await fetch(`${apiUrl}/expenses`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization": token
        },
        body: JSON.stringify({ name, amount, date })
      });
      e.target.reset();
      loadDashboard();
    });

    const ctx = document.getElementById("expenses-chart").getContext("2d");
    let chart;

    async function loadDashboard() {
      // Fetch expenses
      const expRes = await fetch(`${apiUrl}/expenses`, {
        headers:{ "Authorization": token }
      });
      const expenses = await expRes.json();

      // Group totals by month
      const totals = {};
      expenses.forEach(e => {
        const m = e.date.slice(0,7);
        totals[m] = (totals[m]||0) + e.amount;
      });

      const labels = Object.keys(totals).sort();
      const data   = labels.map(m => totals[m]);

      // Render list
      document.getElementById("expenses-list").innerHTML =
        `<h2>Monthly Totals</h2><ul>` +
        labels.map((m,i) => `<li>${m}: $${data[i].toFixed(2)}</li>`).join('') +
        `</ul>`;

      // Render chart
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'pie',
        data: { labels, datasets:[{ data }] }
      });

      // Fetch achievements
      const achRes = await fetch(`${apiUrl}/achievements`, {
        headers:{ "Authorization": token }
      });
      const achs = await achRes.json();
      document.getElementById("achievements-list").innerHTML =
        achs.map(a => `<li><strong>${a.name}</strong>: ${a.description}</li>`).join('');
    }

    loadDashboard();
  }
});
