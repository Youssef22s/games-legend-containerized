document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const vendorId = urlParams.get("id");

  if (!vendorId) {
    Swal.fire({
      title: "Error",
      text: "Vendor ID is missing!",
      icon: "error",
    }).then(() => {
      window.location.href = "admin.html";
    });
    return;
  }

  loadVendorFullDetails(vendorId, token);
});

async function loadVendorFullDetails(vendorId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vendor details");
    }

    const data = await response.json();

    console.log(data.products);

    document.getElementById("vendor-name").innerText = data.vendor.username;
    document.getElementById("vendor-email").innerText = data.vendor.email;

    const productsTbody = document.getElementById("vendor-products-list");
    if (data.products.length === 0) {
      productsTbody.innerHTML =
        '<tr><td colspan="3" class="text-center text-muted py-3">No products found.</td></tr>';
    } else {
      productsTbody.innerHTML = data.products
        .map(
          (p) => `
                <tr>
                    <td class="fw-medium text-dark">${p.title}</td>
                    <td class="desc">${p.description}</td>
                    <td class="text-success fw-bold">$${p.price}</td>
                    <td>${p.category_name}</td>
                </tr>
            `
        )
        .join("");
    }

    const ordersTbody = document.getElementById("vendor-orders-list");
    if (data.orders.length === 0) {
      ordersTbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-muted py-3">No sales yet.</td></tr>';
    } else {
      ordersTbody.innerHTML = data.orders
        .map(
          (o) => `
                <tr>
                    <td><span class="badge bg-light text-dark border">#${o.order_id}</span></td>
                    <td class="text-dark small">${o.product_title}</td>
                    <td class="text-muted small">${o.buyer_name}</td>
                    <td class="text-center">${o.quantity}</td>
                    <td class="text-end fw-bold text-primary">$${o.total_earned}</td>
                </tr>
            `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("vendor-name").innerText = "Error loading data";
    document.getElementById("vendor-products-list").innerHTML =
      '<tr><td colspan="3" class="text-center text-danger">Connection error.</td></tr>';
    document.getElementById("vendor-orders-list").innerHTML =
      '<tr><td colspan="5" class="text-center text-danger">Connection error.</td></tr>';
  }
}
