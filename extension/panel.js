//document.addEventListener("DOMContentLoaded", () => {
  //const scanBtn = document.getElementById("scanBtn");
  //const feedbackToggle = document.getElementById("feedbackToggle");
  //const resultBox = document.getElementById("result");

  //scanBtn.addEventListener("click", async () => {
    //resultBox.innerHTML = "⏳ Scanning chart...";
    
    // try {
      // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // chrome.runtime.sendMessage({
       // type: "TRIGGER_SCAN",
       // feedback: feedbackToggle.checked
     // });

   // } catch (err) {
    //  resultBox.innerHTML = "❌ Error triggering scan.";
    //  console.error(err);
   // }
 // });

  // Listen for result from content.js
 // chrome.runtime.onMessage.addListener((msg) => {
    //if (msg.type === "SCAN_RESULT") {
   //   if (msg.status === "backend_offline") {
   //     resultBox.innerHTML = "⚠️ Backend not connected. Please connect backend.";
    //  } else {
       // resultBox.innerHTML = `
      //    ✅ <b>Pattern:</b> ${msg.pattern} <br />
       //   📈 <b>Confidence:</b> ${msg.confidence}% <br />
       //   🔁 <b>EMA-5:</b> ${msg.ema_confirmation ? "Confirmed" : "Not Confirmed"}
     //   `;
     // }
   // }
 // });
//});

// extension/panel.js

//const loginSection = document.getElementById("login-section");
//const scannerSection = document.getElementById("scanner-section");
//const scanBtn = document.getElementById("scan-btn");
//const loginBtn = document.getElementById("login-btn");
//const signupLink = document.getElementById("signup-link");

//const BACKEND_URL = "https://beingbulls-backend.onrender.com";
 // ⚠️ UPDATE THIS

// ⏳ Auto-login if token exists
//if (localStorage.getItem("token")) {
//  loginSection.style.display = "none";
//  scannerSection.style.display = "block";
//  loadScanHistory();
//}

// 🔐 Handle Login
//loginBtn.addEventListener("click", async () => {
//  const email = document.getElementById("email").value.trim();
//  const password = document.getElementById("password").value.trim();
//
//  if (!email || !password) {
//    alert("⚠️ Email and Password are required.");
//    return;
//  }

 // try {
  //  const response = await fetch(`${BACKEND_URL}/auth/login`, {
 //     method: "POST",
  //    headers: { "Content-Type": "application/json" },
 //     body: JSON.stringify({ email, password })
 //   });

  //  const data = await response.json();
 //   if (data.token) {
  //    localStorage.setItem("token", data.token);
 //     loginSection.style.display = "none";
//      scannerSection.style.display = "block";
//      loadScanHistory();
//    } else {
   //   alert("❌ Invalid login.");
 //   }
//  } catch (error) {
//    console.error("Login error:", error);
//    alert("🚫 Backend not reachable. Please try again later.");
//  }
//});

// 🔗 Redirect to Signup Page
//signupLink.addEventListener("click", () => {
//  window.open("https://beingbulls.in/signup", "_blank");
//});

// 📡 Trigger Scan
//scanBtn.addEventListener("click", () => {
//  const token = localStorage.getItem("token");
//  const feedback = document.getElementById("feedback-toggle").checked;

//  if (!token) {
//    alert("🔒 Please log in first.");
//    return;
//  }

//  try {
//    chrome.runtime.sendMessage({
 //     type: "TRIGGER_SCAN",
//      token,
//      feedback
//    });
//  } catch (error) {
//    alert("🚫 Backend not connected or scan failed.");
//  }
//});

// 🕓 Load History Table
//async function loadScanHistory() {
//  const token = localStorage.getItem("token");
//  if (!token) return;

//  try {
//    const res = await fetch(`${BACKEND_URL}/scan/history`, {
//      headers: { Authorization: `Bearer ${token}` }
//    });
//    const result = await res.json();

//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = "";
//
 //   if (!result?.history?.length) {
 //     const tr = document.createElement("tr");
 //     tr.innerHTML = `<td colspan="4">No scans yet.</td>`;
//      tbody.appendChild(tr);
//      return;
//    }

  //  result.history.forEach((row) => {
