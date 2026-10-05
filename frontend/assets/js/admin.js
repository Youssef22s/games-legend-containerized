const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: authHeaders,
    });
    const data = await response.json();

    console.log("data", data);

    if (response.ok) {
      document.getElementById("vendors-count").innerText = data.vendors_count;
      document.getElementById("buyers-count").innerText = data.buyers_count;
      document.getElementById("products-count").innerText = data.products_count;
      document.getElementById("orders-count").innerText = data.orders_count;
    } else {
      Swal.fire({
        title: `${response.statusText}`,
        text: "You do not have permission to access this page",
        icon: "error",
      }).then(() => {
        window.location.replace("index.html");
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadVendors() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendors`, {
      headers: authHeaders,
    });
    const vendors = await response.json();

    const tbody = document.getElementById("vendors-list");
    tbody.innerHTML = "";

    if (response.ok) {
      vendors.forEach((vendor) => {
        tbody.innerHTML += `
                    <tr>
                        <td>
                            <span class="badge bg-light text-dark border px-2 py-1">#${vendor.id}</span>
                        </td>
                        <td class="fw-medium text-dark">${vendor.username}</td>
                        <td class="text-muted small">${vendor.email}</td>
                        <td class="text-end">
                            <button class="btn btn-outline-primary btn-sm rounded-pill px-3 me-1" 
                                    onclick="window.location.href='admin_vendor_details.html?id=${vendor.id}'">
                                <i class="bi bi-eye me-1"></i> View
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="deleteVendor(${vendor.id})">
                                <i class="bi bi-trash3 me-1"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
      });
    }
  } catch (error) {
    console.error(error);
  }
}

document
  .getElementById("addVendorForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const vendorData = {
      username: document.getElementById("v-username").value,
      email: document.getElementById("v-email").value,
      password: document.getElementById("v-password").value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/vendors`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(vendorData),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success",
          text: "Vendor added successfully",
          icon: "success",
        });
        document.getElementById("addVendorForm").reset();
        loadVendors();
        loadDashboardStats();
      } else {
        Swal.fire({
          title: "Error",
          text: `${(result.error || "Failed to add vendor", "danger")}`,
          icon: "Error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Server connection error`,
        icon: "Error",
      });
    }
  });

async function deleteVendor(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to remove this vendor from the platform?",
    icon: "warning",
    showDenyButton: true,
    confirmButtonText: "Yes, remove it",
    denyButtonText: "No",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });

        if (response.ok) {
          Swal.fire({
            title: "Success",
            text: "Vendor deleted successfully",
            icon: "success",
          });
          loadVendors();
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to delete vendor",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Error while deleting",
          icon: "error",
        });
      }
    }
  });
}

async function fetchAdminNotifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/`, {
      headers: authHeaders,
    });
    if (response.ok) {
      const data = await response.json();
      updateNotificationUI(data.notifications, data.unread_count);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

function updateNotificationUI(notifications, unreadCount) {
  const badge = document.getElementById("notif-badge");
  const list = document.getElementById("notif-list");

  if (unreadCount > 0) {
    badge.style.display = "inline-block";
    badge.innerText = unreadCount > 99 ? "99+" : unreadCount;
  } else {
    badge.style.display = "none";
  }

  if (!notifications || notifications.length === 0) {
    list.innerHTML = `<li><span class="dropdown-item text-center text-muted small py-4">No notifications yet.</span></li>`;
    return;
  }

  list.innerHTML = notifications
    .map((n) => {
      const isUnread = !n.is_read;
      const dateStr = new Date(n.created_at).toLocaleString("en-GB", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Africa/Cairo",
      });

      return `
      <li>
        <a class="dropdown-item border-bottom py-3 ${
          isUnread ? "bg-light" : ""
        }" href="#" onclick="markNotifAsRead(${n.id}, ${n.order_id}, event)">
          <div class="d-flex align-items-start gap-2">
            ${
              isUnread
                ? '<i class="bi bi-circle-fill text-primary mt-1" style="font-size: 0.5rem;"></i>'
                : '<div style="width: 0.5rem;"></div>'
            }
            <div class="d-flex flex-column text-wrap">
              <span class="small ${
                isUnread ? "fw-bold text-dark" : "text-muted"
              }">${n.message}</span>
              <small class="text-secondary mt-1" style="font-size: 0.75rem;">${
                n.created_at
              }</small>
            </div>
          </div>
        </a>
      </li>
    `;
    })
    .join("");
}

async function markNotifAsRead(notifId, orderId, event) {
  event.preventDefault();
  event.stopPropagation();

  const badge = document.getElementById("notif-badge");
  let count = parseInt(badge.innerText);
  if (!isNaN(count) && count > 0) {
    count--;
    badge.innerText = count;
    if (count === 0) badge.style.display = "none";
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notifId}/read`,
      {
        method: "PUT",
        headers: authHeaders,
      }
    );

    if (response.ok) {
      if (orderId) {
        window.location.href = `admin_order_details.html?id=${orderId}`;
      } else {
        fetchAdminNotifications();
      }
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

let allOrders = [];
let currentPage = 1;
const ordersPerPage = 5;

async function loadAllOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: authHeaders,
    });

    const orders = await response.json();
    const tbody = document.getElementById("orders-list");

    if (response.ok) {
      allOrders = orders;
      currentPage = 1;
      renderOrders();
      renderPagination();
    }
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

