let app;

// ===== Utility Functions =====
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

// ===== LOGIN =====
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
    if (!user || !pass) return alert("Please enter credentials");
    loadingScreen("Verifying credentials...");
    setTimeout(homeScreen, 1000);
  };
}

// ===== HOME =====
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

// ===== MASTERCARD CONSENT =====
function mastercardConsent() {
  show(`
    <div class="card mc-consent">
      <div class="mc-header">
        <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Phone Icon" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard Icon" />
        <img src="https://cdn-icons-png.flaticon.com/512/639/639365.png" alt="Bank Icon" />
      </div>
      <h2><b>Quantum Pay</b> uses <b>Mastercard Data Connect</b> to link your accounts</h2>
      <button id="nextBtn">Next</button>
      <div class="mc-footer">
        <p>Secured by</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" height="20" />
      </div>
    </div>
  `);

  document.getElementById("nextBtn").onclick = bankSelect;
}

// ===== BANK SELECTION =====
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
  document.getElementById("bofa").onclick = () => validatedBank("Bank of America");
  document.getElementById("chase").onclick = () => accountReview("Chase");
  document.getElementById("citi").onclick = () => accountReview("Citi");
}

// ===== CONNECT BANK (PartnerBank triggers API 500) =====
async function connectBank(api) {
  loadingScreen("Connecting to your bank...");

  try {
    const response = await fetch(`/api/${api}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (api.includes("chase")) validatedBank("Chase");
  } catch (err) {
    console.error("Bank connection failed:", err);

    // Hidden QM error
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: ${api} → 500 Internal Server Error`);
    }, 10);

    // User view
    show(`
      <div class="card error">
        <h3>Connection Failed</h3>
        <p>We couldn’t complete your connection. Please try again later.</p>
        <button id="retryBtn">Back to Bank Selection</button>
      </div>
    `);

    document.getElementById("retryBtn").onclick = () => {
      loadingScreen("Reloading bank list...");
      setTimeout(bankSelect, 800);
    };
  }
}

// ===== ACCOUNT REVIEW =====
function accountReview(bankName) {
  show(`
    <div class="card mc-consent">
      <h2>Review your connected accounts</h2>
      <p>You’re in control. You’ve successfully shared data with <b>Quantum Pay</b> from the following accounts.</p>
      <div class="feed-item">
        <strong>${bankName} Checking</strong><br />
        <span>Ending in 1234</span><br />
        <span>Balance: $2,700.00</span>
      </div>
      <button id="submitBtn">Submit</button>
      <div class="mc-footer">
        <span>Secured by</span>
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" height="18" />
      </div>
    </div>
  `);

  document.getElementById("submitBtn").onclick = () => {
    if (bankName === "Chase") connectionFailed();
    else connectionSuccess(bankName);
  };
}

// ===== FAIL / SUCCESS =====
function connectionFailed() {
  fetch("/api/chase-connect", { method: "POST" })
    .then((res) => {
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    })
    .catch(() => {
      setTimeout(() => {
        throw new Error("QM_CAPTURED_ERROR: /api/chase-connect → 500 Internal Server Error");
      }, 10);
    });

  show(`
    <div class="card error">
      <h3>Connection Failed</h3>
      <p>We couldn’t complete your connection. Please try again later.</p>
      <button id="retryBtn">Back to Bank Selection</button>
    </div>
  `);

  document.getElementById("retryBtn").onclick = () => {
    loadingScreen("Reloading bank list...");
    setTimeout(bankSelect, 800);
  };
}

function connectionSuccess(bankName) {
  show(`
    <div class="card success mc-consent">
      <h2>Connected Successfully</h2>
      <p>You’ve successfully linked your <b>${bankName}</b> account with Quantum Pay.</p>
      <button id="finishBtn">Finish</button>
    </div>
  `);
  document.getElementById("finishBtn").onclick = homeScreen;
}

// ===== VALIDATED BANK =====
function validatedBank(bankName) {
  show(`
    <div class="card success">
      <h3>✅ Bank Connected Successfully</h3>
      <p>Your ${bankName} account has been securely linked to Quantum Pay.</p>
      <button id="continueBtn">Continue</button>
    </div>
  `);
  document.getElementById("continueBtn").onclick = homeScreen;
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  loginScreen();
});

