document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/payment/finalize-order`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (res.ok) {
            console.log("Order finalized and cart cleared.");
        }
    } catch (err) {
        console.error("Error finalizing order:", err);
    }
});