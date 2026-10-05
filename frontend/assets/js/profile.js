document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const role = localStorage.getItem("role");
  if (role != "buyer") {
    window.location.href = "index.html";
    return;
  }

  fetchProfileInfo();
  fetchOrderHistory();

  const profileForm = document.getElementById("profile-form");
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("user-name").value;
    const msgDiv = document.getElementById("profile-msg");
    const btn = document.getElementById("save-btn");

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Updating...`;

    try {
      const res = await fetch(`${API_BASE_URL}/buyer_profile/info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (res.ok) {
        msgDiv.innerHTML = `<div class="alert alert-success py-2 mt-2 mb-0 small fw-medium rounded-pill border-0"><i class="bi bi-check-circle-fill me-1"></i> ${data.message}</div>`;
        localStorage.setItem("username", data.username);
        setTimeout(() => {
          msgDiv.innerHTML = "";
        }, 3000);
      } else {
        msgDiv.innerHTML = `<div class="alert alert-danger py-2 mt-2 mb-0 small fw-medium rounded-pill border-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> ${data.error}</div>`;
      }
    } catch (err) {
      msgDiv.innerHTML = `<div class="alert alert-danger py-2 mt-2 mb-0 small fw-medium rounded-pill border-0"><i class="bi bi-wifi-off me-1"></i> Connection Error</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-floppy"></i> Update Profile`;
    }
  });
});

async function fetchProfileInfo() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE_URL}/buyer_profile/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("user-name").value = data.username;
      document.getElementById("user-email").value = data.email;
    }
  } catch (err) {
    console.error("Error fetching profile info:", err);
  }
}

async function fetchOrderHistory() {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("orders-tbody");

  try {
    const res = await fetch(`${API_BASE_URL}/buyer_profile/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await res.json();

    if (res.ok) {
      if (orders.length === 0) {
        tbody.innerHTML = `
              <tr>
                  <td colspan="5" class="text-center p-5 border-0">
                      <div class="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style="width: 80px; height: 80px;">
                          <i class="bi bi-box-seam text-muted" style="font-size: 2.5rem;"></i>
                      </div>
                      <h6 class="fw-bold text-dark mb-1">No orders yet</h6>
                      <p class="text-muted small mb-0">Looks like you haven't made any purchases.</p>
                  </td>
              </tr>`;
        return;
      }

      tbody.innerHTML = orders
        .map((o) => {
          let statusBadge = "";
          let statusText = o.status.toLowerCase();

          if (statusText === "completed" || statusText === "success") {
            statusBadge =
              "bg-success bg-opacity-10 text-success border border-success-subtle";
          } else if (statusText === "pending") {
            statusBadge =
              "bg-warning bg-opacity-10 text-warning border border-warning-subtle";
          } else {
            statusBadge =
              "bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle";
          }

          return `
                  <tr>
                      <td class="fw-bold text-dark px-3 py-3">#GL-${o.id}</td>
                      <td class="text-muted px-3 py-3">${new Date(
                        o.created_at
                      ).toLocaleDateString()}</td>
                      <td class="text-muted px-3 py-3" style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${
                        o.items
                      }">
                          <i class="bi bi-controller me-1 small"></i> ${o.items}
                      </td>
                      <td class="fw-bold text-dark px-3 py-3">$${
                        o.total_amount
                      }</td>
                      <td class="px-3 py-3">
                          <span class="badge ${statusBadge} rounded-pill px-3 py-2 fw-medium text-capitalize">
                              ${o.status}
                          </span>
                      </td>
                  </tr>
              `;
        })
        .join("");
    }
  } catch (err) {
    console.error("Error fetching order history:", err);
    tbody.innerHTML = `
          <tr>
              <td colspan="5" class="text-center p-4 border-0 text-danger">
                  <i class="bi bi-exclamation-triangle me-2"></i> Failed to load orders.
              </td>
          </tr>`;
  }
}
