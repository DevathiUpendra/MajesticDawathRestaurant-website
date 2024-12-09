document.addEventListener('DOMContentLoaded', () => {
    const orderDetailsContainer = document.getElementById('order-details');
    const apiBaseUrl = 'http://localhost:5000/api';

    // Fetch the latest order details after checkout
    async function fetchOrderDetails() {
        const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
        const role = localStorage.getItem('role');
        const latestOrderId = localStorage.getItem('orderId'); // Retrieved after checkout

        if (!latestOrderId) {
            orderDetailsContainer.innerHTML = '<p>No recent orders found.</p>';
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/order/details/${latestOrderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    role: role,
                    
                }),
            });

            if (response.ok) {
                const { orderDetails } = await response.json();
                displayOrderDetails(orderDetails);
            } else {
                orderDetailsContainer.innerHTML = '<p>Failed to fetch order details.</p>';
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            orderDetailsContainer.innerHTML = '<p>Error fetching order details.</p>';
        }
    }

    function displayOrderDetails(orderDetails) {
        const location = localStorage.getItem('deliveryLocation'); // Get the saved address
        const table = document.createElement('table');
        table.classList.add('order-table');
    
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderDetails
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.item_name}</td>
                        <td>$${item.price}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.item_total}</td>
                    </tr>`
                    )
                    .join('')}
            </tbody>
        `;
    
        const summary = document.createElement('div');
        summary.classList.add('order-summary');
        summary.innerHTML = `
            <p><strong>Order ID:</strong> ${orderDetails[0].order_id}</p>
            <p><strong>Total:</strong> $${orderDetails[0].total}</p>
            <p><strong>Status:</strong> ${orderDetails[0].status}</p>
            <p><strong>Location:</strong> ${location || orderDetails[0].location}</p>
            <p><strong>Placed At:</strong> ${new Date(orderDetails[0].created_at).toLocaleString()}</p>
        `;
    
        orderDetailsContainer.innerHTML = '';
        orderDetailsContainer.appendChild(summary);
        orderDetailsContainer.appendChild(table);
    }
    

    // Fetch order details when the page loads
    fetchOrderDetails();
});
