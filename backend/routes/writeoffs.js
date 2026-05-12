const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить все списания
router.get('/', (req, res) => {
    const query = `
        SELECT 
            w.writeoff_id,
            w.writeoff_date,
            sh.shop_name,
            CONCAT(man.manufacturer_name, ' ', m.model_name) AS product,
            pc.color,
            w.quantity,
            w.writeoff_reason,
            w.notes
        FROM writeoffs w
        INNER JOIN shops sh ON w.shop_code = sh.shop_code
        INNER JOIN product_configurations pc ON w.sku_code = pc.sku_code
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        ORDER BY w.writeoff_date DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Добавить списание
router.post('/', (req, res) => {
    const { writeoff_id, shop_code, sku_code, writeoff_date, quantity, writeoff_reason, notes } = req.body;
    const query = `
        INSERT INTO writeoffs (writeoff_id, shop_code, sku_code, writeoff_date, quantity, writeoff_reason, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [writeoff_id, shop_code, sku_code, writeoff_date, quantity, writeoff_reason, notes], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Списание зарегистрировано' });
    });
});

module.exports = router;