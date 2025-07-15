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
const BACKEND_URL = "https://beingbulls-backend.onrender.com";
const RAZORPAY_KEY = "your_razorpay_key";

 // ✅ Use your actual backend URL

// ✅ Auto-login if token is stored
const token = localStorage.getItem("token");
const expiry = localStorage.getItem("loginExpiry");

let isValid = false;
if (token) {
  if (expiry === "never") {
    isValid = true;
  } else {
    const now = new Date();
    const exp = new Date(Number(expiry));
    isValid = now <= exp;
  }
}

if (isValid) {
  loginSection.style.display = "none";
  scannerSection.style.display = "block";
  loadScanHistory();
} else {
  localStorage.removeItem("token");
  localStorage.removeItem("loginExpiry");
}


// 🔐 Login logic
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Email and Password are required.");
    return;
  }

//Logout Button Logic
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("loginExpiry");

  // ✅ Clear chrome.storage JWT
  chrome.storage.sync.remove("jwt", () => {
    console.log("🧹 JWT removed from chrome.storage");
  });

  loginSection.style.display = "block";
  scannerSection.style.display = "none";
});



  // ✅ Admin bypass (offline mode)
  if (email === "admin@beingbulls.in" && password === "beingadmin123") {
    localStorage.setItem("token", "admin-bypass-token");
    alert("✅ Logged in as Admin (offline mode)");
    loginSection.style.display = "none";
    scannerSection.style.display = "block";
    loadScanHistory();
    return;
  }

  // 🌐 Normal API login
  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.token) {
  localStorage.setItem("token", data.token);

  // ✅ NEW: Store JWT in chrome.storage
  chrome.storage.sync.set({ jwt: data.token }, () => {
    console.log("✅ JWT stored in chrome.storage");
  });

  alert("✅ Logged in successfully");
  loginSection.style.display = "none";
  scannerSection.style.display = "block";
  loadScanHistory();
 }else {
      alert("❌ Invalid login. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("🚫 Backend not reachable. Try again later or use admin login.");
  }
});

// 🔗 Redirect to sign-up page
signupLink.addEventListener("click", () => {
  window.open("https://beingbulls.in/signup", "_blank");
});

// 🔍 Trigger scan
scanBtn.addEventListener("click", () => {
  const token = localStorage.getItem("token");
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
    });
  } catch (err) {
    console.error("Scan error:", err);
    alert("⚠️ Scan failed or backend not connected.");
  }
});

// 📜 Load scan history table
async function loadScanHistory() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${BACKEND_URL}/scan/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
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
        <td>${row.pattern}</td>
        <td>${row.emaConfirmed ? "✅" : "❌"}</td>
        <td>${row.confidence}%</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading history:", err);
    const tbody = document.querySelector("#scan-history tbody");
    tbody.innerHTML = `<tr><td colspan="4">⚠️ Unable to fetch data.</td></tr>`;
  }
}
