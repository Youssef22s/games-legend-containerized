document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");
  const token = localStorage.getItem("token");

  console.log(orderId);

  if (!orderId || !token) {
    window.location.href = "admin.html";
    return;
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  document.getElementById("order-id-title").innerText = `#GL-${orderId}`;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: authHeaders,
    });

    if (res.ok) {
      const order = await res.json();
      renderOrderDetails(order);
    } else {
      document.getElementById("order-content").innerHTML = `
                <div class="text-center py-5">
                    <div class="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style="width: 80px; height: 80px;">
                        <i class="bi bi-exclamation-triangle fs-1"></i>
                    </div>
                    <h5 class="fw-bold text-dark">Order Not Found</h5>
                    <p class="text-muted mb-0">The order you are looking for might have been deleted or doesn't exist.</p>
                </div>`;
    }
  } catch (err) {
    console.error("Error fetching order details:", err);
    document.getElementById("order-content").innerHTML = `
            <div class="alert alert-danger rounded-4 border-0 text-center py-4">
                <i class="bi bi-wifi-off fs-4 d-block mb-2"></i> Failed to connect to the server.
            </div>`;
  }
});

function renderOrderDetails(order) {
  const content = document.getElementById("order-content");

  console.log(order);

  let itemsHtml = order.items
    .map(
      (item) => `
        <tr>
            <td class="fw-medium text-dark py-3">
                <div class="d-flex align-items-center gap-2 ps-2">
                    <i class="bi bi-box-seam text-muted"></i> ${item.title}
                </div>
            </td>
            <td class="text-muted py-3 ps-4">${item.quantity}</td>
            <td class="text-muted py-3 ps-4">$${parseFloat(
              item.price_at_purchase
            ).toFixed(2)}</td>
            <td class="fw-bold text-dark py-3">$${(
              item.price_at_purchase * item.quantity
            ).toFixed(2)}</td>
        </tr>
    `
    )
    .join("");

  let statusBadge = "";
  let statusText = (order.status || "").toLowerCase();

  if (statusText === "completed") {
    statusBadge =
      "bg-success bg-opacity-10 text-success border border-success-subtle";
  } else if (statusText === "pending") {
    statusBadge =
      "bg-warning bg-opacity-10 text-warning border border-warning-subtle";
  } else {
    statusBadge =
      "bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle";
  }

  const date = new Date(order.created_at);
  const formatted = date.toUTCString().replace(" GMT", "");

  content.innerHTML = `
        <div class="row g-4 mb-5 pb-4 border-bottom border-light-subtle">
            <div class="col-md-6">
                <div class="d-flex align-items-start gap-3">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style="width: 50px; height: 50px;">
                        <i class="bi bi-person-fill fs-4 text-white"></i>
                    </div>
                    <div>
                        <p class="text-muted small fw-semibold text-uppercase mb-1" style="letter-spacing: 0.5px;">Customer Details</p>
                        <h5 class="fw-bold text-dark mb-1">${
                          order.buyer_name
                        }</h5>
                        <p class="text-muted mb-0 d-flex align-items-center gap-2">
                            <i class="bi bi-envelope"></i> ${order.buyer_email}
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 text-md-end">
                <p class="text-muted small fw-semibold text-uppercase mb-2" style="letter-spacing: 0.5px;">Order Status</p>
                <span class="badge ${statusBadge} rounded-pill px-3 py-2 fw-medium text-capitalize fs-6 shadow-sm mb-2">
                    ${order.status}
                </span>
                <p class="small text-muted mb-0 mt-2">
                    <i class="bi bi-calendar3 me-1"></i> Placed on: ${formatted}
                </p>
            </div>
        </div>

        <h6 class="fw-bold mb-3 text-dark"><i class="bi bi-cart3 me-2 text-primary"></i>Order Items</h6>
        <div class="table-responsive rounded-3 border border-light-subtle">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="py-3 px-3 border-bottom-0 text-muted fw-semibold">Product</th>
                        <th class="py-3 px-3 border-bottom-0 text-muted fw-semibold">Qty</th>
                        <th class="py-3 px-3 border-bottom-0 text-muted fw-semibold">Unit Price</th>
                        <th class="py-3 px-3 border-bottom-0 text-muted fw-semibold">Total</th>
                    </tr>
                </thead>
                <tbody class="border-top-0 px-3">
                    ${itemsHtml}
                </tbody>
                <tfoot class="bg-light">
                    <tr>
                        <td colspan="3" class="text-end fw-bold py-3 text-dark fs-6 border-0">Total Amount:</td>
                        <td class="text-primary fw-bold fs-5 py-3 border-0">$${parseFloat(
                          order.total_amount
                        ).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}
