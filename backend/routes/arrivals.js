const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить все поступления
router.get('/', (req, res) => {
    const query = `
        SELECT 
            a.arrival_id,
            a.arrival_date,
            sh.shop_name,
            CONCAT(man.manufacturer_name, ' ', m.model_name) AS product,
            pc.color,
            a.quantity,
            a.purchase_price
        FROM arrivals a
        INNER JOIN shops sh ON a.shop_code = sh.shop_code
        INNER JOIN product_configurations pc ON a.sku_code = pc.sku_code
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        ORDER BY a.arrival_date DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Добавить поступление
router.post('/', (req, res) => {
    const { arrival_id, shop_code, sku_code, arrival_date, purchase_price, quantity } = req.body;
    const query = `
        INSERT INTO arrivals (arrival_id, shop_code, sku_code, arrival_date, purchase_price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [arrival_id, shop_code, sku_code, arrival_date, purchase_price, quantity], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Поступление зарегистрировано' });
    });
});

module.exports = router;