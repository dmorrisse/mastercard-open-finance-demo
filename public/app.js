// ====== GLOBAL VARIABLES ======
let app;
let partnerFailCount = 0;

// ====== GLOBAL ERROR HOOK ======
window.addEventListener("error", function (e) {
  console.error("Global JS Error Captured:", e.message);
  if (window.QuantumMetricAPI && QuantumMetricAPI.recordEvent) {
    QuantumMetricAPI.recordEvent("js_error_captured", {
      message: e.message,
      source: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  }
});

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

function recordEvent(name, data = {}) {
  console.log("QM Event:", name, data);
  if (window.QuantumMetricAPI && QuantumMetricAPI.recordEvent) {
    QuantumMetricAPI.recordEvent(name, data);
  }
}

// ====== LOGIN ======
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
    const u = document.getElementById("user").value.trim();
    const p = document.getElementById("pass").value.trim();
    if (!u || !p) return alert("Enter username & password");
    loadingScreen("Verifying credentials...");
    setTimeout(homeScreen, 800);
  };
}

// ====== HOME ======
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
    setTimeout(mastercardConsent, 700);
  };
  document.getElementById("logoutBtn").onclick = loginScreen;
}

// ====== MASTERCARD CONSENT ======
function mastercardConsent() {
  show(`
    <div class="card mc-consent">
      <div class="mc-header">
        <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" />
        <img src="https://cdn-icons-png.flaticon.com/512/639/639365.png" />
      </div>
      <h2><b>Quantum Pay</b> uses <b>Mastercard Data Connect</b> to link your accounts</h2>
      <button id="nextBtn">Next</button>
      <div class="mc-footer">
        <p>Secured by</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" height="22" />
      </div>
    </div>
  `);
  document.getElementById("nextBtn").onclick = bankSelect;
}

// ====== BANK SELECTION ======
function bankSelect() {
  show(`
    <div class="card">
      <h3>Select your institution</h3>
      <div class="bank-grid">
        <button class="bank white" id="partner">
          <img src="https://mypartners.bank/wp-content/themes/partnersbank/images/logo.svg" />
        </button>
        <button class="bank white" id="chase">
          <img src="https://www.logo.wine/a/logo/Chase_Bank/Chase_Bank-Logo.wine.svg" />
        </button>
        <button class="bank white" id="bofa">
          <img src="https://www.logo.wine/a/logo/Bank_of_America/Bank_of_America-Logo.wine.svg" />
        </button>
        <button class="bank white" id="citi">
          <img src="https://www.logo.wine/a/logo/Citigroup/Citigroup-Logo.wine.svg" />
        </button>
      </div>
    </div>
  `);
  document.getElementById("partner").onclick = () => connectBank("partnerbank-connect");
  document.getElementById("chase").onclick = () => connectBank("chase-connect");
  document.getElementById("bofa").onclick = validatedBank;
  document.getElementById("citi").onclick = validatedBank;
}

// ====== CONNECT BANK ======
async function connectBank(api) {
  loadingScreen("Connecting to your bank...");
  try {
    const res = await fetch(`/api/${api}`);
    if (!res.ok) {
      // make QM see this as a network + JS error
      recordEvent("bank_connection_error", { bank: api, status: res.status });
      setTimeout(() => {
        throw new Error(`QM_CAPTURED_ERROR: ${api} → ${res.status}`);
      }, 10);
      if (api.includes("partnerbank")) {
        partnerFailCount++;
        if (partnerFailCount >= 4) return showTroubleModal();
      }
      return showConnectionFailed();
    }
    validatedBank();
  } catch (err) {
    console.error("Connection failure:", err);
    recordEvent("bank_connection_exception", { bank: api, error: err.message });
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: ${api} → ${err.message}`);
    }, 10);
    showConnectionFailed();
  }
}

// ====== CONNECTION FAILED ======
function showConnectionFailed() {
  show(`
    <div class="card error">
      <h3>Connection Failed</h3>
      <p>We couldn’t complete your connection.<br>Please try again later.</p>
      <button id="retryBtn">Try Again</button>
    </div>
  `);
  document.getElementById("retryBtn").onclick = bankSelect;
}

// ====== SUCCESS ======
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

// ====== ACTIVITY FEED ======
async function activityFeed() {
  loadingScreen("Loading activity...");
  try {
    const r = await fetch("/api/activity-feed");
    const d = await r.json();
    show(`
      <div class="card">
        <h3>Your Activity</h3>
        ${d.map((t) => `<div class="txn"><b>You</b> paid <b>${t.user}</b> $${t.amount} for ${t.desc}</div>`).join("")}
        <button id="backBtn">Back</button>
      </div>
    `);
    document.getElementById("backBtn").onclick = homeScreen;
  } catch (e) {
    setTimeout(() => {
      throw new Error(`QM_CAPTURED_ERROR: activity-feed → ${e.message}`);
    }, 10);
  }
}

// ====== TROUBLE MODAL ======
function showTroubleModal() {
  recordEvent("partnerbank_trouble_modal_shown");

  // ✅ make Felix see a real error
  setTimeout(() => {
    throw new Error("QM_CAPTURED_ERROR: PartnerBank Trouble Modal — user failed after 4 attempts");
  }, 10);

  recordEvent("ui_error_message_displayed", {
    label: "PartnerBank Trouble Modal",
    message: "User failed to connect after 4 attempts",
    severity: "error",
  });

  const modal = document.createElement("div");
  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;">
      <div style="background:white;padding:32px 40px;border-radius:12px;text-align:center;max-width:400px;">
        <img src="https://mypartners.bank/wp-content/themes/partnersbank/images/logo.svg" style="width:120px;margin-bottom:16px;" />
        <h3 style="color:#e80065;margin-bottom:16px;">Having Trouble?</h3>
        <p>It looks like you’re having trouble connecting.<br>Please contact your administrator.</p>
        <button id="adminClose" style="background:#000;color:#fff;border:none;border-radius:8px;padding:10px 20px;margin-top:18px;cursor:pointer;">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("adminClose").onclick = () => {
    recordEvent("partnerbank_trouble_modal_closed");
    document.body.removeChild(modal);
    loadingScreen("Returning to bank list...");
    setTimeout(bankSelect, 700);
  };
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  loginScreen();
});
