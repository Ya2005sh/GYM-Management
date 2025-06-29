document.getElementById('adlogin').addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Hardcoded credentials
  const validUsername = "Yash";
  const validPassword = "1234";

  if (username === validUsername && password === validPassword) {
    alert("Login successful!");
    // Redirect to dashboard
    window.location.href = "admin_dashboard.html";
  } else {
    alert("Invalid username or password.");
  }
  localStorage.setItem("adminLoggedIn", "true");
window.location.href = "admin_dashboard.html";

});
