const app = document.getElementById("app");

// Utility to render screen content
function show(html) {
  app.innerHTML = html;
}

// LOGIN
function loginScreen() {
  show(`
    <h1>Quantum Pay</h1>
    <p>Welcome — please log in to get started</p>
    <input id="user" placeholder="Username" />
    <input id="pass" placeholder="Password" type="password" />
    <button onclick="login()">Login</button>
  `);
}

function login() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();
  if (!user || !pass) return alert("Please enter login details");
  homeScreen();
}

// HOME
function homeScreen() {
  show(`
    <h1>Welcome to Quantum Pay</h1>
    <h2>What would you like to do?</h2>
    <button onclick="connectBank()">Connect Your Bank Account</button>
    <button onclick="connectContacts()">Connect Your Contacts</button>
    <div style="margin-top: 1rem;">
      <input id="search" placeholder="Search for users..." />
    </div>
  `);
}

// CONNECT BANK FLOW
function connectBank() {
  show(`
    <h2>Quantum Pay uses Mastercard Data Connect to link your accounts</h2>
    <p>Your data will be securely accessed, processed, and shared with your permission.</p>
    <button onclick="showBanks()">Next</button>
    <div style="margin-top:1rem;font-size:0.9rem;">Secured by <b>Mastercard</b></div>
  `);
}

function showBanks() {
  show(`
    <h2>Find your bank</h2>
    <div class="bank-list">
      <div class="bank-btn" onclick="connectBankProvider('Chase')">Chase</div>
      <div class="bank-btn" onclick="connectBankProvider('Partner Bank')">Partner Bank</div>
      <div class="bank-btn" onclick="connectBankProvider('Citi')">Citi</div>
      <div class="bank-btn" onclick="connectBankProvider('Wells Fargo')">Wells Fargo</div>
    </div>
    <button onclick="homeScreen()">Back Home</button>
  `);
}

function connectBankProvider(bank) {
  if (bank === "Citi" || bank === "Partner Bank") {
    show(`
      <h2 class="error">Connection Failed</h2>
      <p>We were unable to complete your connection to ${bank}. Please try again later.</p>
      <button onclick="showBanks()">Try Another Bank</button>
    `);
  } else {
    show(`
      <h2>Connecting to ${bank}...</h2>
      <p>Please wait while we securely link your account.</p>
    `);
    setTimeout(validatedBank, 1800);
  }
}

function validatedBank() {
  show(`
    <h2 class="success">✅ Bank Connected Successfully</h2>
    <p>Your Chase account has been linked to Quantum Pay.</p>
    <button onclick="activityFeed()">Continue</button>
  `);
}

// ACTIVITY FEED
function activityFeed() {
  show(`
    <h2>Your Activity</h2>
    <div class="feed">
      <div class="feed-item"><b>You</b> paid <b>@mike</b> $24.50 for coffee ☕</div>
      <div class="feed-item"><b>@sara</b> paid <b>You</b> $120 for rent 🏠</div>
      <div class="feed-item"><b>You</b> paid <b>@gymfit</b> $45 for membership 💪</div>
    </div>
    <button onclick="homeScreen()">Back Home</button>
  `);
}

// CONTACTS (placeholder)
function connectContacts() {
  show(`
    <h2>Connect Your Contacts</h2>
    <p>Feature coming soon — invite friends to Quantum Pay.</p>
    <button onclick="homeScreen()">Back Home</button>
  `);
}

// INIT
loginScreen();
