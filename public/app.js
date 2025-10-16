// ---------- GLOBALS ---------- //
let app;

// ---------- UTILITIES ---------- //
function show(html) {
  app.innerHTML = html;
}

function loadingScreen(msg = "Loading...") {
  show(`
    <div class="center">
      <div class="loader"></div>
      <p>${msg}</p>
    </div>
  `);
}

// ---------- LOGIN ---------- //
function loginScreen() {
  show(`
    <div class="card login">
      <h2>Sign in to Quantum Pay</h2>
      <p class="sub">Secure account access powered by Mastercard</p>
      <input id="user" placeholder="Username" />
      <input id="pass" placeholder="Password" type="password" />
      <button id="loginBtn">Login</button>
    </div>
  `);

  document.getElementById("loginBtn
