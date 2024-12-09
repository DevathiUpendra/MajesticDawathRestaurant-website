// server/api/menu.js

const express = require('express');
const { authorizeRole } = require('../middleware/roleMiddleware');
const db = require('../config/db'); // Assume db is configured properly
const router = express.Router();

// Route to add a new menu item (restricted to staff only)
router.post('/add', authorizeRole('staff'), async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO Menu_Items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, category, image_url]
    );
    res.status(201).json({ message: 'Menu item added successfully', menuItemId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Route to view all menu items (accessible to everyone)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Menu_Items');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve menu items' });
  }
});

// Route to update an existing menu item (restricted to staff only)
router.put('/update/:id', authorizeRole('staff'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE Menu_Items SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?',
      [name, description, price, category, image_url, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Route to delete a menu item (restricted to staff only)
router.delete('/delete/:id', authorizeRole('staff'), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM Menu_Items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});



// Route to get menu items by category
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
      const [items] = await db.execute('SELECT * FROM Menu_Items WHERE category = ?', [category]);
      res.json(items);
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      res.status(500).json({ error: 'Failed to fetch items by category' });
    }
  });

  

  // Route to search menu items by keyword
router.get('/search', async (req, res) => {
    const { keyword } = req.query;
    try {
      const [items] = await db.execute(
        'SELECT * FROM Menu_Items WHERE name LIKE ? OR description LIKE ?',
        [`%${keyword}%`, `%${keyword}%`]
      );
      res.json(items);
    } catch (error) {
      console.error('Error searching menu items:', error);
      res.status(500).json({ error: 'Failed to search items' });
    }
  });



module.exports = router;