//      const tr = document.createElement("tr");
//      tr.innerHTML = `
      //  <td>${new Date(row.timestamp).toLocaleString()}</td>
    //    <td>${row.pattern}</td>
  //      <td>${row.emaConfirmed ? "✅" : "❌"}</td>
//        <td>${row.confidence}%</td>
//      `;
//      tbody.appendChild(tr);
//    });
//  } catch (err) {
//    console.error("Failed to fetch history:", err);
//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = `<tr><td colspan="4">⚠️ Cannot connect to backend.</td></tr>`;
//  }
//}









// extension/panel.js

//const loginSection = document.getElementById("login-section");
//const scannerSection = document.getElementById("scanner-section");
//const scanBtn = document.getElementById("scan-btn");
//const loginBtn = document.getElementById("login-btn");
//const signupLink = document.getElementById("signup-link");

//const BACKEND_URL = "https://beingbulls-backend.onrender.com"; // ✅ Your backend URL

// ⏳ Auto-login if token exists
//if (localStorage.getItem("token")) {
//  loginSection.style.display = "none";
//  scannerSection.style.display = "block";
//  loadScanHistory();
//}

// 🔐 Login
//loginBtn.addEventListener("click", async () => {
//  const email = document.getElementById("email").value.trim();
//  const password = document.getElementById("password").value.trim();
//  console.log("Login button clicked");

//  if (!email || !password) {
//    alert("⚠️ Email and Password are required.");
//    return;
 // }

  // ✅ Admin Bypass
//  if (email === "admin@beingbulls.in" && password === "admin123") {
//    alert("✅ Logged in as Admin (offline mode)");
//    localStorage.setItem("token", "admin-bypass-token");
//    loginSection.style.display = "none";
//    scannerSection.style.display = "block";
//    loadScanHistory();
 //   return;
//  }

  // 🌐 API Login
//  try {
//    const response = await fetch(`${BACKEND_URL}/auth/login`, {
 //     method: "POST",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({ email, password })
//    });

//    const data = await response.json();

 //   if (data.token) {
 //     localStorage.setItem("token", data.token);
 //     loginSection.style.display = "none";
 //     scannerSection.style.display = "block";
//      loadScanHistory();
//    } else {
//      alert("❌ Invalid login.");
//    }
//  } catch (error) {
//    console.error("Login error:", error);
//    alert("🚫 Backend not reachable. Use admin credentials.");
//  }
//});

// 🔗 Signup redirection
//signupLink.addEventListener("click", () => {
//  window.open("https://beingbulls.in/signup", "_blank");
//});

// 🚀 Trigger Scan
//scanBtn.addEventListener("click", () => {
//  const token = localStorage.getItem("token");
//  const feedback = document.getElementById("feedback-toggle")?.checked || false;

//  if (!token) {
//    alert("🔒 Please log in first.");
//    return;
//  }

 // try {
 //   chrome.runtime.sendMessage({
 //     type: "TRIGGER_SCAN",
 //     token,
//      feedback
//    });
//  } catch (error) {
//    console.error("Scan trigger error:", error);
 //   alert("🚫 Scan failed or backend not connected.");
//  }
//});

// 📜 Load Scan History
//async function loadScanHistory() {
 // const token = localStorage.getItem("token");
 // if (!token) return;

//  try {
//    const res = await fetch(`${BACKEND_URL}/scan/history`, {
//      headers: { Authorization: `Bearer ${token}` }
//    });

//    const result = await res.json();

//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = "";

   // if (!result?.history?.length) {
   //   const tr = document.createElement("tr");
   //   tr.innerHTML = `<td colspan="4">No scans yet.</td>`;
  //    tbody.appendChild(tr);
  //    return;
  //  }

   // result.history.forEach((row) => {
    //  const tr = document.createElement("tr");
    //  tr.innerHTML = `
    //    <td>${new Date(row.timestamp).toLocaleString()}</td>
   //     <td>${row.pattern}</td>
  //      <td>${row.emaConfirmed ? "✅" : "❌"}</td>
 //       <td>${row.confidence}%</td>
 //     `;
 //     tbody.appendChild(tr);
 //   });
//  } catch (err) {
//    console.error("Failed to fetch history:", err);
//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = `<tr><td colspan="4">⚠️ Cannot connect to backend.</td></tr>`;
//   }
//}


