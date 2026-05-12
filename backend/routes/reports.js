const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Отчёт по продажам за период
router.get('/sales', (req, res) => {
    const { from, to } = req.query;
    const query = `
        SELECT
            m.model_name,
            man.manufacturer_name,
            sh.shop_name,
            SUM(s.quantity_sold) AS quantity,
            SUM(s.actual_sale_price * s.quantity_sold) AS revenue,
            AVG(s.actual_sale_price) AS avg_price
        FROM sales s
        INNER JOIN product_configurations pc ON s.sku_code = pc.sku_code
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        INNER JOIN shops sh ON s.shop_code = sh.shop_code
        WHERE DATE(s.sale_datetime) BETWEEN ? AND ?
        GROUP BY m.model_name, man.manufacturer_name, sh.shop_name
        ORDER BY revenue DESC`;

    db.query(query, [from, to], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Отчёт по остаткам
router.get('/stock', (req, res) => {
    db.query('SELECT * FROM v_stock', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;