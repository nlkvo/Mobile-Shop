const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить все перемещения
router.get('/', (req, res) => {
    const query = `
        SELECT
            t.transfer_id,
            t.transfer_date,
            s1.shop_name AS from_shop,
            s2.shop_name AS to_shop,
            CONCAT(man.manufacturer_name, ' ', m.model_name) AS product,
            pc.color,
            t.quantity,
            t.notes
        FROM transfers t
        INNER JOIN shops s1 ON t.from_shop_code = s1.shop_code
        INNER JOIN shops s2 ON t.to_shop_code   = s2.shop_code
        INNER JOIN product_configurations pc ON t.sku_code = pc.sku_code
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        ORDER BY t.transfer_date DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Создать перемещение
router.post('/', (req, res) => {
    const { transfer_id, from_shop_code, to_shop_code, sku_code, quantity, transfer_date, notes } = req.body;

    if (from_shop_code === to_shop_code) {
        return res.status(400).json({ error: 'Магазин отправитель и получатель не могут совпадать' });
    }

    const query = `
        INSERT INTO transfers (transfer_id, from_shop_code, to_shop_code, sku_code, quantity, transfer_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [transfer_id, from_shop_code, to_shop_code, sku_code, quantity, transfer_date, notes || null], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Перемещение зарегистрировано' });
    });
});

module.exports = router;