// extension/panel.js
//const loginSection = document.getElementById("login-section");
//const scannerSection = document.getElementById("scanner-section");
//const scanBtn = document.getElementById("scan-btn");
//const loginBtn = document.getElementById("login-btn");
//const signupLink = document.getElementById("signup-link");
//const loader = document.getElementById("loader");

//const BACKEND_URL = "https://beingbulls-backend.onrender.com"; // ✅ UPDATE THIS

// Auto-login if token already saved
//if (localStorage.getItem("token")) {
//  loginSection.style.display = "none";
//  scannerSection.style.display = "block";
//  loadScanHistory();
//}

// Handle Login
//loginBtn.addEventListener("click", async () => {
//  const email = document.getElementById("email").value.trim();
//  const password = document.getElementById("password").value.trim();

 // if (!email || !password) {
 //   alert("⚠️ Please enter both email and password.");
 //   return;
 // }

 // try {
   // const res = await fetch(`${BACKEND_URL}/auth/login`, {
   //   method: "POST",
  //    headers: { "Content-Type": "application/json" },
  //    body: JSON.stringify({ email, password })
//    });

 //   const data = await res.json();
  //  if (data.token) {
 //     localStorage.setItem("token", data.token);
 //     alert("✅ Logged in successfully!");
//      loginSection.style.display = "none";
//      scannerSection.style.display = "block";
//      loadScanHistory();
//    } else {
//      alert("❌ Invalid credentials.");
//    }
//  } catch (err) {
//    console.error("Login error:", err);
//    alert("🚫 Backend not reachable.");
//  }
//});

// Redirect to website signup
//signupLink.addEventListener("click", () => {
//  window.open("https://beingbulls.in/signup", "_blank");
//});

// Trigger scan
//scanBtn.addEventListener("click", () => {
//  const token = localStorage.getItem("token");
//  const feedback = document.getElementById("feedback-toggle").checked;

//  if (!token) {
//    alert("🔒 Please log in first.");
//    return;
//  }

//  loader.style.display = "block";

//  chrome.runtime.sendMessage({
//    type: "TRIGGER_SCAN",
//    token,
//    feedback
//  }, (res) => {
//    loader.style.display = "none";

//    if (chrome.runtime.lastError) {
//      alert("❌ Could not send scan request.");
//      return;
//    }

//    alert("📡 Scan triggered successfully!");
 //   loadScanHistory();

    // 🎉 First scan? Launch confetti!
//    launchConfetti();
//  });
//});

// Fetch scan history
//async function loadScanHistory() {
//  const token = localStorage.getItem("token");
//  if (!token) return;

//  try {
//    const res = await fetch(`${BACKEND_URL}/scan/history`, {
//      headers: { Authorization: `Bearer ${token}` }
//    });
//    const result = await res.json();

//    const tbody = document.querySelector("#scan-history tbody");
   // tbody.innerHTML = "";

 //   if (!result?.history?.length) {
//      const tr = document.createElement("tr");
//      tr.innerHTML = `<td colspan="4">😕 No scans yet.</td>`;
//      tbody.appendChild(tr);
 //     return;
//    }

  //  result.history.forEach(row => {
   //   const tr = document.createElement("tr");
  //    tr.innerHTML = `
  //      <td>${new Date(row.timestamp).toLocaleString()}</td>
  //      <td>${row.pattern}</td>
 //       <td>${row.emaConfirmed ? "✅" : "❌"}</td>
 //       <td>${row.confidence}%</td>
  //    `;
 //     tbody.appendChild(tr);
//    });
//  } catch (err) {
//    console.error("Error loading history:", err);
//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = `<tr><td colspan="4">⚠️ Unable to fetch data.</td></tr>`;
//  }
//}







// extension/panel.js

//const loginSection = document.getElementById("login-section");
//const scannerSection = document.getElementById("scanner-section");
//const scanBtn = document.getElementById("scan-btn");/
//const loginBtn = document.getElementById("login-btn");
//const signupLink = document.getElementById("signup-link");

//const BACKEND_URL = "https://beingbulls-backend.onrender.com"; // 🛠️ Replace with actual deployed URL

// ✅ Auto-login if token already stored
//if (localStorage.getItem("token")) {
//  loginSection.style.display = "none";
//  scannerSection.style.display = "block";
//  loadScanHistory();
//}

