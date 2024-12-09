// public/js/auth.js

const apiBaseUrl = 'http://localhost:5000/api/auth'; // Base URL for authentication API

// Register a new user
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form reload

    // Collect input values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role')?.value || 'customer'; // Default role

    const userData = { username, password, role };

    try {
        const response = await fetch(`${apiBaseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('register-message').textContent = 'Registration successful. Please login.';
            window.location.href = 'login.html';
        } else {
            document.getElementById('register-message').textContent = result.error || 'Registration failed.';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        document.getElementById('register-message').textContent = 'An error occurred. Please try again.';
    }
});

// Login a user
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form reload

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = { username, password };

    try {
        const response = await fetch(`${apiBaseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('role', result.role);

            // Redirect based on role
            if (result.role === 'customer') {
                window.location.href = 'dashboard.html';
            } else if (result.role === 'staff') {
                window.location.href = 'admin.html';
            }
        } else {
            document.getElementById('login-message').textContent = result.error || 'Invalid credentials.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('login-message').textContent = 'An error occurred. Please try again.';
    }
});
