const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM manufacturers ORDER BY manufacturer_name', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post('/', (req, res) => {
    const { manufacturer_code, manufacturer_name } = req.body;
    db.query('INSERT INTO manufacturers (manufacturer_code, manufacturer_name) VALUES (?, ?)',
        [manufacturer_code, manufacturer_name], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Производитель добавлен' });
        });
});

module.exports = router;