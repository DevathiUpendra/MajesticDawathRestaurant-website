const apiBaseUrl = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const menuList = document.getElementById('menu-list');
    const addItemBtn = document.getElementById('add-item-btn');
    const addItemForm = document.getElementById('add-item-form');
    const newItemForm = document.getElementById('new-item-form');
    const cancelAddItem = document.getElementById('cancel-add-item');
    const logoutButton = document.getElementById('logout-btn');

    // Retrieve user data from localStorage
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    // Load all menu items
    async function loadMenuItems() {
        try {
            const response = await fetch(`${apiBaseUrl}/menu/all`);
            const items = await response.json();
            displayMenuItems(items);
        } catch (error) {
            console.error('Error loading menu items:', error);
        }
    }

    // Display menu items with Edit/Delete buttons
    function displayMenuItems(items) {
        menuList.innerHTML = '';
        items.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('menu-item');
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>Price: $${item.price}</p>
                <p>Category: ${item.category}</p>
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            `;
            menuList.appendChild(itemDiv);
        });

        attachEventListeners();
    }

    // Attach event listeners for Edit and Delete buttons
    function attachEventListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        editButtons.forEach((button) => {
            button.addEventListener('click', () => editMenuItem(button.dataset.id));
        });

        deleteButtons.forEach((button) => {
            button.addEventListener('click', () => deleteMenuItem(button.dataset.id));
        });
    }

    // Add new item functionality
    newItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(newItemForm);

        const newItem = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            image_url: formData.get('image_url'),
            userId,
            role,
        };

        try {
            const response = await fetch(`${apiBaseUrl}/menu/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });

            if (response.ok) {
                alert('Menu item added successfully!');
                loadMenuItems();
                addItemForm.style.display = 'none';
            } else {
                alert('Failed to add menu item.');
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
        }
    });

    // Edit item functionality
    async function editMenuItem(itemId) {
        const newName = prompt('Enter new name:');
        const newDescription = prompt('Enter new description:');
        const newPrice = parseFloat(prompt('Enter new price:'));
        const newCategory = prompt('Enter new category:');
        const newImageUrl = prompt('Enter new image URL:');

        if (newName && newDescription && newPrice && newCategory && newImageUrl) {
            try {
                const response = await fetch(`${apiBaseUrl}/menu/update/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newName,
                        description: newDescription,
                        price: newPrice,
                        category: newCategory,
                        image_url: newImageUrl,
                        userId,
                        role,
                    }),
                });

                if (response.ok) {
                    alert('Menu item updated successfully!');
                    loadMenuItems();
                } else {
                    alert('Failed to update menu item.');
                }
            } catch (error) {
                console.error('Error updating menu item:', error);
            }
        }
    }

    // Delete item functionality
    async function deleteMenuItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(`${apiBaseUrl}/menu/delete/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, role }),
                });

                if (response.ok) {
                    alert('Menu item deleted successfully!');
                    loadMenuItems();
                } else {
                    alert('Failed to delete menu item.');
                }
            } catch (error) {
                console.error('Error deleting menu item:', error);
            }
        }
    }

    // Show Add Item Form
    addItemBtn.addEventListener('click', () => {
        addItemForm.style.display = 'block';
    });

    // Cancel Add Item
    cancelAddItem.addEventListener('click', () => {
        addItemForm.style.display = 'none';
    });

    // Logout functionality
    logoutButton.addEventListener('click', () => {
        localStorage.clear();
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    });

    // Initialize page
    loadMenuItems();
});
