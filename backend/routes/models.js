const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить все модели
router.get('/', (req, res) => {
    const query = `
        SELECT 
            m.model_code,
            m.model_name,
            man.manufacturer_name,
            c.country_name
        FROM models m
        INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
        INNER JOIN countries c ON m.country_code = c.country_code
        ORDER BY man.manufacturer_name, m.model_name`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Добавить модель
router.post('/', (req, res) => {
    const { model_code, manufacturer_code, country_code, model_name } = req.body;
    const query = `
        INSERT INTO models (model_code, manufacturer_code, country_code, model_name)
        VALUES (?, ?, ?, ?)`;

    db.query(query, [model_code, manufacturer_code, country_code, model_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Модель добавлена' });
    });
});

module.exports = router;