// 🚪 Login Logic
//loginBtn.addEventListener("click", async () => {
//  const email = document.getElementById("email").value.trim();
//  const password = document.getElementById("password").trim();

//  console.log("Login clicked:", email, password);

//  if (!email || !password) {
//    alert("⚠️ Email and Password are required.");
//    return;
//  }

 // // 🔓 Admin bypass
//  if (email === "admin@beingbulls.in" && password === "beingadmin123") {
//    console.log("Admin login bypass triggered ✅");
 //   localStorage.setItem("token", "FAKE_ADMIN_TOKEN");
//    loginSection.style.display = "none";
//    scannerSection.style.display = "block";
//    loadScanHistory();
//    return;
//  }

  // 🌐 Backend login
//  try {
//    console.log("Trying backend login...");
//    const response = await fetch(`${BACKEND_URL}/auth/login`, {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({ email, password })
//    });

//    const data = await response.json();
//    console.log("Backend response:", data);

//    if (data.token) {
   //   localStorage.setItem("token", data.token);
  //    loginSection.style.display = "none";
 //     scannerSection.style.display = "block";
//      loadScanHistory();
//    } else {
//      alert("❌ Invalid login.");
 //   }
//  } catch (error) {
//    console.error("Login error:", error);
//    alert("🚫 Backend not reachable. You can only login as admin temporarily.");
//  }
//});

// 🆕 Signup Link
//signupLink.addEventListener("click", () => {
//  window.open("https://beingbulls.in/signup", "_blank");
//});

// 🔍 Trigger Scan
//scanBtn.addEventListener("click", () => {
//  const token = localStorage.getItem("token");
//  const feedback = document.getElementById("feedback-toggle").checked;

  //if (!token) {
 //   alert("🔒 Please log in first.");
//    return;
//  }

//  try {
//    chrome.runtime.sendMessage({
//      type: "TRIGGER_SCAN",
//      token,
 //     feedback
//    });
//  } catch (error) {
//    alert("🚫 Scan failed. Please try again.");
//  }
//});

// 📊 Load History Table
//async function loadScanHistory() {
//  const token = localStorage.getItem("token");
//  if (!token) return;

//  try {
//    const res = await fetch(`${BACKEND_URL}/scan/history`, {
//      headers: { Authorization: `Bearer ${token}` }
//    });
//    const result = await res.json();

//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = "";

 //   if (!result?.history?.length) {
//      const tr = document.createElement("tr");
//      tr.innerHTML = `<td colspan="4">No scans yet.</td>`;
//      tbody.appendChild(tr);
//      return;
//    }

   // result.history.forEach((row) => {
  //    const tr = document.createElement("tr");
 //     tr.innerHTML = `
//        <td>${new Date(row.timestamp).toLocaleString()}</td>
//        <td>${row.pattern}</td>
//        <td>${row.emaConfirmed ? "✅" : "❌"}</td>
 //       <td>${row.confidence}%</td>
//      `;
//      tbody.appendChild(tr);
//    });
//  } catch (err) {
//    console.error("Failed to fetch history:", err);
//    const tbody = document.querySelector("#scan-history tbody");
//    tbody.innerHTML = `<tr><td colspan="4">⚠️ Cannot connect to backend.</td></tr>`;
//  }
//}


// extension/panel.js

const loginSection = document.getElementById("login-section");
const scannerSection = document.getElementById("scanner-section");
const scanBtn = document.getElementById("scan-btn");
const loginBtn = document.getElementById("login-btn");
const signupLink = document.getElementById("signup-link");
const logoutBtn = document.getElementById("logout-btn");
const rememberCheckbox = document.getElementById("remember-me");
const BACKEND_URL = "https://beingbulls-backend.onrender.com"; // live backend (change if needed)
const RAZORPAY_KEY = "your_razorpay_key";

// --- Utility: set token+expiry in chrome.storage (and localStorage as fallback) ---
function saveToken(token, expiryFlag) {
  // expiryFlag: "never" or timestamp (ms)
  chrome.storage.sync.set({ jwt: token, loginExpiry: expiryFlag }, () => {
    console.log("✅ JWT + expiry saved to chrome.storage");
  });
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("loginExpiry", expiryFlag);
  } catch (e) {
    // localStorage might not be available in some contexts — ignore
  }
}

