const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Получить всех сотрудников
router.get('/', (req, res) => {
    const query = `
        SELECT 
            e.employee_id,
            e.employee_full_name,
            e.employee_position,
            e.hire_date,
            s.shop_name
        FROM employees e
        LEFT JOIN shops s ON e.shop_code = s.shop_code
        ORDER BY e.employee_full_name`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;