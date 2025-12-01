// extension/panel.js (production) - READY TO PASTE
const BACKEND_URL = "https://beingbulls-backend.onrender.com";

// DOM refs (assume these exist in panel.html)
const loginSection = document.getElementById("login-section");
const scannerSection = document.getElementById("scanner-section");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const scanBtn = document.getElementById("scan-btn");
const rememberCheckbox = document.getElementById("remember-me");
const emailInput = document.getElementById("email");
const otpBtn = document.getElementById("send-otp-btn");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verify-otp-btn");

// ---------- chrome.storage helpers (use local for reliability) ----------
function getStorage(keys) {
  return new Promise((res) => chrome.storage.local.get(keys, (items) => res(items)));
}
function setStorage(obj) {
  return new Promise((res) => chrome.storage.local.set(obj, () => res()));
}
function removeStorage(keys) {
  return new Promise((res) => chrome.storage.local.remove(keys, () => res()));
}

async function saveToken(token, expiryFlag = "never") {
  await setStorage({ bb_token: token, loginExpiry: expiryFlag });
  try { localStorage.setItem("token", token); localStorage.setItem("loginExpiry", expiryFlag); } catch (e) {}
  console.log("✅ Token saved");
}
async function clearToken() {
  await removeStorage(["bb_token", "loginExpiry"]);
  try { localStorage.removeItem("token"); localStorage.removeItem("loginExpiry"); } catch (e) {}
  console.log("🧹 Token cleared");
}
async function getToken() {
  const it = await getStorage(["bb_token"]);
  if (it?.bb_token) return it.bb_token;
  try { return localStorage.getItem("token"); } catch (e) { return null; }
}

// ---------- UI toggles ----------
function showScanner() {
  if (loginSection) loginSection.style.display = "none";
  if (scannerSection) scannerSection.style.display = "block";
  loadScanHistory();
}
function showLogin() {
  if (loginSection) loginSection.style.display = "block";
  if (scannerSection) scannerSection.style.display = "none";
}

// ---------- init: check token on load ----------
(async () => {
  const items = await getStorage(["bb_token", "loginExpiry"]);
  let token = items.bb_token || null;
  let expiry = items.loginExpiry || null;
  if (!token) {
    try { token = localStorage.getItem("token"); expiry = localStorage.getItem("loginExpiry"); } catch (e) {}
  }

  let isValid = false;
  if (token) {
    if (expiry === "never") isValid = true;
    else isValid = Date.now() <= (Number(expiry) || 0);
  }

  if (isValid) showScanner();
  else { await clearToken(); showLogin(); }
})();

// ---------- External message from website to set token (optional) ----------
try {
  chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === "SET_TOKEN" && msg.token) {
      saveToken(msg.token, msg.expiry || "never").then(() => sendResponse({ ok: true }));
      return true; // keep channel open for async sendResponse
    }
  });
} catch (e) {
  // some environments may not support onMessageExternal
  console.warn("onMessageExternal not available", e);
}

// ---------- Send OTP ----------
if (otpBtn) {
  otpBtn.addEventListener("click", async () => {
    const email = (emailInput?.value || "").trim();
    if (!email) { alert("⚠️ Enter email"); return; }
    otpBtn.disabled = true;
    try {
      const res = await fetch(`${BACKEND_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      alert("📩 OTP sent to email");
    } catch (e) {
      console.error(e);
      alert("🚫 Could not send OTP. Check your email config.");
    } finally {
      otpBtn.disabled = false;
    }
  });
}

// ---------- Verify OTP (login) ----------
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    const email = (emailInput?.value || "").trim();
    const otp = (otpInput?.value || "").trim();
    if (!email || !otp) { alert("⚠️ Enter email & OTP"); return; }
    verifyOtpBtn.disabled = true;
    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Invalid OTP");
      }
      const j = await res.json();
      const token = j.access_token;
      const remember = rememberCheckbox?.checked;
      const expiry = remember ? "never" : (Date.now() + 7 * 24 * 60 * 60 * 1000).toString();
      await saveToken(token, expiry);
      alert("✅ Logged in");
      showScanner();
    } catch (e) {
      console.error(e);
      alert("🚫 Login failed");
    } finally {
      verifyOtpBtn.disabled = false;
    }
  });
}

// ---------- Logout ----------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await clearToken();
    alert("✅ Logged out");
    showLogin();
  });
}

// ---------- Trigger scan ----------
if (scanBtn) {
  scanBtn.addEventListener("click", async () => {
    const token = await getToken();
    const feedback = document.getElementById("feedback-toggle")?.checked || false;
    if (!token) { alert("🔒 Please login first"); return; }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) { alert("⚠️ No active tab"); return; }
      chrome.tabs.sendMessage(tabs[0].id, { type: "TRIGGER_SCAN", token, feedback }, (resp) => {
        console.log("scan message sent", resp);
      });
    });
  });
}

// ---------- Receive SCAN_RESULT from content script ----------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;
  if (msg.type === "SCAN_RESULT") {
    const tbody = document.querySelector("#scan-history tbody");
    if (!tbody) return;

    if (!msg.success) {
      tbody.innerHTML = `<tr><td colspan="4">⚠️ ${msg.error || "Scan failed"}</td></tr>`;
      return;
    }

    const patterns = msg.data || [];
    tbody.innerHTML = "";
    if (!patterns.length) {
      tbody.innerHTML = `<tr><td colspan="4">😕 No patterns detected</td></tr>`;
      return;
    }

    patterns.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${new Date().toLocaleString()}</td>
                      <td>${p.pattern || p.name || "-"}</td>
                      <td>${p.trend || "-"}</td>
                      <td>${Math.round(p.confidence || 0)}%</td>`;
      tbody.appendChild(tr);
    });
  }
});

// ---------- Load scan history ----------
async function loadScanHistory() {
  const token = await getToken();
  if (!token) return;
  try {
    const res = await fetch(`${BACKEND_URL}/scan/history`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { console.warn("history fetch failed", res.status); return; }
    const json = await res.json();
    const tbody = document.querySelector("#scan-history tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!json?.history?.length) { tbody.innerHTML = `<tr><td colspan="4">😕 No scans yet.</td></tr>`; return; }
    json.history.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${new Date(r.timestamp).toLocaleString()}</td>
                      <td>${(r.patterns_detected || []).join(", ") || "-"}</td>
                      <td>${r.ema_confirmed ? "✅" : "❌"}</td>
                      <td>${(r.confidence_scores || []).map(c => Math.round(c||0)).join(", ") || "-"}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("history error", e);
  }
}
