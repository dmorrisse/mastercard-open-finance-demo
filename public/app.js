// ========== GLOBAL VARIABLES ==========
let app;
let partnerFailCount = 0;

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

function recordEvent(name, data = {}) {
  if (window.QuantumMetricAPI && QuantumMetricAPI.recordEvent) {
    QuantumMetricAPI.recordEvent(name, data);
  } else {
    console.log("QM Event:", name, data);
  }
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
    setTimeout(homeScreen, 800);
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
    setTimeout(mastercardConsent, 800);
  };

  document.getElementById("logoutBtn").onclick = loginScreen;
}

// ========== MASTERCARD CONSENT ==========
function mastercardConsent() {
  show(`
    <div class="card mc-consent">
      <div class="mc-header">
        <img src="https://cdn-icons-png.flaticon.com/512/483/483356.png" alt="Phone Icon" />
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
    const response = await fetch(`/api/${api}`);

    // simulate Partner Bank 500
    if (api.includes("partnerbank")) {
      partnerFailCount++;
      console.warn("Simulated 500 for Partner Bank");
      recordEvent("bank_connection_error", {
        bank: "PartnerBank",
        status: 500,
        message: "Simulated 500 error"
      });

      // ✅ make Felix see it as a real error
      setTimeout(() => {
        throw new Error("QM_CAPTURED_ERROR: PartnerBank → 500 Internal Server Error");
      }, 20);

      if (partnerFailCount >= 4) {
        showTroubleModal();
      } else {
        show(`
          <div class="card error">
            <h3>Connection Failed</h3>
            <p>We couldn’t complete your connection.<br>Please try again or contact support.</p>
            <button id="retryBtn">Try Again</button>
          </div>
        `);
        document.getElementById("retryBtn").onclick = bankSelect;
      }
      return;
    }

    if (!response.ok) {
      recordEvent("bank_connection_error", { bank: api, status: response.status });
      setTimeout(() => {
        throw new Error(`QM_CAPTURED_ERROR: ${api} → ${response.status}`);
      }, 20);
      throw new Error(`Server error: ${response.status}`);
    }

    if (api.includes("chase")) {
      validatedBank();
    } else {
      validatedBank();
    }

  } catch (err) {
    console.error("Bank connection failed:", err);
    recordEvent("bank_connection_exception", { bank: api, error: err.message });
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: ${api} → ${err.message}`);
    }, 10);

    show(`
      <div class="card error">
        <h3>Connection Failed</h3>
        <p>We couldn’t complete your connection.<br>Please try again later.</p>
        <button id="retryBtn">Try Again</button>
      </div>
    `);
    document.getElementById("retryBtn").onclick = bankSelect;
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

// ========== TROUBLE MODAL ==========
function showTroubleModal() {
  recordEvent("partnerbank_trouble_modal_shown");

  // ✅ Ensure Felix sees this as a true captured error
  setTimeout(() => {
    throw new Error("QM_CAPTURED_ERROR: PartnerBank Trouble Modal — user failed after 4 attempts");
  }, 50);

  recordEvent("partnerbank_trouble_error_displayed", {
    bank: "PartnerBank",
    message: "User failed 4 attempts",
    severity: "error",
  });

  const modal = document.createElement("div");
  modal.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    ">
      <div style="
        background: white;
        padding: 30px 40px;
        border-radius: 12px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      ">
        <img src="https://mypartners.bank/wp-content/themes/partnersbank/images/logo.svg" 
             alt="Partner Bank" 
             style="width: 120px; margin-bottom: 16px;" />
        <h3 style="margin-bottom: 16px; color:#e80065;">Having Trouble?</h3>
        <p style="color:#333;">It looks like you’re having trouble connecting.<br>
        Please contact your administrator.</p>
        <button id="adminClose" style="
          background: #000;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          margin-top: 18px;
          cursor: pointer;
        ">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("adminClose").onclick = () => {
    recordEvent("partnerbank_trouble_modal_closed");
    document.body.removeChild(modal);
    loadingScreen("Returning to bank list...");
    setTimeout(bankSelect, 800);
  };
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  loginScreen();
});
