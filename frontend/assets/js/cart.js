document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const tbody = document.getElementById("cart-items-list");
  const totalSpan = document.getElementById("cart-total");
  const finalTotalSpan = document.getElementById("cart-total-final");

  let total = 0;

  try {
    const res = await fetch(`${API_BASE_URL}/cart/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const items = await res.json();

    if (res.ok && items.length > 0) {
      items.forEach((item) => {
        total += parseFloat(item.price) * item.quantity;

        tbody.innerHTML += `
                        <tr>
                            <td><strong>${item.title}</strong></td>
                            <td>$${item.price}</td>
                            <td>${item.quantity}</td>
                            <td>
                                <button class="btn btn-danger btn-sm"
                                    onclick="removeFromCart(${item.cart_id},${item.price})">
                                    Remove
                                </button>
                            </td>
                        </tr>
                    `;
      });

      totalSpan.innerText = total.toFixed(2);
      finalTotalSpan.innerText = total.toFixed(2);
    } else {
      tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            Your cart is empty!
                        </td>
                    </tr>
                `;
    }
  } catch (err) {
    console.error(err);
  }
});

async function removeFromCart(cartId) {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showDenyButton: true,
    confirmButtonText: "Yes, delete it",
    denyButtonText: "No",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.location.reload();
    }
  });
}

const checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    checkoutBtn.innerText = "Processing...";
    checkoutBtn.disabled = true;

    try {
      const res = await fetch(
        `${API_BASE_URL}/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        Swal.fire({
          icon: "error",
          text: `${data.error || "An error occurred while preparing payment."}`,
        });
        checkoutBtn.innerHTML =
          "Proceed to Checkout <i class='bi bi-arrow-right'></i>";
        checkoutBtn.disabled = false;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to connect to the server.");
      checkoutBtn.innerHTML =
        "Proceed to Checkout <i class='bi bi-arrow-right'></i>";
      checkoutBtn.disabled = false;
    }
  });
}
