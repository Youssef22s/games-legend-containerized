const API_BASE_URL = "/api";

function updateNavbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navLinks = document.getElementById("nav-links");

  if (!navLinks) return;

  if (token) {
    const compareList = JSON.parse(localStorage.getItem("compareList")) || [];
    const compareCount = compareList.length;

    navLinks.innerHTML = `

    ${role === "buyer" ? `<li class="nav-item ms-lg-3 mt-3 mt-lg-0">
    <a href="compare.html" class="btn btn-outline-light rounded-pill px-4 py-1 d-flex align-items-center gap-2 position-relative transition">
      <i class="bi bi-arrow-left-right fs-6"></i>
      <span class="fw-medium">Compare</span>
        ${
          compareCount > 0
            ? `<span 
        class="position-absolute badge rounded-pill bg-primary border border-2 border-dark translate-middle"
        style="
          top: 10%;
          left: 95%;
          font-size: 0.7rem;
          padding: 0.3rem 0.5rem;
        ">
        ${compareCount}
      </span>`
            : ""
        }
    </a>
  </li>

  <li class="nav-item ms-lg-3 mt-3 mt-lg-0">
    <a href="cart.html" class="btn btn-outline-light rounded-pill px-4 py-1 d-flex align-items-center gap-2 position-relative transition">
      <i class="bi bi-cart3 fs-6"></i>
      <span class="fw-medium">Cart</span>
    </a>
  </li>

  <li class="nav-item ms-lg-3 mt-3 mt-lg-0">
    <a href="profile.html" class="btn btn-outline-light rounded-pill px-4 py-1 d-flex align-items-center gap-2 position-relative transition">
      <i class="fa-solid fa-user fs-6"></i>
      <span class="fw-medium">Profile</span>
    </a>
  </li>` : ""}
      

      <li class="nav-item ms-lg-4 mt-3 mt-lg-0">
        <button onclick="logout()" class="btn btn-danger rounded-pill px-4 py-1 d-flex align-items-center gap-2 transition fw-medium shadow-sm border-0">
          <i class="bi bi-box-arrow-right fs-6"></i>
          <span>Logout</span>
        </button>
      </li>
    `;
  } else {
    navLinks.innerHTML = `
        <li class="nav-item">
            <a class="nav-link text-light px-3 transition" href="login.html">
                Sign in
            </a>
        </li>
        <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
            <a class="btn btn-primary rounded-pill px-4 transition shadow-sm fw-medium" href="register.html">
                Create Account
            </a>
        </li>
    `;
  }
}

function updateHeroSection() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const heroButtons = document.getElementById("hero-buttons");

  if (!heroButtons) return;

  if (token) {
    let actionButton = "";

    if (role === "admin") {
      actionButton = `
              <a href="admin.html" class="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
                  <i class="bi bi-shield-lock me-2"></i> Admin Dashboard
              </a>
          `;
    } else if (role === "vendor") {
      actionButton = `
              <a href="vendor.html" class="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
                  <i class="bi bi-shop me-2"></i> Vendor Dashboard
              </a>
          `;
    } else {
      actionButton = `
              <a href="#products-section" class="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
                  <i class="bi bi-controller me-2"></i> Explore Products
              </a>
          `;
    }

    heroButtons.innerHTML = `
          <div class="d-flex flex-column align-items-center gap-3">
              <div class="hero-welcome-badge bg-white border rounded-pill px-4 py-2 shadow-sm d-inline-flex align-items-center">
                  <i class="bi bi-person-circle text-primary fs-5 me-2"></i>
                  <span class="hero-welcome-text fw-semibold text-dark">
                      Welcome back ${username} 👋
                  </span>
              </div>
              ${actionButton}
          </div>
      `;
  } else {
    heroButtons.innerHTML = `
          <a href="register.html" class="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
              Get Started <i class="bi bi-arrow-right ms-2"></i>
          </a>
          <a href="login.html" class="btn btn-white bg-white border text-dark btn-lg px-5 rounded-pill shadow-sm">
              Sign In
          </a>
      `;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("compareList");
  window.location.href = "login.html";
}

