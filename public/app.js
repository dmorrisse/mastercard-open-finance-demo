// ====== GLOBAL VARIABLES ======
let app;
let partnerFailCount = 0; // track Partner Bank failure attempts

// ====== UTILITIES ======
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

// ====== EVENT RECORDING (FOR FELIX / QM) ======
function recordEvent(eventName, metadata = {}) {
  console.log(`[QM_EVENT] ${eventName}`, metadata);

  // Quantum Metric API hook (if available)
  if (window.QuantumMetricAPI && QuantumMetricAPI.record) {
    QuantumMetricAPI.record("event", {
      event_name: eventName,
      ...metadata,
    });
  }

  // local fallback for testing
  window.localStorage.setItem("lastQMEvent", eventName);
}

// ====== LOGIN SCREEN ======
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

    recordEvent("login_attempt", { username: user });

    loadingScreen("Verifying credentials...");
    setTimeout(() => {
      recordEvent("login_success", { username: user });
      homeScreen();
    }, 1000);
  };
}

// ====== HOME SCREEN ======
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
    recordEvent("home_connect_bank_clicked");
    loadingScreen("Initializing Mastercard Data Connect...");
    setTimeout(mastercardConsent, 1000);
  };

  document.getElementById("logoutBtn").onclick = () => {
    recordEvent("logout_clicked");
    loginScreen();
  };
}

// ====== MASTERCARD CONSENT ======
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

  document.getElementById("nextBtn").onclick = () => {
    recordEvent("mastercard_consent_next_clicked");
    bankSelect();
  };
}

// ====== BANK SELECTION ======
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

  document.getElementById("partner").onclick = () => {
    recordEvent("bank_select_partnerbank");
    connectBank("partnerbank-connect");
  };
  document.getElementById("chase").onclick = () => {
    recordEvent("bank_select_chase");
    accountReview("Chase");
  };
  document.getElementById("bofa").onclick = () => {
    recordEvent("bank_select_bofa");
    validatedBank("Bank of America");
  };
  document.getElementById("citi").onclick = () => {
    recordEvent("bank_select_citi");
    accountReview("Citi");
  };
}

// ====== CONNECT BANK ======
async function connectBank(api) {
  loadingScreen("Connecting to your bank...");
  recordEvent(`${api}_connection_attempt`);

  try {
    const response = await fetch(`/api/${api}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (api.includes("chase")) validatedBank("Chase");
  } catch (err) {
    console.error("Bank connection failed:", err);
    recordEvent(`${api}_api_500_error`, { message: err.message });

    // track partnerbank retries
    if (api.includes("partnerbank")) {
      partnerFailCount++;
      if (partnerFailCount >= 4) {
        showTroubleModal();
        return;
      }
    }

    // QM visible failure
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: ${api} → 500 Internal Server Error`);
    }, 10);

    show(`
      <div class="card error">
        <h3>Connection Failed</h3>
        <p>We couldn’t complete your connection. Please try again later.</p>
        <button id="retryBtn">Back to Bank Selection</button>
      </div>
    `);

    document.getElementById("retryBtn").onclick = () => {
      recordEvent("bank_retry_clicked", { api });
      loadingScreen("Reloading bank list...");
      setTimeout(bankSelect, 800);
    };
  }
}

// ====== ACCOUNT REVIEW ======
function accountReview(bankName) {
  recordEvent("account_review_loaded", { bank: bankName });

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
    recordEvent("account_submit_clicked", { bank: bankName });

    if (bankName === "Chase") {
      loadingScreen("Connecting to Chase...");
      setTimeout(() => {
        connectionFailed();
      }, 1000);
    } else {
      connectionSuccess(bankName);
    }
  };
}

// ====== CONNECTION FAIL ======
function connectionFailed() {
  recordEvent("connection_failed_chase");

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
    recordEvent("bank_retry_clicked", { bank: "Chase" });
    loadingScreen("Reloading bank list...");
    setTimeout(bankSelect, 800);
  };
}

// ====== CONNECTION SUCCESS ======
function connectionSuccess(bankName) {
  recordEvent("connection_success", { bank: bankName });

  show(`
    <div class="card success mc-consent">
      <h2>Connected Successfully</h2>
      <p>You’ve successfully linked your <b>${bankName}</b> account with Quantum Pay.</p>
      <button id="finishBtn">Finish</button>
    </div>
  `);

  document.getElementById("finishBtn").onclick = () => {
    recordEvent("finish_clicked", { bank: bankName });
    homeScreen();
  };
}

// ====== VALIDATED BANK ======
function validatedBank(bankName) {
  recordEvent("validated_bank_success", { bank: bankName });

  show(`
    <div class="card success">
      <h3>✅ Bank Connected Successfully</h3>
      <p>Your ${bankName} account has been securely linked to Quantum Pay.</p>
      <button id="continueBtn">Continue</button>
    </div>
  `);

  document.getElementById("continueBtn").onclick = () => {
    recordEvent("validated_continue_clicked", { bank: bankName });
    homeScreen();
  };
}
// ====== TROUBLE MODAL ======
function showTroubleModal() {
  recordEvent("partnerbank_trouble_modal_shown");
  partnerFailCount = 0;

  const modal = document.createElement("div");
  modal.innerHTML = `
    ...
  `;
  document.body.appendChild(modal);

  document.getElementById("adminClose").onclick = () => {
    recordEvent("partnerbank_trouble_modal_closed");
    document.body.removeChild(modal);
    loadingScreen("Returning to bank list...");
    setTimeout(bankSelect, 1000);
  };
}


// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  loginScreen();
});
