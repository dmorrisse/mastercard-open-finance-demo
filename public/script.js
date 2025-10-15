const sections = document.querySelectorAll("section");
const banner = document.getElementById("banner");
const spinner = document.getElementById("spinner");
let sessionId = Date.now().toString();
let currentBank = "";
let recipient = "";
let amount = "";

function show(id) {
  sections.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  banner.classList.add("hidden");
}

function showBanner(msg, type="error") {
  banner.textContent = msg;
  banner.className = type;
  banner.classList.remove("hidden");
}

function showSpinner(showIt=true) {
  spinner.classList.toggle("hidden", !showIt);
}

document.getElementById("loginBtn").onclick = async () => {
  await fetch("/api/login", { method: "POST" });
  show("pay");
};

document.getElementById("continueToConsent").onclick = async () => {
  recipient = document.getElementById("recipient").value;
  amount = document.getElementById("amount").value;
  try {
    const res = await fetch("/api/search-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: recipient })
    });
    if (!res.ok) throw new Error("USER_NOT_FOUND");
    show("consent");
  } catch (err) {
    console.error("Quantum Pay Error:", err.message);
    show("consent");
  }
};

document.getElementById("toBankList").onclick = () => show("bankSelect");

document.querySelectorAll(".bankBtn").forEach(btn => {
  btn.onclick = () => {
    currentBank = btn.dataset.bank;
    document.getElementById("bankLogin").classList.remove("hidden");
  };
});

document.getElementById("connectBank").onclick = async () => {
  showSpinner(true);
  try {
    const res = await fetch("/api/bank-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bank: currentBank, sessionId })
    });
    showSpinner(false);
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "BANK_CONNECTION_FAIL") {
        showBanner("Unable to connect to Citi at this time. Please try another bank.");
      } else {
        console.error("Quantum Pay Error:", data.error);
        showBanner("Connection issue, please retry.");
      }
      throw new Error(data.error);
    }
    show("funding");
    document.getElementById("fundDetails").innerText =
      `Sending $${amount} to ${recipient} from ${currentBank}.`;
  } catch (err) {
    showSpinner(false);
    console.error("Quantum Pay Error:", err.message);
  }
};

document.getElementById("confirmFund").onclick = async () => {
  showSpinner(true);
  try {
    const res = await fetch("/api/fund", { method: "POST" });
    showSpinner(false);
    if (!res.ok) {
      const data = await res.json();
      showBanner(data.error || "Unable to complete your payment.");
      throw new Error("FUNDING_ERROR");
    }
    show("success");
  } catch (err) {
    showSpinner(false);
    console.error("Quantum Pay Error:", err.message);
  }
};

document.getElementById("restart").onclick = () => {
  sessionId = Date.now().toString();
  show("pay");
};
