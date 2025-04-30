const apiUrl = "https://sprint-nn2e.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html";

  // Load profile info
  fetch(`${apiUrl}/profile`, {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("username-display").textContent = `Username: ${data.username}`;
      document.getElementById("total-expenses").textContent = `$${data.total_expenses.toFixed(2)}`;
      document.getElementById("total-saved").textContent = `$${data.total_saved.toFixed(2)}`;
    });

  // Load achievements
  fetch(`${apiUrl}/achievements`, {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("achievements-list");
      list.innerHTML = "";
      data.forEach(ach => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${ach.name}</strong>: ${ach.description}`;
        list.appendChild(li);
      });
    });
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