function renderOrders() {
  const tbody = document.getElementById("orders-list");
  tbody.innerHTML = "";

  if (allOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          No orders found.
        </td>
      </tr>
    `;
    return;
  }

  const start = (currentPage - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const paginatedOrders = allOrders.slice(start, end);

  paginatedOrders.forEach((order) => {
    const statusClass =
      order.status === "completed"
        ? "bg-success bg-opacity-10 text-success border border-success-subtle"
        : "bg-warning bg-opacity-10 text-warning border border-warning-subtle";

    tbody.innerHTML += `
      <tr>
        <td>
          <span class="badge bg-light text-dark border px-2 py-1">
            #${order.id}
          </span>
        </td>
        <td class="fw-medium text-dark">${order.buyer_name}</td>
        <td class="text-muted small">
          ${new Date(order.created_at).toLocaleDateString()}
        </td>
        <td class="fw-bold">$${order.total_amount}</td>
        <td>
          <span class="badge ${statusClass} rounded-pill px-2 py-1 fw-medium text-capitalize fs-8 shadow-sm mb-2">
            ${order.status}
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-outline-primary btn-sm rounded-pill px-3"
            onclick="window.location.href='admin_order_details.html?id=${
              order.id
            }'">
            <i class="bi bi-eye me-1"></i> View
          </button>
        </td>
      </tr>
    `;
  });
}

function renderPagination() {
  const totalPages = Math.ceil(allOrders.length / ordersPerPage);
  const pagination = document.getElementById("pagination");

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = "";

  const prevDisabled = currentPage === 1 ? "disabled" : "";
  html += `
    <li class="page-item ${prevDisabled}">
      <button class="page-link border-0 rounded-circle text-secondary bg-transparent fw-bold" onclick="goToPage(${
        currentPage - 1
      })">
      <i class="fa-solid fa-angle-left"></i>
      </button>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    const btnClass = isActive
      ? "btn-primary shadow text-white fw-bold"
      : "btn-white bg-white shadow-sm text-dark border-light-subtle";

    html += `
      <li class="page-item">
        <button class="btn rounded-circle d-flex align-items-center justify-content-center transition ${btnClass}" 
                style="width: 40px; height: 40px;" 
                onclick="goToPage(${i})">
          ${i}
        </button>
      </li>
    `;
  }

  const nextDisabled = currentPage === totalPages ? "disabled" : "";
  html += `
    <li class="page-item ${nextDisabled}">
      <button class="page-link border-0 rounded-circle text-secondary bg-transparent fw-bold" onclick="goToPage(${
        currentPage + 1
      })">
      <i class="fa-solid fa-angle-right"></i>
      </button>
    </li>
  `;

  pagination.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderOrders();
  renderPagination();
}

function switchSection(sectionName) {
  const allSections = document.querySelectorAll(".admin-section");
  allSections.forEach((section) => {
    section.classList.add("d-none");
  });
  const targetSection = document.getElementById("section-" + sectionName);
  if (targetSection) {
    targetSection.classList.remove("d-none");
  }

  document.querySelectorAll(".nav-section-btn").forEach((btn) => {
    if (btn.id === `btn-${sectionName}`) {
      btn.classList.add("btn-primary", "text-white");
      btn.classList.remove("bg-transparent", "text-secondary");
    } else {
      btn.classList.remove("btn-primary", "text-white");
      btn.classList.add("bg-transparent", "text-secondary");
    }
  });
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/categories`, {
      headers: authHeaders,
    });
    const categories = await res.json();
    const tbody = document.getElementById("categories-list");
    tbody.innerHTML = "";

    if (res.ok) {
      if (categories.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="3" class="text-center text-muted">No categories found.</td></tr>';
        return;
      }
      categories.forEach((cat) => {
        tbody.innerHTML += `
          <tr>
            <td><span class="badge bg-light text-dark border px-2 py-1">#${cat.id}</span></td>
            <td class="fw-medium text-dark">${cat.name}</td>
            <td class="text-end">
              <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 me-1" onclick="editCategory(${cat.id}, '${cat.name}')">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
              <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="deleteCategory(${cat.id})">
                <i class="bi bi-trash3 me-1"></i> Delete
              </button>
            </td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

document
  .getElementById("addCategoryForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("cat-name");
    const name = nameInput.value.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Category has been created.",
          timer: 1500,
          showConfirmButton: false,
        });
        nameInput.value = "";
        loadCategories();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.error || "Failed to add category", "error");
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  });

async function editCategory(id, currentName) {
  const { value: newName } = await Swal.fire({
    title: "Edit Category",
    input: "text",
    inputValue: currentName,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });

  if (newName && newName !== currentName) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          timer: 1500,
          showConfirmButton: false,
        });
        loadCategories();
      } else {
        Swal.fire("Error", "Failed to update category", "error");
      }
    } catch (err) {
      console.error(err);
    }
  }
}

async function deleteCategory(id) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (res.ok) {
        Swal.fire("Deleted!", "Category has been deleted.", "success");
        loadCategories();
      } else {
        const data = await res.json();
        Swal.fire(
          "Error",
          data.error ||
            "Failed to delete. Make sure it has no linked products.",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardStats();
  loadVendors();
  loadAllOrders();
  loadCategories();

  fetchAdminNotifications();
  setInterval(fetchAdminNotifications, 30000);
});
