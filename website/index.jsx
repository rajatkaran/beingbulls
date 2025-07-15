import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app"; // ✅ Yeh tera current app.jsx

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
