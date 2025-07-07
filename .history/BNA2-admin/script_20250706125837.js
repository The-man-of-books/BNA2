// Redirect to upload page if already logged in
if (localStorage.getItem("bna_logged_in") === "true") {
  window.location.href = "upload.html";
}

async function login() {
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("error");

  try {
    const res = await fetch("http://localhost:3000/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password })
    });

    const result = await res.json();

    if (result.success) {
      localStorage.setItem("bna_logged_in", "true");
      window.location.href = "upload.html";
    } else {
      errorBox.style.display = "block";
      errorBox.innerText = result.message || "Incorrect password"; // Fallback message
    }
  } catch (err) {
    errorBox.style.display = "block";
    errorBox.innerText = "Server error. Try again.";
  }
}

// Logout functionality
function logout() {
  localStorage.removeItem("bna_logged_in");
  window.location.href = "login.html";
}

// Show logout button if logged in
if (localStorage.getItem("bna_logged_in") === "true") {
  document.getElementById("logoutBtn").style.display = "block";
}
