const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");
const accountsSection = document.getElementById("accounts-section");
const transferSection = document.getElementById("transfer-section");
const loadAccountsBtn = document.getElementById("loadAccountsBtn");
const accountsList = document.getElementById("accountsList");
const fromSel = document.getElementById("fromAccount");
const toSel = document.getElementById("toAccount");
const transferBtn = document.getElementById("transferBtn");
const transferStatus = document.getElementById("transferStatus");
let authToken = null;
let cachedAccounts = [];

loginBtn.addEventListener("click", async () => {
  loginStatus.textContent = "Signing in...";
  try {
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      })
    });
    if (!r.ok) throw new Error("Invalid credentials");
    const data = await r.json();
    authToken = data.token;
    loginStatus.textContent = `Welcome, ${data.name}.`;
    accountsSection.classList.remove("hidden");
  } catch (e) {
    loginStatus.textContent = e.message;
  }
});

loadAccountsBtn.addEventListener("click", async () => {
  accountsList.textContent = "Loading accounts...";
  const r = await fetch("/api/accounts");
  const data = await r.json();
  cachedAccounts = data.accounts;
  accountsList.innerHTML = cachedAccounts
    .map(a => `<div class="acct"><strong>${a.name}</strong> — ${a.type} • ${a.currency} ${a.balance}</div>`)
    .join("");
  fromSel.innerHTML = cachedAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  toSel.innerHTML = cachedAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  transferSection.classList.remove("hidden");
});

transferBtn.addEventListener("click", async () => {
  transferStatus.textContent = "Submitting transfer...";
  const payload = {
    fromId: fromSel.value,
    toId: toSel.value,
    amount: document.getElementById("amount").value,
    memo: document.getElementById("memo").value
  };
  const r = await fetch("/api/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const err = await r.json();
    transferStatus.textContent = `Transfer failed: ${err.error}`;
    try { window.__demo.boom.prop = 1; } catch(_) {}
    return;
  }
  const data = await r.json();
  transferStatus.textContent = `Success! Ref ${data.reference}`;
});
