const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.post('/api/register', async (req, res) => {
    const { name, email, address, password } = req.body;

    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: "Name must be between 20 and 60 characters" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be 8-16 characters with 1 uppercase and 1 special character" });
    }
    if (address.length > 400) {
        return res.status(400).json({ message: "Address cannot exceed 400 characters" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, address, password, role) VALUES (?,?,?,?,?)',
            [name, email, address, hashedPassword, 'Normal User']
        );
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(500).json({ message: "Email already exists" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            id: user.id,
            role: user.role,
            storeId: user.store_id 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, store_id FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/:id/assign-store', async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.body;
    try {
        await db.query('UPDATE users SET store_id = ? WHERE id = ?', [storeId, id]);
        res.json({ message: "Store assigned successfully" });
    } catch (err) {
        res.status(500).json({ error: "Database error: " + err.message });
    }
});

app.patch('/api/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: "User role updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stores', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM stores');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stores/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM stores WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stores', async (req, res) => {
    const { name, address } = req.body;
    try {
        await db.query('INSERT INTO stores (name, address) VALUES (?, ?)', [name, address]);
        res.status(201).json({ message: "Store added!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/stores/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM stores WHERE id = ?', [req.params.id]);
        res.json({ message: "Store deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ratings', async (req, res) => {
    const { user_id, store_id, rating } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [user_id, store_id]);

        if (existing.length > 0) {
            await db.query('UPDATE ratings SET rating = ? WHERE id = ?', [rating, existing[0].id]);
        } else {
            await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user_id, store_id, rating]);
        }

        const [avgResult] = await db.query('SELECT ROUND(AVG(rating), 1) as average FROM ratings WHERE store_id = ?', [store_id]);
        await db.query('UPDATE stores SET overall_rating = ? WHERE id = ?', [avgResult[0].average, store_id]);

        res.json({ message: "Rating updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Rating update failed" });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[userCount]] = await db.query('SELECT COUNT(*) as total FROM users');
        const [[storeCount]] = await db.query('SELECT COUNT(*) as total FROM stores');
        const [[ratingCount]] = await db.query('SELECT COUNT(*) as total FROM ratings');
        res.json({
            users: userCount.total,
            stores: storeCount.total,
            ratings: ratingCount.total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/users', async (req, res) => {
    const { name, email, address, password, role } = req.body;
    
    if (address.length > 400) {
        return res.status(400).json({ message: "Address cannot exceed 400 characters" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, address, hashedPassword, role]
        );
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: "User creation failed" });
    }
});

app.get('/api/owner/store-data/:storeId', async (req, res) => {
    const { storeId } = req.params;
    try {
        const [reviewers] = await db.query(`
            SELECT u.name, u.email, r.rating, r.id as rating_id
            FROM users u
            JOIN ratings r ON u.id = r.user_id
            WHERE r.store_id = ?
        `, [storeId]);

        const [[avgResult]] = await db.query(
            'SELECT overall_rating FROM stores WHERE id = ?', 
            [storeId]
        );

        res.json({
            reviewers,
            averageRating: avgResult ? avgResult.overall_rating : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/update-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
            message: "Password must be 8-16 characters with 1 uppercase and 1 special character" 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update password" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});