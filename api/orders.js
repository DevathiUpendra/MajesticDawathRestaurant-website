// server/api/orders.js

const express = require('express');
const { authorizeRole } = require('../middleware/roleMiddleware');
const db = require('../config/db'); // Make sure db is set up correctly
const router = express.Router();

// Route to create a new order (for customers)
router.post('/create', authorizeRole('customer'), async (req, res) => {
  const { userId, items, location } = req.body; // 'location' is now part of the request

  try {
    // Calculate total price
    let total = 0;
    for (const item of items) {
      const [rows] = await db.execute('SELECT price FROM Menu_Items WHERE id = ?', [item.menuItemId]);
      if (rows.length === 0) {
        return res.status(400).json({ error: `Menu item with ID ${item.menuItemId} not found` });
      }
      total += rows[0].price * item.quantity;
    }

    // Insert new order with location and created_at
    const [orderResult] = await db.execute(
      'INSERT INTO Orders (user_id, total, status, location) VALUES (?, ?, ?, ?)',
      [userId, total, 'pending', location]
    );

    const orderId = orderResult.insertId;

    // Insert each item in Order_Items
    for (const item of items) {
      await db.execute(
        'INSERT INTO Order_Items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.menuItemId, item.quantity]
      );
    }

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    console.error("Error creating order:", error); // Log error for debugging
    res.status(500).json({ error: 'Failed to create order' });
  }
});


// Route to view orders for a customer
router.get('/my-orders', authorizeRole('customer'), async (req, res) => {
  const { userId } = req.body;
  try {
    const [orders] = await db.execute('SELECT * FROM Orders WHERE user_id = ?', [userId]);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});


// Route to update order status (restricted to staff only)
router.put('/update-status/:id', authorizeRole('staff'), async (req, res) => {
    const { id } = req.params; // Order ID from the URL
    const { status } = req.body; // New status from the request body
  
    // Check if status is valid
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }
  
    try {
      // Update the status of the order
      const [result] = await db.execute(
        'UPDATE Orders SET status = ? WHERE id = ?',
        [status, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error("Error updating order status:", error); // Log error for debugging
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });


// Route to view order details (for customers)
router.post('/details/:orderId', authorizeRole('customer'), async (req, res) => {
  const { orderId } = req.params;

  try {
    // Updated query to retrieve order and item details with location and created_at
    const [orderDetails] = await db.execute(`
      SELECT O.id AS order_id, O.total, O.status, O.location, O.created_at,
             M.name AS item_name, M.price, OI.quantity,
             (M.price * OI.quantity) AS item_total
      FROM Orders O
      JOIN Order_Items OI ON O.id = OI.order_id
      JOIN Menu_Items M ON OI.menu_item_id = M.id
      WHERE O.id = ?
    `, [orderId]);

    if (orderDetails.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ orderDetails });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});



  // Route to view order history with filtering options (for customers)
router.get('/history', authorizeRole('customer'), async (req, res) => {
  const { userId, status, startDate, endDate } = req.query;

  try {
    // Base query to get orders for a specific user
    let query = 'SELECT * FROM Orders WHERE user_id = ?';
    const params = [userId];

    // Add optional filters for status and date range
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (startDate && endDate) {
      query += ' AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [orders] = await db.execute(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});


module.exports = router;
