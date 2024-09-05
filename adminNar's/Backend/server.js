const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: '', 
  database: 'nar\'s' 
});

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = `SELECT * FROM admin WHERE username = ? AND password = ?`;
    db.query(sql, [username, password], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred during signin' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      req.session.user = result[0];
      res.cookie('user', result[0].username, { maxAge: 900000, httpOnly: true });
      
      return res.status(200).json({ success: true, message: 'Signin successful', username: result[0].username });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: 'An error occurred during signin' });
  }
});

app.post('/validate-pin', async (req, res) => {
  const { pin } = req.body;

  try {
    if (pin === '12345') {
      return res.status(200).json({ success: true, message: 'Pin validated successfully' });
    } else {
      return res.status(401).json({ error: 'Invalid pin' });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: 'An error occurred during pin validation' });
  }
});

app.get('/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countSql = "SELECT COUNT(*) as total FROM products";
  const dataSql = "SELECT * FROM products LIMIT ? OFFSET ?";

  db.query(countSql, (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching products count' });
    }

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    db.query(dataSql, [limit, offset], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching products' });
      }
      res.json({
        products: result,
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems
      });
    });
  });
});

app.post('/products', (req, res) => {
  const { name, description, price, image_url, stock_quantity, category, supplier_id, rating } = req.body;
  const order_id = generateOrderId();
  const sql = "INSERT INTO products (name, description, price, image_url, stock_quantity, category, supplier_id, order_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, description, price, image_url, stock_quantity, category, supplier_id, order_id, rating], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error adding product' });
    }
    res.json({ message: 'Product added successfully', id: result.insertId, order_id: order_id });
  });
});

app.put('/products/:id', (req, res) => {
  const { name, description, price, image_url, stock_quantity, category, supplier_id, rating } = req.body;
  const { id } = req.params;
  const sql = "UPDATE products SET name=?, description=?, price=?, image_url=?, stock_quantity=?, category=?, supplier_id=?, rating=? WHERE id=?";
  db.query(sql, [name, description, price, image_url, stock_quantity, category, supplier_id, rating, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating product' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM products WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting product' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

app.get('/sales-report', async (req, res) => {
  try {
    const sql = `SELECT * FROM user_login`;
    db.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while fetching sales report data' });
      }
      return res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: 'An error occurred while fetching sales report data' });
  }
});

// Add this new route to remove an order from the sales report
app.delete('/orders/:id/salesreport', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE orders SET in_sales_report = 0 WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error removing order from sales report' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order removed from sales report successfully' });
  });
});

// Modify the existing GET route for fetching orders to only return those in the sales report
app.get('/orders', (req, res) => {
  const sql = `SELECT * FROM orders WHERE in_sales_report = 1`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching orders' });
    }
    return res.status(200).json(result);
  });
});

// In the existing PUT route for updating order status
app.put('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating order status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully', status: status });
  });
});

// Add a new route for cancelling an order
app.put('/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE orders SET status = 'Cancelled' WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error cancelling order' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order cancelled successfully' });
  });
});

app.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { order_date } = req.body;
  const sql = "UPDATE orders SET order_date = ? WHERE id = ?";
  db.query(sql, [order_date, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating order date' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order date updated successfully' });
  });
});

app.get('/sales-data', (req, res) => {
  const { timeFrame } = req.query;
  let dateCondition, periodDateCondition;

  switch (timeFrame) {
    case 'today':
      dateCondition = 'DATE(order_date) = CURDATE()';
      periodDateCondition = dateCondition;
      break;
    case 'yesterday':
      dateCondition = 'DATE(order_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
      periodDateCondition = dateCondition;
      break;
    case 'lastWeek':
      dateCondition = 'DATE(order_date) = CURDATE()';
      periodDateCondition = 'DATE(order_date) BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 WEEK) AND CURDATE()';
      break;
    case 'lastMonth':
      dateCondition = 'DATE(order_date) = CURDATE()';
      periodDateCondition = 'DATE(order_date) BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE()';
      break;
    default:
      dateCondition = 'DATE(order_date) = CURDATE()';
      periodDateCondition = dateCondition;
  }

  const sql = `
    SELECT 
      (SELECT SUM(total) FROM orders WHERE ${dateCondition}) as salesToday,
      (SELECT SUM(total) FROM orders WHERE ${periodDateCondition}) as periodSales,
      (SELECT COUNT(*) FROM orders WHERE ${periodDateCondition}) as totalOrders,
      (SELECT COUNT(DISTINCT user_id) FROM orders WHERE DATE(order_date) BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 WEEK) AND CURDATE()) as customersThisWeek
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching sales data' });
    }
    res.json(result[0]);
  });
});

// Update the top-products route
app.get('/top-products', (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.image_url,
      SUM(op.quantity) as sold,
      COALESCE(AVG(pr.rating), 0) as rating
    FROM products p
    LEFT JOIN ordered_products op ON p.id = op.product_id
    LEFT JOIN product_ratings pr ON p.id = pr.product_id
    GROUP BY p.id
    ORDER BY sold DESC, rating DESC
    LIMIT 5
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching top products' });
    }
    res.json(result);
  });
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred during logout' });
    }
    res.clearCookie('user');
    return res.status(200).json({ success: true, message: 'Logout successful' });
  });
});

function generateOrderId() {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});