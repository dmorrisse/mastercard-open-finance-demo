const sections = document.querySelectorAll("section");
function show(id) {
  sections.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

let sessionId = Date.now().toString();
let currentBank = "";
let recipient = "";
let amount = "";

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
    show("consent"); // still continue
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
  try {
    const res = await fetch("/api/bank-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) throw new Error("BANK_AUTH_FAIL");
    show("funding");
    document.getElementById("fundDetails").innerText = 
      `Sending $${amount} to ${recipient} from ${currentBank}.`;
  } catch (err) {
    console.error("Quantum Pay Error:", err.message);
    alert("Please try again."); // small retry hint, no error text
  }
};

document.getElementById("confirmFund").onclick = async () => {
  try {
    const res = await fetch("/api/fund", { method: "POST" });
    if (!res.ok) throw new Error("FUNDING_ERROR");
    show("success");
  } catch (err) {
    console.error("Quantum Pay Error:", err.message);
    alert("Payment failed. Please retry.");
  }
};

document.getElementById("restart").onclick = () => {
  sessionId = Date.now().toString();
  show("pay");
};