async function loadPublicProducts() {
  const container = document.getElementById("public-products-list");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/products/all`);
    const products = await res.json();

    container.innerHTML = "";

    if (res.ok && products.length > 0) {
      const role = localStorage.getItem("role");
      products.forEach((p) => {
        const isAdded = compareList.includes(p.id);
        container.innerHTML += `
        <div class="col-md-6 col-lg-4">
          <div class="card product-card h-100 rounded-4 overflow-hidden position-relative">
        
            ${role === "buyer" ? `<button class="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-pill shadow-sm z-3 transition btn-compare" 
                                    data-id="${p.id}"
                                    onclick="toggleCompare(${p.id})"
                                    style="backdrop-filter: blur(5px); background-color: rgba(255, 255, 255, 0.9);" 
                                    title="Compare this game">
                                      <i class="bi ${isAdded ? "bi-x-circle text-danger" : "bi-arrow-left-right text-dark"} me-1 toggle-icon"></i> 
                                      <span class="${isAdded ? "text-danger" : "text-dark"} fw-medium small toggle-text">${isAdded ? "Remove" : "Compare"}</span>
                                  </button>`
                                : ""
            }
            
            <div class="card-img-placeholder">
                <i class="bi bi-joystick" style="font-size: 4rem;"></i>
            </div>
    
            <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge bg-primary bg-opacity-10 text-white px-3 py-2 rounded-pill fw-medium">
                        ${p.category_name || "Uncategorized"}
                    </span>
                    <span class="text-muted small fw-medium">
                        <i class="bi bi-shop me-1"></i>${p.vendor_name}
                    </span>
                </div>
    
                <h5 class="card-title fw-bold text-dark mb-2">
                    ${p.title}
                </h5>
                <p class="card-text text-muted small flex-grow-1 line-clamp-2">
                    ${
                      p.description
                        ? p.description
                        : "No description available for this game."
                    }
                </p>
    
                <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <h4 class="text-dark fw-bold mb-0">
                        $${p.price}
                    </h4>
                    
                    <div class="d-flex align-items-center gap-3">
                        <button class="btn btn-primary btn-sm rounded-pill px-4 py-2 shadow-sm transition fw-medium" onclick="addToCart(${
                          p.id
                        })">
                            <i class="bi bi-cart-plus me-1"></i> Add to cart
                        </button>
                    </div>
                </div>
                </div>
          </div>
        </div>
        `;
      });
    } else {
      container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3 fs-5">No games available at the moment. Check back soon!</p>
            </div>
        `;
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    container.innerHTML = `
        <div class="col-12 text-center text-danger py-5">
            <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i>
            <p class="mt-3 fs-5">Oops! Error loading products. Is the server running?</p>
        </div>
    `;
  }
}

let compareList = JSON.parse(localStorage.getItem("compareList")) || [];

function toggleCompare(productId) {
  const index = compareList.indexOf(productId);
  const btn = document.querySelector(`.btn-compare[data-id="${productId}"]`);

  if (index > -1) {
    compareList.splice(index, 1);
    updateButtonStyle(btn, false);
  } else {
    if (compareList.length >= 4) {
      Swal.fire({
        title: "Limit reached!",
        text: "You can only compare up to 4 products.",
        icon: "error",
      });
      return;
    }
    compareList.push(productId);

    updateButtonStyle(btn, true);
  }
  localStorage.setItem("compareList", JSON.stringify(compareList));
  updateNavbar();
}

function updateButtonStyle(btn, isActive) {
  if (!btn) return;

  const icon = btn.querySelector(".toggle-icon");
  const textSpan = btn.querySelector(".toggle-text");

  if (isActive) {
    icon.className = "bi bi-x-circle text-danger me-1 toggle-icon";
    textSpan.className = "text-danger fw-medium small toggle-text";
    textSpan.innerText = "Remove";
  } else {
    icon.className = "bi bi-arrow-left-right text-dark me-1 toggle-icon";
    textSpan.className = "text-dark fw-medium small toggle-text";
    textSpan.innerText = "Compare";
  }
}

async function addToCart(productId) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "buyer";

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (role !== "buyer") {
    Swal.fire({
      text: "Only buyers can add products to the cart!",
      icon: "error",
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        text: "Product added to cart successfully!",
        icon: "success",
      });
    } else {
      Swal.fire({
        text: `${data.error}`,
        icon: "error",
      });
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  updateHeroSection();
  loadPublicProducts();
});
