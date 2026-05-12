const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить все продажи
router.get('/', (req, res) => {
    const query = `
        SELECT 
            s.sale_id,
            DATE_FORMAT(s.sale_datetime, '%d.%m.%Y %H:%i') AS sale_datetime,
            sh.shop_name,
            e.employee_full_name,
            CONCAT(man.manufacturer_name, ' ', m.model_name) AS product,
            pc.color,
            s.quantity_sold,
            s.actual_sale_price,
            (s.actual_sale_price * s.quantity_sold) AS total
        FROM sales s
        INNER JOIN shops sh ON s.shop_code = sh.shop_code
        INNER JOIN employees e ON s.employee_id = e.employee_id
        INNER JOIN product_configurations pc ON s.sku_code = pc.sku_code
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        ORDER BY s.sale_datetime DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Добавить продажу
router.post('/', (req, res) => {
    const { sale_id, shop_code, employee_id, sku_code, actual_sale_price, quantity_sold } = req.body;
    const query = `
        INSERT INTO sales (sale_id, shop_code, employee_id, sku_code, actual_sale_price, quantity_sold)
        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [sale_id, shop_code, employee_id, sku_code, actual_sale_price, quantity_sold], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Продажа зарегистрирована' });
    });
});

module.exports = router;