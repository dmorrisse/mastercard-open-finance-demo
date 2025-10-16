const app = document.getElementById("app");

// Utility: show a new screen
function show(html) {
  app.innerHTML = html;
}

// Utility: loading spinner
function loadingScreen(msg = "Loading...") {
  show(`<div class="center"><div class="loader"></div><p>${msg}</p></div>`);
}

// --- LOGIN --- //
function loginScreen() {
  show(`
    <div class="card">
      <h2>Welcome to Quantum Pay</h2>
      <input id="user" placeholder="Username">
      <input id="pass" placeholder="Password" type="password">
      <button id="loginBtn">Login</button>
    </div>
  `);

  document.getElementById("loginBtn").onclick = () => {
    loadingScreen("Signing you in...");
    setTimeout(homeScreen, 800);
  };
}

// --- HOME --- //
function homeScreen() {
  show(`
    <div class="card">
      <h2>Welcome!</h2>
      <p>Get started by connecting your accounts.</p>
      <button id="connectBank">Connect your Bank Account</button>
    </div>
  `);

  document.getElementById("connectBank").onclick = () => {
    loadingScreen("Preparing Mastercard Data Connect...");
    setTimeout(mastercardConsent, 1000);
  };
}

// --- Mastercard Consent Screen --- //
function mastercardConsent() {
  show(`
    <div class="card consent">
      <div class="icons">📱💳🏦</div>
      <h3>Quantum Pay uses <b>Mastercard Data Connect</b></h3>
      <p>Your data will be securely accessed and shared with your permission.</p>
      <button id="nextBtn">Next</button>
      <p class="footer">Secured by <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" height="20"/></p>
    </div>
  `);
  document.getElementById("nextBtn").onclick = bankSelect;
}

// --- BANK SELECTION --- //
function bankSelect() {
  show(`
    <div class="card">
      <h3>Select your bank</h3>
      <div class="bank-grid">
        <button class="bank" id="partner">Partner Bank</button>
        <button class="bank" id="chase">Chase</button>
        <button class="bank" id="boa">Bank of America</button>
      </div>
    </div>
  `);

  document.getElementById("partner").onclick = () => connectBank("partnerbank-connect");
  document.getElementById("chase").onclick = () => connectBank("chase-connect");
  document.getElementById("boa").onclick = validatedBank;
}

// --- API CONNECT --- //
async function connectBank(api) {
  loadingScreen("Connecting to your bank...");
  try {
    const res = await fetch(`/api/${api}`);
    if (!res.ok) throw new Error(`API ${api} returned ${res.status}`);
    const data = await res.json();
    if (api.includes("chase")) validatedBank();
  } catch (err) {
    console.error("❌ Connection error:", err);
    show(`
      <div class="card error">
        <h3>Connection Failed</h3>
        <p>We couldn’t complete your connection. (${err.message})</p>
        <button id="retryBtn">Try Again</button>
      </div>
    `);
    document.getElementById("retryBtn").onclick = bankSelect;
    throw err; // this ensures Quantum Metric sees a real exception
  }
}

// --- SUCCESS --- //
function validatedBank() {
  show(`
    <div class="card">
      <h3>✅ Bank Connected Successfully</h3>
      <p>Your Chase account has been linked to Quantum Pay.</p>
      <button id="continueBtn">Continue</button>
    </div>
  `);
  document.getElementById("continueBtn").onclick = activityFeed;
}

// --- ACTIVITY FEED --- //
async function activityFeed() {
  loadingScreen("Loading your recent activity...");
  const res = await fetch("/api/activity-feed");
  const data = await res.json();

  const items = data
    .map(
      (t) => `
      <div class="txn">
        <b>You</b> paid <b>${t.user}</b> $${t.amount} for ${t.desc}
      </div>`
    )
    .join("");

  show(`
    <div class="card">
      <h3>Your Activity</h3>
      ${items}
      <button onclick="homeScreen()">Back Home</button>
    </div>
  `);
}

// --- INIT --- //
loginScreen();