function clearTokenStorage() {
  chrome.storage.sync.remove(["jwt", "loginExpiry"], () => {
    console.log("🧹 JWT removed from chrome.storage");
  });
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("loginExpiry");
  } catch (e) {}
}

// --- Check existing login on load (prefer chrome.storage) ---
async function checkExistingLogin() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["jwt", "loginExpiry"], (items) => {
      let token = items.jwt;
      let expiry = items.loginExpiry;

      // fallback to localStorage if chrome.storage empty
      if (!token) {
        try {
          token = localStorage.getItem("token");
          expiry = localStorage.getItem("loginExpiry");
        } catch (e) {}
      }

      let isValid = false;
      if (token) {
        if (expiry === "never") {
          isValid = true;
        } else {
          const now = Date.now();
          const exp = Number(expiry) || 0;
          isValid = now <= exp;
        }
      }

      resolve({ token, isValid });
    });
  });
}

// UI toggle helpers
function showScanner() {
  loginSection.style.display = "none";
  scannerSection.style.display = "block";
  loadScanHistory(); // show history once UI visible
}
function showLogin() {
  loginSection.style.display = "block";
  scannerSection.style.display = "none";
}

// Immediately check login
checkExistingLogin().then(({ token, isValid }) => {
  if (isValid) {
    showScanner();
  } else {
    clearTokenStorage();
    showLogin();
  }
});

// --- Logout handler (moved outside login click) ---
logoutBtn.addEventListener("click", () => {
  clearTokenStorage();
  alert("✅ Logged out.");
  showLogin();
});

// --- Login logic ---
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Email and Password are required.");
    return;
  }

  // Admin bypass (offline mode)
  if (email === "admin@beingbulls.in" && password === "beingadmin123") {
    saveToken("admin-bypass-token", "never");
    alert("✅ Logged in as Admin (offline mode)");
    showScanner();
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      // timeout not available in fetch; backend should respond quickly
    });

    if (!res.ok) {
      // try to parse backend error message
      let msg = `Login failed (${res.status})`;
      try {
        const errorBody = await res.json();
        msg = errorBody?.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }

    const data = await res.json();
    if (data.token) {
      const remember = rememberCheckbox?.checked;
      const expiry = remember ? "never" : (Date.now() + 7 * 24 * 60 * 60 * 1000).toString(); // 7 days by default

      saveToken(data.token, expiry);
      alert("✅ Logged in successfully");
      showScanner();
    } else {
      throw new Error("Invalid response from backend.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert(`🚫 Login failed: ${error.message || error}`);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});

// --- Signup redirect ---
signupLink.addEventListener("click", () => {
  // opens live website signup (change if different)
  window.open("https://beingbulls.in/signup", "_blank");
});

// --- Trigger scan ---
scanBtn.addEventListener("click", async () => {
  // Get latest token from chrome.storage (prefer authoritative source)
  chrome.storage.sync.get(["jwt"], (items) => {
    const token = items.jwt || localStorage.getItem("token");
    const feedback = document.getElementById("feedback-toggle")?.checked || false;

    if (!token) {
      alert("🔒 Please log in first.");
      return;
    }

    try {
      chrome.runtime.sendMessage({
        type: "TRIGGER_SCAN",
        token,
        feedback
      }, (resp) => {
        // optional callback
        console.log("Scan message sent, response:", resp);
      });
    } catch (err) {
      console.error("Scan error:", err);
      alert("⚠️ Scan failed to send. Is the extension background script loaded?");
    }
  });
});

// --- Load scan history ---
async function loadScanHistory() {
  // Prefer chrome.storage
  chrome.storage.sync.get(["jwt"], async (items) => {
    const token = items.jwt || localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/scan/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const result = await res.json();

      const tbody = document.querySelector("#scan-history tbody");
      tbody.innerHTML = "";

      if (!result?.history?.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4">😕 No scans yet.</td>`;
        tbody.appendChild(tr);
        return;
      }

      result.history.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${new Date(row.timestamp).toLocaleString()}</td>
          <td>${row.pattern || "-"}</td>
          <td>${row.emaConfirmed ? "✅" : "❌"}</td>
          <td>${row.confidence ?? "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Error loading history:", err);
      const tbody = document.querySelector("#scan-history tbody");
      tbody.innerHTML = `<tr><td colspan="4">⚠️ Unable to fetch data.</td></tr>`;
    }
  });
}


