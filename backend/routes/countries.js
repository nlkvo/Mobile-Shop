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
    db.query('SELECT * FROM countries ORDER BY country_name', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post('/', (req, res) => {
    const { country_code, country_name } = req.body;
    db.query('INSERT INTO countries (country_code, country_name) VALUES (?, ?)',
        [country_code, country_name], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Страна добавлена' });
        });
});

module.exports = router;