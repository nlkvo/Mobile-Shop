const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить все товары
router.get('/', (req, res) => {
    const query = `
        SELECT 
            pc.sku_code,
            man.manufacturer_name,
            m.model_name,
            pc.color,
            pc.ram_size,
            pc.rom_size,
            pc.retail_price
        FROM product_configurations pc
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        ORDER BY pc.retail_price DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Получить один товар по SKU
router.get('/:sku', (req, res) => {
    const query = `
        SELECT 
            pc.sku_code,
            pc.model_code,
            man.manufacturer_name,
            m.model_name,
            pc.color,
            pc.ram_size,
            pc.rom_size,
            pc.retail_price
        FROM product_configurations pc
        INNER JOIN models m ON pc.model_code = m.model_code
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        WHERE pc.sku_code = ?`;

    db.query(query, [req.params.sku], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Товар не найден' });
        res.json(results[0]);
    });
});

// Добавить товар
router.post('/', (req, res) => {
    const { sku_code, model_code, color, ram_size, rom_size, retail_price } = req.body;
    const query = `
        INSERT INTO product_configurations (sku_code, model_code, color, ram_size, rom_size, retail_price)
        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [sku_code, model_code, color, ram_size, rom_size, retail_price], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Товар добавлен' });
    });
});

// Обновить товар
router.put('/:sku', (req, res) => {
    const { model_code, color, ram_size, rom_size, retail_price } = req.body;
    const query = `
        UPDATE product_configurations 
        SET model_code=?, color=?, ram_size=?, rom_size=?, retail_price=?
        WHERE sku_code=?`;

    db.query(query, [model_code, color, ram_size, rom_size, retail_price, req.params.sku], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Товар обновлён' });
    });
});

// Удалить товар
router.delete('/:sku', (req, res) => {
    const query = `DELETE FROM product_configurations WHERE sku_code = ?`;

    db.query(query, [req.params.sku], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Товар удалён' });
    });
});

module.exports = router;