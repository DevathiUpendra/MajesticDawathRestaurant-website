document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const apiBaseUrl = 'http://localhost:5000/api';

    // Load cart items from localStorage
    const cart = loadCart();

    // Display cart items in the DOM as a table
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        checkoutButton.disabled = true;
    } else {
        // Create the table structure for cart items
        checkoutButton.disabled = false;
        const table = document.createElement('table');
        table.classList.add('cart-table');

        // Create the table header
        const header = document.createElement('thead');
        header.innerHTML = `
            <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Action</th>
            </tr>
        `;
        table.appendChild(header);

        // Create the table body for cart items
        const tbody = document.createElement('tbody');
        cart.forEach((item) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id; // Add data-id to identify the item
            row.innerHTML = `
                <td><img src="${item.image_url}" alt="${item.name}" width="50" height="50"></td>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>1</td> <!-- Assuming quantity is 1 for each item -->
                <td><button class="remove-item-btn">Remove</button></td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        cartItemsContainer.appendChild(table);

        // Calculate and update total price
        updateCartTotal(cart);
    }

    // Event delegation for removing items
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('remove-item-btn')) {
            const itemId = event.target.closest('tr').dataset.id;
            removeItemFromCart(itemId);
        }
    });

    // Load cart from localStorage
    function loadCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Remove item from cart
    function removeItemFromCart(itemId) {
        let cart = loadCart();
        cart = cart.filter((item) => item.id != itemId); // Remove item by ID
        saveCart(cart);
        location.reload(); // Reload the page to reflect changes
    }

    // Update total price in the cart summary
    function updateCartTotal(cart) {
        const totalPrice = cart.reduce((total, item) => {
            const price = parseFloat(item.price);
            if (!isNaN(price)) {
                return total + price;
            } else {
                return total;
            }
        }, 0);

        cartTotal.textContent = totalPrice.toFixed(2); // Safely format the total price
    }

    checkoutButton.addEventListener('click', async () => {
        const userId = localStorage.getItem('userId'); // Replace with logged-in user ID
        const role = localStorage.getItem('role');
        const location = document.getElementById('delivery-address').value.trim(); // Get the value from textarea
    
        if (!location) {
            alert('Please provide a delivery address.'); // Keep this check for empty input
            return;
        }
    
        try {
            const response = await fetch(`${apiBaseUrl}/order/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    role,
                    location,
                    items: cart.map((item) => ({
                        menuItemId: item.id,
                        quantity: 1,
                    })),
                }),
            });
    
            if (response.ok) {
                const { orderId } = await response.json();
                localStorage.setItem('orderId', orderId);
                localStorage.setItem('deliveryLocation', location); // Store the address
                localStorage.removeItem('cart');
                window.location.href = 'orders.html';
            } else {
                alert('Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred. Please try again.');
        }
    });
    
});
