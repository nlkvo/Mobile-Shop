const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use('/api/products', require('./routes/products'));
app.use('/api/models', require('./routes/models'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/arrivals', require('./routes/arrivals'));
app.use('/api/writeoffs', require('./routes/writeoffs'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/manufacturers', require('./routes/manufacturers'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/transfers', require('./routes/transfers'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});