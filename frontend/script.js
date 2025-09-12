const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

// ===== Tab Switching =====
document.getElementById("loginTab").addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  document.getElementById("loginTab").classList.add("text-green-400", "font-bold");
  document.getElementById("signupTab").classList.remove("text-green-400", "font-bold");
});

document.getElementById("signupTab").addEventListener("click", () => {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  document.getElementById("signupTab").classList.add("text-green-400", "font-bold");
  document.getElementById("loginTab").classList.remove("text-green-400", "font-bold");
});

// ===== Helper: Messages =====
function showMessage(text, type) {
  message.textContent = text;
  message.className =
    "mt-4 text-center text-sm " +
    (type === "success" ? "text-green-400" : "text-red-400");
}

// ===== Signup =====
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user_name = document.getElementById("signupUser").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name, password }),
    });
    const data = await res.json();
    showMessage(data.message || "Account created!", data.success ? "success" : "error");
  } catch {
    showMessage("Server error – could not connect", "error");
  }
});

// ===== Login =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user_name = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name, password }),
    });
    const data = await res.json();
    showMessage(data.message, data.success ? "success" : "error");

    if (data.success) {
      // redirect to dashboard
      window.location.href = "dashboard.html";
    }
  } catch {
    showMessage("Server error – could not connect", "error");
  }
});
