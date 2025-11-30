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


// extension/panel.js (production)
const BACKEND_URL = "https://beingbulls-backend.onrender.com";

// DOM refs assumed present in panel.html
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

// helper to use chrome.storage with promises
function getStorage(keys){ return new Promise(res=> chrome.storage.sync.get(keys, items=>res(items))); }
function setStorage(obj){ return new Promise(res=> chrome.storage.sync.set(obj, ()=>res())); }
function removeStorage(keys){ return new Promise(res=> chrome.storage.sync.remove(keys, ()=>res())); }

async function showScanner(){ if(loginSection) loginSection.style.display="none"; if(scannerSection) scannerSection.style.display="block"; loadScanHistory(); }
async function showLogin(){ if(loginSection) loginSection.style.display="block"; if(scannerSection) scannerSection.style.display="none"; }

(async ()=>{
  const items = await getStorage(["jwt","loginExpiry"]);
  let token = items.jwt || null;
  let expiry = items.loginExpiry || null;
  if(!token){
    try{ token = localStorage.getItem("token"); expiry = localStorage.getItem("loginExpiry"); }catch(e){}
  }
  let isValid=false;
  if(token){
    if(expiry === "never") isValid = true;
    else isValid = Date.now() <= (Number(expiry)||0);
  }
  if(isValid) showScanner(); else { await removeStorage(["jwt","loginExpiry"]); try{ localStorage.removeItem("token"); localStorage.removeItem("loginExpiry"); }catch(e){} showLogin(); }
})();

// send OTP
if(otpBtn){
  otpBtn.addEventListener("click", async ()=>{
    const email = (emailInput?.value||"").trim();
    if(!email){ alert("Enter email"); return; }
    otpBtn.disabled = true;
    try{
      const res = await fetch(`${BACKEND_URL}/auth/send-otp`, {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({email})
      });
      if(!res.ok) throw new Error("Failed to send");
      alert("OTP sent to email");
    }catch(e){ console.error(e); alert("Could not send OTP"); }
    finally{ otpBtn.disabled=false; }
  });
}

// verify OTP
if(verifyOtpBtn){
  verifyOtpBtn.addEventListener("click", async ()=>{
    const email = (emailInput?.value||"").trim();
    const otp = (otpInput?.value||"").trim();
    if(!email || !otp){ alert("Enter email & OTP"); return; }
    verifyOtpBtn.disabled = true;
    try{
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email, otp})
      });
      if(!res.ok){ const txt = await res.text().catch(()=>""); throw new Error(txt||"Invalid"); }
      const j = await res.json();
      const token = j.access_token;
      const remember = rememberCheckbox?.checked;
      const expiry = remember ? "never" : (Date.now() + 7*24*60*60*1000).toString();
      await setStorage({ jwt: token, loginExpiry: expiry });
      try{ localStorage.setItem("token", token); localStorage.setItem("loginExpiry", expiry); }catch(e){}
      alert("Logged in");
      showScanner();
    }catch(e){ console.error(e); alert("Login failed"); }
    finally{ verifyOtpBtn.disabled=false; }
  });
}

// logout
if(logoutBtn) logoutBtn.addEventListener("click", async ()=>{ await removeStorage(["jwt","loginExpiry"]); try{ localStorage.removeItem("token"); localStorage.removeItem("loginExpiry"); }catch(e){} alert("Logged out"); showLogin(); });

// trigger scan
if(scanBtn){
  scanBtn.addEventListener("click", async ()=>{
    const items = await getStorage(["jwt"]);
    const token = items.jwt || localStorage.getItem("token");
    const feedback = document.getElementById("feedback-toggle")?.checked || false;
    if(!token){
      alert("Please login first");
      return;
    }
    // send message to active tab's content script
    chrome.tabs.query({active:true,currentWindow:true}, (tabs)=>{
      if(!tabs || !tabs[0]){ alert("No active tab"); return; }
      chrome.tabs.sendMessage(tabs[0].id, { type: "TRIGGER_SCAN", token, feedback }, (resp)=>{ console.log("scan sent", resp); });
    });
  });
}

// receive results
chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
  if(!msg) return;
  if(msg.type === "SCAN_RESULT"){
    const tbody = document.querySelector("#scan-history tbody");
    if(!tbody) return;
    if(!msg.success){
      tbody.innerHTML = `<tr><td colspan="4">⚠️ ${msg.error || "Scan failed"}</td></tr>`;
      return;
    }
    const patterns = msg.data || [];
    tbody.innerHTML = "";
    if(!patterns.length){ tbody.innerHTML = `<tr><td colspan="4">😕 No patterns detected</td></tr>`; return; }
    patterns.forEach(p=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${new Date().toLocaleString()}</td><td>${p.pattern||p.name||"-"}</td><td>${p.trend||"-"}</td><td>${Math.round(p.confidence||0)}%</td>`;
      tbody.appendChild(tr);
    });
  }
});

// load history from backend
async function loadScanHistory(){
  const items = await getStorage(["jwt"]);
  const token = items.jwt || localStorage.getItem("token");
  if(!token) return;
  try{
    const res = await fetch(`${BACKEND_URL}/scan/history`, { headers: { Authorization: `Bearer ${token}` } });
    if(!res.ok) throw new Error("no history");
    const json = await res.json();
    const tbody = document.querySelector("#scan-history tbody");
    if(!tbody) return;
    tbody.innerHTML = "";
    if(!json?.history?.length){ tbody.innerHTML = `<tr><td colspan="4">😕 No scans yet.</td></tr>`; return; }
    json.history.forEach(r=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${new Date(r.timestamp).toLocaleString()}</td><td>${r.pattern||"-"}</td><td>${r.emaConfirmed ? "✅" : "❌"}</td><td>${r.confidence ?? "-"}</td>`;
      tbody.appendChild(tr);
    });
  }catch(e){
    console.error("history error", e);
  }
}
