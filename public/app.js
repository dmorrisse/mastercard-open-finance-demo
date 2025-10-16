// ========== GLOBAL VARIABLES ==========
let app;

// ========== UTILITIES ==========
function show(html) {
  app.innerHTML = html;
}

function loadingScreen(message = "Loading...") {
  show(`
    <div class="center">
      <div class="loader"></div>
      <p>${message}</p>
    </div>
  `);
}

// ========== LOGIN SCREEN ==========
function loginScreen() {
  show(`
    <div class="card login">
      <h2>Sign in to Quantum Pay</h2>
      <input id="user" placeholder="Username" />
      <input id="pass" type="password" placeholder="Password" />
      <button id="loginBtn">Login</button>
    </div>
  `);

  document.getElementById("loginBtn").onclick = () => {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!user || !pass) {
      alert("Please enter your username and password");
      return;
    }

    loadingScreen("Verifying credentials...");
    setTimeout(homeScreen, 1000);
  };
}

// ========== HOME SCREEN ==========
function homeScreen() {
  show(`
    <div class="card home">
      <h2>Welcome to Quantum Pay</h2>
      <p>Link your bank securely using Mastercard Data Connect.</p>
      <button id="connectBank">Connect Your Bank</button>
      <button id="logoutBtn" class="logout">Logout</button>
    </div>
  `);

  document.getElementById("connectBank").onclick = () => {
    loadingScreen("Initializing Mastercard Data Connect...");
    setTimeout(mastercardConsent, 1000);
  };

  document.getElementById("logoutBtn").onclick = loginScreen;
}

// ========== MASTERCARD CONSENT (NEW LAYOUT) ==========
function mastercardConsent() {
  show(`
    <div class="card mc-consent">
      <div class="mc-header">
        <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Phone Icon" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard Icon" />
        <img src="https://cdn-icons-png.flaticon.com/512/639/639365.png" alt="Bank Icon" />
      </div>

      <h2>
        <b>Quantum Pay</b> uses <b>Mastercard Data Connect</b> to link your accounts
      </h2>

      <div class="mc-info">
        <div class="mc-item">
          <img src="https://cdn-icons-png.flaticon.com/512/747/747305.png" alt="Lock Icon" />
          <p>Your data will be securely accessed, processed, and shared</p>
        </div>
        <div class="mc-item">
          <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="Permission Icon" />
          <p>Your data will only be saved and used with your permission</p>
        </div>
      </div>

      <button id="nextBtn">Next</button>

      <div class="mc-footer">
        <p>Secured by</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" />
      </div>
    </div>
  `);

  document.getElementById("nextBtn").onclick = bankSelect;
}


// ========== BANK SELECTION ==========
function bankSelect() {
  show(`
    <div class="card">
      <h3>Select your institution</h3>
      <div class="bank-grid">
        <button class="bank white" id="partner">
          <img src="https://mypartners.bank/wp-content/themes/partnersbank/images/logo.svg" alt="Partner Bank" />
        </button>
        <button class="bank white" id="chase">
          <img src="https://www.logo.wine/a/logo/Chase_Bank/Chase_Bank-Logo.wine.svg" alt="Chase Bank" />
        </button>
        <button class="bank white" id="bofa">
          <img src="https://www.logo.wine/a/logo/Bank_of_America/Bank_of_America-Logo.wine.svg" alt="Bank of America" />
        </button>
        <button class="bank white" id="citi">
          <img src="https://www.logo.wine/a/logo/Citigroup/Citigroup-Logo.wine.svg" alt="Citi Bank" />
        </button>
      </div>
    </div>
  `);

  document.getElementById("partner").onclick = () => connectBank("partnerbank-connect");
  document.getElementById("chase").onclick = () => connectBank("chase-connect");
  document.getElementById("bofa").onclick = validatedBank;
  document.getElementById("citi").onclick = validatedBank;
}

// ========== CONNECT BANK ==========
async function connectBank(api) {
  loadingScreen("Connecting to your bank...");

  try {
    // Simulate backend connection (intentionally fail for Partner Bank)
    const response = await fetch(`/api/${api}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    if (api.includes("chase")) validatedBank();
  } catch (err) {
    console.error("Bank connection failed:", err);

    // Log silent error for QM capture
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: ${api} → ${err.message}`);
    }, 10);

    // User-facing error screen
    show(`
      <div class="card error">
        <h3>Connection Failed</h3>
        <p>We couldn’t complete your connection.</p>
        <button id="retryBtn">Try Again</button>
      </div>
    `);

    document.getElementById("retryBtn").onclick = () => {
      loadingScreen("Reloading bank list...");
      setTimeout(bankSelect, 800);
    };
  }
}

// ========== VALIDATED BANK ==========
function validatedBank() {
  show(`
    <div class="card success">
      <h3>✅ Bank Connected Successfully</h3>
      <p>Your account has been securely linked to Quantum Pay.</p>
      <button id="continueBtn">Continue</button>
    </div>
  `);

  document.getElementById("continueBtn").onclick = activityFeed;
}

// ========== ACTIVITY FEED ==========
async function activityFeed() {
  loadingScreen("Loading your recent activity...");

  try {
    const res = await fetch("/api/activity-feed");
    const data = await res.json();

    const transactions = data
      .map(
        (t) =>
          `<div class="txn"><b>You</b> paid <b>${t.user}</b> $${t.amount} for ${t.desc}</div>`
      )
      .join("");

    show(`
      <div class="card">
        <div class="header">
          <h3>Your Activity</h3>
          <button id="logoutBtn" class="logout">Logout</button>
        </div>
        ${transactions}
        <button id="backBtn">Back Home</button>
      </div>
    `);

    document.getElementById("logoutBtn").onclick = loginScreen;
    document.getElementById("backBtn").onclick = homeScreen;
  } catch (err) {
    console.error("Activity feed error:", err);
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: activity-feed → ${err.message}`);
    }, 5);
  }
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  loginScreen();
});
