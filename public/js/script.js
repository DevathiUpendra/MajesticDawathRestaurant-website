const apiBaseUrl = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-items');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search');
    let allMenuItems = []; // This is where the fetched items will be stored

    // Load all menu items initially
    fetchMenuItems();

    // Event listener for category filter
    categoryFilter.addEventListener('change', () => {
        fetchMenuItems(categoryFilter.value, searchInput.value);
    });

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        fetchMenuItems(categoryFilter.value, searchInput.value);
    });

    // Fetch and display menu items based on category and search query
    async function fetchMenuItems(category = 'all', searchQuery = '') {
        let url;

        if (category !== 'all') {
            // Fetch menu items by category
            url = `${apiBaseUrl}/menu/category/${category}`;
        } else if (searchQuery) {
            // Fetch menu items by search query
            url = `${apiBaseUrl}/menu/search?keyword=${encodeURIComponent(searchQuery)}`;
        } else {
            // Fetch all menu items
            url = `${apiBaseUrl}/menu/all`;
        }

        try {
            const response = await fetch(url);
            allMenuItems = await response.json(); // Store fetched items in allMenuItems
            displayMenuItems(allMenuItems); // Pass the fetched items to display
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    }

    // Display menu items in the DOM
    function displayMenuItems(items) {
        menuContainer.innerHTML = '';
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            itemElement.innerHTML = `
                <img src="${item.image_url || 'path/to/default/image.jpg'}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>Price: $${item.price}</p>
                <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
            `;
            menuContainer.appendChild(itemElement);
        });

        // Attach event listeners to the Add to Cart buttons
        const cartButtons = document.querySelectorAll('.add-to-cart-btn');
        cartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.getAttribute('data-id');
                console.log('Button clicked:', itemId); // Debugging the item ID
                addToCart(itemId);
            });
        });
    }

    // Load cart from localStorage when the page loads
    function loadCart() {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        return storedCart;
    }

    // Save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Add item to the cart and save to localStorage
    function addToCart(itemId) {
        console.log('Adding to cart, Item ID:', itemId); // Debugging the addToCart function
        console.log(allMenuItems); 
        const selectedItem = allMenuItems.find(item => item.id == itemId); // Use allMenuItems here
        if (selectedItem) {
            const cart = loadCart();
            cart.push(selectedItem);
            saveCart(cart);
            alert(`${selectedItem.name} has been added to the cart!`);
            updateCartUI(); // Update cart display if needed
        } else {
            console.error('Item not found in allMenuItems'); // Debugging case where item is not found
        }
    }

    // Optional: Update cart UI or show cart count
    function updateCartUI() {
        const cart = loadCart();
        const cartCount = cart.length;
        const cartElement = document.getElementById('cart-count');
        if (cartElement) {
            cartElement.textContent = cartCount;
        }
    }

    // Call updateCartUI on page load to display current cart count
    updateCartUI();
});
