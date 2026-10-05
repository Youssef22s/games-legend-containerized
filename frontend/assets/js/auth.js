const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success",
          text: "Account created successfully! Redirecting...",
          icon: "success",
          showConfirmButton: false,
        });
        setTimeout(() => (window.location.href = "login.html"), 2000);
      } else {
        Swal.fire({
          title: "Error",
          text: `${result.error || "An error occurred"}`,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Server connection error`,
        icon: "error",
      });
    }
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        localStorage.setItem("username", result.username);
        Swal.fire({
          title: "Success",
          text: "Login successful!",
          icon: "success",
          showConfirmButton: false,
        });
        setTimeout(() => {
          if (result.role === "admin") {
            window.location.href = "admin.html";
          } else if (result.role === "vendor") {
            window.location.href = "vendor.html";
          } else {
            window.location.href = "index.html";
          }
        }, 1000);
      } else {
        Swal.fire({
          title: "Error",
          text: `${result.error || "Invalid login credentials"}`,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Server connection error`,
        icon: "error",
      });
    }
  });
}
