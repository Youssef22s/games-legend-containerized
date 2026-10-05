document.addEventListener("DOMContentLoaded", async () => {
  const compareList = JSON.parse(localStorage.getItem("compareList")) || [];
  const tbody = document.getElementById("compare-tbody");

  if (compareList.length === 0) {
    tbody.innerHTML = `
              <tr>
                  <td class="p-5 text-center border-0">
                      <div class="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style="width: 80px; height: 80px;">
                          <i class="bi bi-inbox text-muted" style="font-size: 2.5rem;"></i>
                      </div>
                      <h5 class="fw-bold text-dark mb-2">No games to compare</h5>
                      <p class="text-muted mb-4">You haven't selected any games for comparison yet.</p>
                      <a href="index.html" class="btn btn-primary rounded-pill px-5 py-2 shadow-sm transition">
                          <i class="bi bi-controller me-2"></i>Browse Games
                      </a>
                  </td>
              </tr>`;
    return;
  }

  try {
    const fetchPromises = compareList.map((id) =>
      fetch(`${API_BASE_URL}/products/${id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
    );

    const products = await Promise.all(fetchPromises);

    const rows = [
      { label: "Product Name", key: "title", isBold: true },
      { label: "Price", key: "price", prefix: "$", isPrice: true },
      { label: "Category", key: "category_name", isBadge: true },
      { label: "Vendor", key: "vendor_name", isVendor: true },
      { label: "Description", key: "description" },
    ];

    let html = "";

    rows.forEach((row) => {
      html += `<tr><th class="bg-light text-start text-muted w-25 align-middle fw-semibold px-4">${row.label}</th>`;

      products.forEach((p) => {
        let val = p[row.key] || "N/A";
        if (row.prefix && val !== "N/A") val = row.prefix + val;

        let cellContent = `<span class="text-muted">${val}</span>`;

        if (row.isBold)
          cellContent = `<h5 class="fw-bold text-dark mb-0">${val}</h5>`;
        if (row.isPrice)
          cellContent = `<span class="fw-bold text-dark fs-5">${val}</span>`;
        if (row.isBadge)
          cellContent = `<span class="badge bg-primary bg-opacity-10 text-white px-3 py-2 rounded-pill fw-medium">${val}</span>`;
        if (row.isVendor)
          cellContent = `<span class="fw-medium text-dark"><i class="bi bi-shop me-1 text-muted"></i>${val}</span>`;

        html += `<td class="px-4 py-3">${cellContent}</td>`;
      });
      html += `</tr>`;
    });

    html += `<tr><th class="bg-light text-start text-muted align-middle fw-semibold px-4 border-bottom-0">Actions</th>`;
    products.forEach((p) => {
      html += `
                  <td class="px-4 py-4 border-bottom-0">
                      <button class="btn btn-primary rounded-pill btn-sm w-100 mb-2 py-2 fw-medium shadow-sm transition d-flex justify-content-center align-items-center gap-2" onclick="addToCart(${p.id})">
                          <i class="bi bi-cart-plus fs-5"></i> Add to Cart
                      </button>
                      <button class="btn btn-light text-danger rounded-pill btn-sm w-100 py-2 fw-medium transition border-0 bg-danger bg-opacity-10 hover-danger" onclick="removeFromComparePage(${p.id})">
                          <i class="bi bi-trash3"></i> Remove
                      </button>
                  </td>
              `;
    });
    html += `</tr>`;

    tbody.innerHTML = html;
  } catch (err) {
    console.error("Error fetching compare products:", err);
    tbody.innerHTML = `
              <tr>
                  <td class="text-center p-5 border-0">
                      <i class="bi bi-exclamation-triangle text-danger fs-1 mb-3 d-block"></i>
                      <h5 class="fw-bold text-dark">Error loading comparison data</h5>
                      <p class="text-muted">Please check your connection and try again.</p>
                      <button onclick="location.reload()" class="btn btn-outline-danger rounded-pill px-4 mt-2">Try Again</button>
                  </td>
              </tr>`;
  }
});

function removeFromComparePage(id) {
  let list = JSON.parse(localStorage.getItem("compareList")) || [];
  list = list.filter((item) => item !== id);
  localStorage.setItem("compareList", JSON.stringify(list));
  location.reload();
}
