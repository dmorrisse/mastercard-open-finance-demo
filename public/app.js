const app = document.getElementById("app");

// ---------- UTILITIES ---------- //
function show(html) {
  app.innerHTML = html;
}

function loadingScreen(msg = "Loading...") {
  show(`<div class="center"><div class="loader"></div><p>${msg}</p></div>`);
}

// ---------- LOGIN ---------- //
function loginScreen() {
  show(`
    <div class="card">
      <h2>Welcome to Quantum Pay</h2>
      <input id="user" placeholder="Username" />
      <input id="pass" placeholder="Password" type="password" />
      <button id="loginBtn">Login</button>
    </div>
  `);

  document.getElementById("loginBtn").onclick = () => {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!user || !pass) {
      alert("Please enter login details");
      return;
    }

    loadingScreen("Signing you in...");
    setTimeout(h


