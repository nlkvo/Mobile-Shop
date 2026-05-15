-- БАЗА ДАННЫХ: mobile_phones_db
-- Система учета мобильных телефонов в сети магазинов

-- ЧАСТЬ 1: СОЗДАНИЕ БАЗЫ ДАННЫХ И ТАБЛИЦ

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP DATABASE IF EXISTS mobile_phones_db;
CREATE DATABASE mobile_phones_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mobile_phones_db;

-- СПРАВОЧНЫЕ ТАБЛИЦЫ

CREATE TABLE countries (
    country_code CHAR(4) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    country_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE
) ENGINE=InnoDB COMMENT='Справочник стран';

CREATE TABLE manufacturers (
    manufacturer_code CHAR(4) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    manufacturer_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE
) ENGINE=InnoDB COMMENT='Справочник производителей';

CREATE TABLE shops (
    shop_code CHAR(8) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    shop_name VARCHAR(200) COLLATE utf8mb4_unicode_ci NOT NULL,
    shop_address VARCHAR(300) COLLATE utf8mb4_unicode_ci NOT NULL,
    shop_phone VARCHAR(20) COLLATE utf8mb4_unicode_ci NOT NULL,
    shop_email VARCHAR(100) COLLATE utf8mb4_unicode_ci,
    CONSTRAINT unique_shop_name UNIQUE (shop_name),
    CONSTRAINT unique_shop_email UNIQUE (shop_email),
    CONSTRAINT check_shop_phone CHECK (shop_phone REGEXP '^\\([0-9]{3}\\)[0-9]{3}-[0-9]{4}$')
) ENGINE=InnoDB COMMENT='Справочник магазинов';

CREATE TABLE employees (
    employee_id CHAR(6) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    employee_full_name VARCHAR(200) COLLATE utf8mb4_unicode_ci NOT NULL,
    employee_position VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Продавец-консультант',
    hire_date DATE DEFAULT (CURRENT_DATE),
    shop_code CHAR(8) COLLATE utf8mb4_unicode_ci,
    CONSTRAINT fk_employees_shop FOREIGN KEY (shop_code)
        REFERENCES shops(shop_code) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Справочник сотрудников';

CREATE TABLE models (
    model_code CHAR(7) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    manufacturer_code CHAR(4) COLLATE utf8mb4_unicode_ci NOT NULL,
    country_code CHAR(4) COLLATE utf8mb4_unicode_ci NOT NULL,
    model_name VARCHAR(200) COLLATE utf8mb4_unicode_ci NOT NULL,
    CONSTRAINT fk_models_manufacturer FOREIGN KEY (manufacturer_code)
        REFERENCES manufacturers(manufacturer_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_models_country FOREIGN KEY (country_code)
        REFERENCES countries(country_code) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Справочник моделей';

CREATE TABLE product_configurations (
    sku_code CHAR(10) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    model_code CHAR(7) COLLATE utf8mb4_unicode_ci NOT NULL,
    color VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Белый',
    ram_size VARCHAR(20) COLLATE utf8mb4_unicode_ci NOT NULL,
    rom_size VARCHAR(20) COLLATE utf8mb4_unicode_ci NOT NULL,
    retail_price DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_configurations_model FOREIGN KEY (model_code)
        REFERENCES models(model_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_retail_price CHECK (retail_price > 0)
) ENGINE=InnoDB COMMENT='Конфигурации товаров (SKU)';

-- ТРАНЗАКЦИОННЫЕ ТАБЛИЦЫ

CREATE TABLE arrivals (
    arrival_id CHAR(10) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    shop_code CHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
    sku_code CHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    arrival_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    purchase_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_arrivals_shop FOREIGN KEY (shop_code)
        REFERENCES shops(shop_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_arrivals_sku FOREIGN KEY (sku_code)
        REFERENCES product_configurations(sku_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_purchase_price CHECK (purchase_price > 0),
    CONSTRAINT check_arrival_quantity CHECK (quantity > 0)
) ENGINE=InnoDB COMMENT='Журнал поступлений';

CREATE TABLE serial_numbers (
    serial_number VARCHAR(50) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    arrival_id CHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    CONSTRAINT fk_serials_arrival FOREIGN KEY (arrival_id)
        REFERENCES arrivals(arrival_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Серийные номера';

CREATE TABLE sales (
    sale_id CHAR(10) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    shop_code CHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
    employee_id CHAR(6) COLLATE utf8mb4_unicode_ci NOT NULL,
    sku_code CHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    sale_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actual_sale_price DECIMAL(12, 2) NOT NULL,
    quantity_sold INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_sales_shop FOREIGN KEY (shop_code)
        REFERENCES shops(shop_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_employee FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_sku FOREIGN KEY (sku_code)
        REFERENCES product_configurations(sku_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_actual_sale_price CHECK (actual_sale_price >= 0),
    CONSTRAINT check_quantity_sold CHECK (quantity_sold >= 1)
) ENGINE=InnoDB COMMENT='Журнал продаж';

CREATE TABLE writeoffs (
    writeoff_id CHAR(10) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    shop_code CHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
    sku_code CHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    writeoff_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    quantity INT NOT NULL,
    writeoff_reason VARCHAR(300) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Брак',
    notes TEXT COLLATE utf8mb4_unicode_ci,
    CONSTRAINT fk_writeoffs_shop FOREIGN KEY (shop_code)
        REFERENCES shops(shop_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_writeoffs_sku FOREIGN KEY (sku_code)
        REFERENCES product_configurations(sku_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_writeoff_quantity CHECK (quantity > 0)
) ENGINE=InnoDB COMMENT='Журнал списаний';

-- ИНДЕКСЫ

CREATE INDEX idx_sales_datetime ON sales(sale_datetime);
CREATE INDEX idx_sales_shop ON sales(shop_code);
CREATE INDEX idx_arrivals_date ON arrivals(arrival_date);
CREATE INDEX idx_models_manufacturer ON models(manufacturer_code);
CREATE INDEX idx_configurations_model ON product_configurations(model_code);
CREATE INDEX idx_employees_shop ON employees(shop_code);

-- ЗАПОЛНЕНИЕ ДАННЫМИ

INSERT INTO countries (country_code, country_name) VALUES
('C001', 'Китай'),
('C002', 'США'),
('C003', 'Южная Корея'),
('C004', 'Вьетнам'),
('C005', 'Индия');

INSERT INTO manufacturers (manufacturer_code, manufacturer_name) VALUES
('P001', 'Apple'),
('P002', 'Samsung'),
('P003', 'Xiaomi'),
('P004', 'Huawei'),
('P005', 'OPPO');

INSERT INTO shops (shop_code, shop_name, shop_address, shop_phone, shop_email) VALUES
('10000001', 'Электроника Центр', 'г. Москва, ул. Тверская, д. 10', '(495)123-4567', 'center@electronics.ru'),
('10000002', 'Техно Маркет Запад', 'г. Москва, Кутузовский пр-т, д. 25', '(495)234-5678', 'west@electronics.ru'),
('10000003', 'Гаджет Плаза', 'г. Санкт-Петербург, Невский пр-т, д. 50','(812)345-6789', 'spb@electronics.ru');

INSERT INTO employees (employee_id, employee_full_name, employee_position, hire_date, shop_code) VALUES
('S00001', 'Иванов Иван Иванович','Продавец-консультант', '2023-01-15', '10000001'),
('S00002', 'Петрова Мария Сергеевна', 'Старший продавец', '2022-06-20', '10000001'),
('S00003', 'Сидоров Алексей Петрович', 'Менеджер магазина', '2021-03-10', '10000001'),
('S00004', 'Козлова Елена Дмитриевна', 'Продавец-консультант', '2023-08-01', '10000002'),
('S00005', 'Смирнов Дмитрий Андреевич', 'Продавец-консультант', '2024-02-14', '10000003');

INSERT INTO models (model_code, manufacturer_code, country_code, model_name) VALUES
('M000001', 'P001', 'C001', 'iPhone 15 Pro Max'),
('M000002', 'P001', 'C001', 'iPhone 15 Pro'),
('M000003', 'P002', 'C004', 'Galaxy S24 Ultra'),
('M000004', 'P002', 'C004', 'Galaxy A54 5G'),
('M000005', 'P003', 'C001', 'Xiaomi 14 Pro'),
('M000006', 'P003', 'C001', 'Redmi Note 13 Pro');

INSERT INTO product_configurations (sku_code, model_code, color, ram_size, rom_size, retail_price) VALUES
('L000000001', 'M000001', 'Черный', '8 ГБ',  '256 ГБ', 129990.00),
('L000000002', 'M000001', 'Синий', '8 ГБ',  '512 ГБ', 149990.00),
('L000000003', 'M000002', 'Белый', '8 ГБ',  '128 ГБ',  99990.00),
('L000000004', 'M000003', 'Черный', '12 ГБ', '512 ГБ', 119990.00),
('L000000005', 'M000003', 'Фиолетовый','12 ГБ', '1 ТБ',   139990.00),
('L000000006', 'M000004', 'Зеленый', '8 ГБ',  '256 ГБ',  39990.00),
('L000000007', 'M000005', 'Черный', '12 ГБ', '256 ГБ',  79990.00),
('L000000008', 'M000006', 'Синий', '8 ГБ',  '256 ГБ',  29990.00);

INSERT INTO arrivals (arrival_id, shop_code, sku_code, arrival_date, purchase_price, quantity) VALUES
('PR00000001', '10000001', 'L000000001', '2025-11-01', 95000.00, 10),
('PR00000002', '10000001', 'L000000003', '2025-11-05', 75000.00, 15),
('PR00000003', '10000002', 'L000000004', '2025-11-10', 90000.00,  8),
('PR00000004', '10000002', 'L000000006', '2025-11-12', 28000.00, 20),
('PR00000005', '10000003', 'L000000007', '2025-11-15', 60000.00, 12),
('PR00000006', '10000003', 'L000000008', '2025-11-20', 22000.00, 25);

INSERT INTO serial_numbers (serial_number, arrival_id) VALUES
('356789012345671', 'PR00000001'),
('356789012345672', 'PR00000001'),
('356789012345673', 'PR00000001'),
('356789012345681', 'PR00000002'),
('356789012345682', 'PR00000002'),
('356789012345691', 'PR00000003'),
('356789012345692', 'PR00000003');

INSERT INTO sales (sale_id, shop_code, employee_id, sku_code, sale_datetime, actual_sale_price, quantity_sold) VALUES
('TR00000001', '10000001', 'S00001', 'L000000001', '2025-11-25 14:30:00', 129990.00, 1),
('TR00000002', '10000001', 'S00002', 'L000000003', '2025-11-26 10:15:00',  95000.00, 1),
('TR00000003', '10000002', 'S00004', 'L000000004', '2025-11-27 16:45:00', 119990.00, 1),
('TR00000004', '10000002', 'S00004', 'L000000006', '2025-11-28 11:20:00',  39990.00, 2),
('TR00000005', '10000003', 'S00005', 'L000000007', '2025-11-29 13:00:00',  79990.00, 1),
('TR00000006', '10000001', 'S00001', 'L000000008', '2025-12-01 15:30:00',  27990.00, 1);

INSERT INTO writeoffs (writeoff_id, shop_code, sku_code, writeoff_date, quantity, writeoff_reason, notes) VALUES
('WR00000001', '10000001', 'L000000001', '2025-11-30', 1, 'Брак производителя',        'Отправлено на гарантийный ремонт'),
('WR00000002', '10000002', 'L000000006', '2025-12-02', 1, 'Потеря при инвентаризации', NULL);

-- UPDATE: обновление данных

UPDATE product_configurations SET retail_price = 119990.00 WHERE sku_code = 'L000000001';
UPDATE employees SET employee_position = 'Старший продавец' WHERE employee_id = 'S00001';
UPDATE shops SET shop_email = 'moscow.center@electronics.ru' WHERE shop_code = '10000001';

-- Массовое обновление: скидка 5% на Samsung
UPDATE product_configurations
SET retail_price = retail_price * 0.95
WHERE model_code IN (SELECT model_code FROM models WHERE manufacturer_code = 'P002');

-- DELETE: удаление данных

SET SQL_SAFE_UPDATES = 0;

DELETE FROM serial_numbers WHERE serial_number = '356789012345673';

-- Удаление с подзапросом: поступления до 2024 года без серийников
DELETE FROM arrivals
WHERE arrival_date < '2024-01-01'
  AND arrival_id NOT IN (SELECT arrival_id FROM serial_numbers);

SET SQL_SAFE_UPDATES = 1;

-- ПОЛЬЗОВАТЕЛИ И ПРАВА ДОСТУПА

CREATE USER IF NOT EXISTS 'manager_user'@'localhost' IDENTIFIED BY 'Manager2024!';
CREATE USER IF NOT EXISTS 'seller_user'@'localhost' IDENTIFIED BY 'Seller2024!';
CREATE USER IF NOT EXISTS 'director_user'@'localhost' IDENTIFIED BY 'Director2024!';
CREATE USER IF NOT EXISTS 'analyst_user'@'localhost' IDENTIFIED BY 'Analyst2024!';

-- Менеджер: полный доступ к справочникам и операциям
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.shops TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.manufacturers TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.countries TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.employees TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.models TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.product_configurations TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.arrivals TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.writeoffs TO 'manager_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_phones_db.serial_numbers TO 'manager_user'@'localhost';
GRANT SELECT, INSERT ON mobile_phones_db.sales TO 'manager_user'@'localhost';

-- Продавец: только чтение справочников + создание продаж
GRANT SELECT ON mobile_phones_db.shops TO 'seller_user'@'localhost';
GRANT SELECT ON mobile_phones_db.product_configurations TO 'seller_user'@'localhost';
GRANT SELECT ON mobile_phones_db.models TO 'seller_user'@'localhost';
GRANT SELECT ON mobile_phones_db.manufacturers TO 'seller_user'@'localhost';
GRANT SELECT ON mobile_phones_db.employees TO 'seller_user'@'localhost';
GRANT SELECT, INSERT ON mobile_phones_db.sales TO 'seller_user'@'localhost';

-- Директор: только чтение всего
GRANT SELECT ON mobile_phones_db.* TO 'director_user'@'localhost';

-- Аналитик: только чтение аналитических таблиц
GRANT SELECT ON mobile_phones_db.sales TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.arrivals TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.writeoffs TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.product_configurations TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.models TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.manufacturers TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.shops TO 'analyst_user'@'localhost';

FLUSH PRIVILEGES;

-- ЧАСТЬ 2: ЗАПРОСЫ НА ВЫБОРКУ (SELECT)

-- INNER JOIN: полный каталог товаров
SELECT
    pc.sku_code AS 'Код',
    man.manufacturer_name AS 'Производитель',
    m.model_name AS 'Модель',
    pc.color AS 'Цвет',
    CONCAT(pc.ram_size, '/', pc.rom_size) AS 'Память',
    pc.retail_price AS 'Цена'
FROM product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
ORDER BY man.manufacturer_name, pc.retail_price DESC;

-- LEFT JOIN с агрегацией: товары и количество продаж
SELECT
    m.model_name AS 'Модель',
    pc.color AS 'Цвет',
    pc.retail_price AS 'Цена',
    COALESCE(SUM(s.quantity_sold), 0) AS 'Продано'
FROM product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
LEFT JOIN sales s ON pc.sku_code   = s.sku_code
GROUP BY m.model_name, pc.color, pc.retail_price
ORDER BY `Продано` DESC;

-- Агрегатные функции: продажи по производителям
SELECT
    man.manufacturer_name AS 'Производитель',
    COUNT(s.sale_id) AS 'Продаж',
    SUM(s.quantity_sold) AS 'Единиц',
    ROUND(AVG(s.actual_sale_price), 2) AS 'Средняя цена',
    MIN(s.actual_sale_price) AS 'Мин',
    MAX(s.actual_sale_price) AS 'Макс',
    SUM(s.actual_sale_price * s.quantity_sold) AS 'Выручка'
FROM sales s
INNER JOIN product_configurations pc ON s.sku_code = pc.sku_code
INNER JOIN models m ON pc.model_code = m.model_code
INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
GROUP BY man.manufacturer_name
ORDER BY `Выручка` DESC;

-- GROUP BY с HAVING: продавцы с выручкой > 100 000
SELECT
    sh.shop_name AS 'Магазин',
    e.employee_full_name AS 'Продавец',
    COUNT(s.sale_id) AS 'Продаж',
    SUM(s.actual_sale_price * s.quantity_sold) AS 'Выручка'
FROM sales s
INNER JOIN shops sh ON s.shop_code = sh.shop_code
INNER JOIN employees e ON s.employee_id = e.employee_id
GROUP BY sh.shop_name, e.employee_full_name
HAVING SUM(s.actual_sale_price * s.quantity_sold) > 100000
ORDER BY `Выручка` DESC;

-- Подзапрос в WHERE: товары дороже средней цены
SELECT
    m.model_name AS 'Модель',
    pc.color AS 'Цвет',
    pc.retail_price AS 'Цена'
FROM product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
WHERE pc.retail_price > (SELECT AVG(retail_price) FROM product_configurations)
ORDER BY pc.retail_price DESC;

-- Подзапрос с IN: модели, у которых были продажи
SELECT
    m.model_name AS 'Модель',
    man.manufacturer_name AS 'Производитель'
FROM models m
INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
WHERE m.model_code IN (
    SELECT DISTINCT pc.model_code
    FROM sales s
    INNER JOIN product_configurations pc ON s.sku_code = pc.sku_code
)
ORDER BY man.manufacturer_name;

-- Подзапрос с EXISTS: магазины, в которых были продажи
SELECT shop_name AS 'Магазин', shop_address AS 'Адрес'
FROM shops sh
WHERE EXISTS (SELECT 1 FROM sales s WHERE s.shop_code = sh.shop_code)
ORDER BY shop_name;

-- Коррелированный подзапрос: товары дороже средней по своему производителю
SELECT
    man.manufacturer_name AS 'Производитель',
    m.model_name AS 'Модель',
    pc.retail_price AS 'Цена',
    (SELECT ROUND(AVG(pc2.retail_price), 2)
     FROM product_configurations pc2
     INNER JOIN models m2 ON pc2.model_code = m2.model_code
     WHERE m2.manufacturer_code = m.manufacturer_code) AS 'Средняя по производителю'
FROM product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
WHERE pc.retail_price > (
    SELECT AVG(pc3.retail_price)
    FROM product_configurations pc3
    INNER JOIN models m3 ON pc3.model_code = m3.model_code
    WHERE m3.manufacturer_code = m.manufacturer_code
)
ORDER BY man.manufacturer_name;

-- IF: категория товара
SELECT
    m.model_name AS 'Модель',
    pc.retail_price AS 'Цена',
    IF(pc.retail_price > 100000, 'Премиум', 'Стандарт') AS 'Категория'
FROM product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
ORDER BY pc.retail_price DESC;

-- CASE: расширенная категоризация и объем памяти
SELECT
    m.model_name AS 'Модель',
    pc.retail_price AS 'Цена',
    CASE
        WHEN pc.retail_price >= 120000 THEN 'Флагман'
        WHEN pc.retail_price >= 80000 THEN 'Премиум'
        WHEN pc.retail_price >= 40000 THEN 'Средний класс'
        ELSE 'Бюджетный'
    END AS 'Категория',
    CASE
        WHEN pc.rom_size LIKE '%1 ТБ%' THEN 'Максимум'
        WHEN pc.rom_size LIKE '%512%' THEN 'Много'
        WHEN pc.rom_size LIKE '%256%' THEN 'Достаточно'
        ELSE 'Стандарт'
    END AS 'Память'
FROM product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
ORDER BY pc.retail_price DESC;

-- CASE в GROUP BY: бонусы продавцов
SELECT
    e.employee_full_name AS 'Продавец',
    COUNT(s.sale_id) AS 'Продаж',
    SUM(s.actual_sale_price * s.quantity_sold) AS 'Выручка',
    CASE
        WHEN SUM(s.actual_sale_price * s.quantity_sold) >= 300000 THEN 5.0
        WHEN SUM(s.actual_sale_price * s.quantity_sold) >= 200000 THEN 3.0
        WHEN SUM(s.actual_sale_price * s.quantity_sold) >= 100000 THEN 2.0
        ELSE 1.0
    END AS 'Процент комиссии',
    ROUND(SUM(s.actual_sale_price * s.quantity_sold) *
        CASE
            WHEN SUM(s.actual_sale_price * s.quantity_sold) >= 300000 THEN 0.05
            WHEN SUM(s.actual_sale_price * s.quantity_sold) >= 200000 THEN 0.03
            WHEN SUM(s.actual_sale_price * s.quantity_sold) >= 100000 THEN 0.02
            ELSE 0.01
        END, 2) AS 'Бонус (руб.)'
FROM employees e
LEFT JOIN sales s ON e.employee_id = s.employee_id
GROUP BY e.employee_full_name
HAVING SUM(s.actual_sale_price * s.quantity_sold) IS NOT NULL
ORDER BY `Выручка` DESC;

-- VIEW: аналитика продаж

CREATE OR REPLACE VIEW v_sales_analytics AS
SELECT
    s.sale_id  AS 'ID',
    DATE_FORMAT(s.sale_datetime, '%d.%m.%Y') AS 'Дата',
    sh.shop_name AS 'Магазин',
    e.employee_full_name AS 'Продавец',
    CONCAT(man.manufacturer_name, ' ', m.model_name) AS 'Товар',
    pc.color AS 'Цвет',
    s.quantity_sold AS 'Кол-во',
    s.actual_sale_price AS 'Цена',
    (s.actual_sale_price * s.quantity_sold) AS 'Сумма',
    CASE
        WHEN pc.retail_price >= 120000 THEN 'Флагман'
        WHEN pc.retail_price >= 80000  THEN 'Премиум'
        WHEN pc.retail_price >= 40000  THEN 'Средний'
        ELSE 'Бюджет'
    END AS 'Категория'
FROM sales s
INNER JOIN shops sh  ON s.shop_code = sh.shop_code
INNER JOIN employees e ON s.employee_id = e.employee_id
INNER JOIN product_configurations pc ON s.sku_code = pc.sku_code
INNER JOIN models m ON pc.model_code = m.model_code
INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code;


-- Примеры использования VIEW
SELECT * FROM v_sales_analytics WHERE `Магазин` = 'Электроника Центр';
SELECT `Категория`, COUNT(*) AS 'Продаж', SUM(`Сумма`) AS 'Выручка'
FROM v_sales_analytics GROUP BY `Категория`;

-- ЧАСТЬ 3: ПРОЦЕДУРНЫЕ РАСШИРЕНИЯ

-- Вспомогательная таблица для хранения статистики
CREATE TABLE sales_statistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    period_description VARCHAR(200),
    total_sales INT,
    total_items_sold INT,
    total_revenue DECIMAL(15, 2),
    average_sale DECIMAL(12, 2),
    min_sale DECIMAL(12, 2),
    max_sale DECIMAL(12, 2)
) ENGINE=InnoDB;

-- PROCEDURE: расчет статистики продаж за период
DELIMITER //
CREATE PROCEDURE calculate_sales_statistics(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_description VARCHAR(200)
)
BEGIN
    DECLARE v_total_sales INT;
    DECLARE v_total_items INT;
    DECLARE v_total_revenue DECIMAL(15, 2);
    DECLARE v_avg_sale DECIMAL(12, 2);
    DECLARE v_min_sale DECIMAL(12, 2);
    DECLARE v_max_sale DECIMAL(12, 2);

    SELECT
        COUNT(sale_id),
        SUM(quantity_sold),
        SUM(actual_sale_price * quantity_sold),
        AVG(actual_sale_price * quantity_sold),
        MIN(actual_sale_price * quantity_sold),
        MAX(actual_sale_price * quantity_sold)
    INTO v_total_sales, v_total_items, v_total_revenue, v_avg_sale, v_min_sale, v_max_sale
    FROM sales
    WHERE (p_start_date IS NULL OR DATE(sale_datetime) >= p_start_date)
      AND (p_end_date IS NULL OR DATE(sale_datetime) <= p_end_date);

    INSERT INTO sales_statistics
        (period_description, total_sales, total_items_sold, total_revenue, average_sale, min_sale, max_sale)
    VALUES
        (p_description, v_total_sales, v_total_items, v_total_revenue, v_avg_sale, v_min_sale, v_max_sale);

    SELECT 'Статистика рассчитана' AS 'Результат',
           v_total_sales AS 'Продаж',
           v_total_revenue AS 'Выручка';
END //
DELIMITER ;

-- FUNCTION: количество товаров в ценовом диапазоне
DELIMITER //
CREATE FUNCTION count_products_by_price(p_min DECIMAL(12,2), p_max DECIMAL(12,2))
RETURNS INT DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count
    FROM product_configurations
    WHERE retail_price BETWEEN p_min AND p_max;
    RETURN v_count;
END //
DELIMITER ;

-- Таблица для триггеров: сводный остаток по SKU и магазину
CREATE TABLE inventory_summary (
    shop_code CHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
    sku_code CHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    total_arrived  INT DEFAULT 0,
    total_sold INT DEFAULT 0,
    total_writeoff INT DEFAULT 0,
    current_stock INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (shop_code, sku_code),
    CONSTRAINT fk_inv_shop FOREIGN KEY (shop_code)
        REFERENCES shops(shop_code) ON DELETE CASCADE,
    CONSTRAINT fk_inv_sku FOREIGN KEY (sku_code)
        REFERENCES product_configurations(sku_code) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Инициализация: все комбинации магазин + SKU
INSERT IGNORE INTO inventory_summary (shop_code, sku_code)
SELECT s.shop_code, pc.sku_code
FROM shops s CROSS JOIN product_configurations pc;

-- Заполнение данными из существующих записей
UPDATE inventory_summary inv
JOIN (
    SELECT shop_code, sku_code, SUM(quantity) AS total
    FROM arrivals GROUP BY shop_code, sku_code
) a ON inv.shop_code = a.shop_code AND inv.sku_code = a.sku_code
SET inv.total_arrived = a.total, inv.current_stock = a.total;

UPDATE inventory_summary inv
JOIN (
    SELECT shop_code, sku_code, SUM(quantity_sold) AS total
    FROM sales GROUP BY shop_code, sku_code
) s ON inv.shop_code = s.shop_code AND inv.sku_code = s.sku_code
SET inv.total_sold = s.total, inv.current_stock = inv.current_stock - s.total;

UPDATE inventory_summary inv
JOIN (
    SELECT shop_code, sku_code, SUM(quantity) AS total
    FROM writeoffs GROUP BY shop_code, sku_code
) w ON inv.shop_code = w.shop_code AND inv.sku_code = w.sku_code
SET inv.total_writeoff = w.total, inv.current_stock = inv.current_stock - w.total;

-- FUNCTION: остаток конкретного SKU по всем магазинам
DELIMITER //
CREATE FUNCTION get_stock_balance(p_sku CHAR(10), p_shop CHAR(8))
RETURNS INT DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE v_result INT DEFAULT 0;
    SELECT current_stock INTO v_result
    FROM inventory_summary
    WHERE sku_code = p_sku AND shop_code = p_shop;
    RETURN COALESCE(v_result, 0);
END //
DELIMITER ;

-- TRIGGER: обновление остатка при поступлении товара
DELIMITER //
CREATE TRIGGER after_arrival_insert AFTER INSERT ON arrivals FOR EACH ROW
BEGIN
    INSERT INTO inventory_summary (shop_code, sku_code, total_arrived, current_stock)
    VALUES (NEW.shop_code, NEW.sku_code, NEW.quantity, NEW.quantity)
    ON DUPLICATE KEY UPDATE
        total_arrived = total_arrived + NEW.quantity,
        current_stock = current_stock + NEW.quantity;
END //
DELIMITER ;

-- TRIGGER: обновление остатка при продаже
DELIMITER //
CREATE TRIGGER after_sale_insert AFTER INSERT ON sales FOR EACH ROW
BEGIN
    UPDATE inventory_summary
    SET total_sold = total_sold + NEW.quantity_sold,
        current_stock = current_stock - NEW.quantity_sold
    WHERE shop_code = NEW.shop_code AND sku_code = NEW.sku_code;
END //
DELIMITER ;

-- TRIGGER: проверка наличия товара перед продажей (по конкретному магазину)
DELIMITER //
CREATE TRIGGER before_sale_check BEFORE INSERT ON sales FOR EACH ROW
BEGIN
    DECLARE v_stock INT DEFAULT 0;
    SELECT current_stock INTO v_stock
    FROM inventory_summary
    WHERE shop_code = NEW.shop_code AND sku_code = NEW.sku_code;
    IF v_stock < NEW.quantity_sold THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Недостаточно товара в данном магазине';
    END IF;
END //
DELIMITER ;

-- Примеры вызова процедур и функций
CALL calculate_sales_statistics(NULL, NULL, 'Вся история');
SELECT * FROM sales_statistics;

SELECT count_products_by_price(0, 50000) AS 'Бюджетных товаров';
SELECT count_products_by_price(50001, 99999) AS 'Средний класс';
SELECT count_products_by_price(100000, 999999) AS 'Премиум товаров';

SELECT pc.sku_code, m.model_name, sh.shop_name, get_stock_balance(pc.sku_code, sh.shop_code) AS 'Остаток в магазине'
FROM product_configurations pc
JOIN models m ON pc.model_code = m.model_code
CROSS JOIN shops sh;

SELECT * FROM inventory_summary;

-- Проверка созданных объектов
SHOW PROCEDURE STATUS WHERE Db = 'mobile_phones_db';
SHOW FUNCTION  STATUS WHERE Db = 'mobile_phones_db';
SHOW TRIGGERS  FROM mobile_phones_db;

-- ПОЛЬЗОВАТЕЛИ СИСТЕМЫ

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'seller', 'analyst', 'customer') NOT NULL DEFAULT 'customer',
    full_name VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

INSERT INTO users (username, password, role, full_name) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Администратор'),
('seller', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', 'Иванов Иван Иванович'),
('analyst', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'analyst', 'Аналитик'),
('customer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'Покупатель');

-- ПЕРЕМЕЩЕНИЯ МЕЖДУ МАГАЗИНАМИ

CREATE TABLE transfers (
    transfer_id CHAR(10) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    from_shop_code CHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
    to_shop_code CHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
    sku_code CHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    quantity INT NOT NULL,
    transfer_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    notes TEXT COLLATE utf8mb4_unicode_ci,
    CONSTRAINT fk_transfer_from FOREIGN KEY (from_shop_code)
        REFERENCES shops(shop_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_to FOREIGN KEY (to_shop_code)
        REFERENCES shops(shop_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_sku FOREIGN KEY (sku_code)
        REFERENCES product_configurations(sku_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_transfer_quantity CHECK (quantity > 0)
) ENGINE=InnoDB COMMENT='Журнал перемещений между магазинами';

-- Триггер: обновление остатков при перемещении
DELIMITER //
CREATE TRIGGER after_transfer_insert AFTER INSERT ON transfers FOR EACH ROW
BEGIN
    -- Уменьшаем остаток в магазине-отправителе
    UPDATE inventory_summary
    SET current_stock = current_stock - NEW.quantity
    WHERE shop_code = NEW.from_shop_code AND sku_code = NEW.sku_code;

    -- Увеличиваем остаток в магазине-получателе
    INSERT INTO inventory_summary (shop_code, sku_code, total_arrived, current_stock)
    VALUES (NEW.to_shop_code, NEW.sku_code, NEW.quantity, NEW.quantity)
    ON DUPLICATE KEY UPDATE
        total_arrived = total_arrived + NEW.quantity,
        current_stock = current_stock + NEW.quantity;
END //
DELIMITER ;

-- Триггер: проверка наличия товара перед перемещением
DELIMITER //
CREATE TRIGGER before_transfer_check BEFORE INSERT ON transfers FOR EACH ROW
BEGIN
    DECLARE v_stock INT DEFAULT 0;
    SELECT current_stock INTO v_stock
    FROM inventory_summary
    WHERE shop_code = NEW.from_shop_code AND sku_code = NEW.sku_code;
    IF v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Недостаточно товара в магазине-отправителе';
    END IF;
END //
DELIMITER ;

-- Тестовые данные
INSERT INTO transfers (transfer_id, from_shop_code, to_shop_code, sku_code, quantity, transfer_date, notes) VALUES
('TF00000001', '10000001', '10000002', 'L000000003', 2, '2025-12-05', 'Перемещение по запросу магазина'),
('TF00000002', '10000003', '10000001', 'L000000008', 3, '2025-12-06', NULL);

-- Права доступа для менеджера
GRANT SELECT, INSERT ON mobile_phones_db.transfers TO 'manager_user'@'localhost';
GRANT SELECT ON mobile_phones_db.transfers TO 'analyst_user'@'localhost';
GRANT SELECT ON mobile_phones_db.transfers TO 'director_user'@'localhost';
FLUSH PRIVILEGES;

USE mobile_phones_db;

CREATE OR REPLACE VIEW v_stock AS
SELECT
    sh.shop_code AS 'Код магазина',
    sh.shop_name AS 'Магазин',
    man.manufacturer_name AS 'Производитель',
    m.model_name AS 'Модель',
    pc.sku_code AS 'SKU',
    pc.color AS 'Цвет',
    pc.ram_size AS 'RAM',
    pc.rom_size AS 'ROM',
    pc.retail_price AS 'Цена',
    COALESCE(SUM(a.quantity), 0)
        - COALESCE((
            SELECT SUM(s.quantity_sold)
            FROM sales s
            WHERE s.sku_code = pc.sku_code AND s.shop_code = sh.shop_code
          ), 0)
        - COALESCE((
            SELECT SUM(w.quantity)
            FROM writeoffs w
            WHERE w.sku_code = pc.sku_code AND w.shop_code = sh.shop_code
          ), 0)
        - COALESCE((
            SELECT SUM(t.quantity)
            FROM transfers t
            WHERE t.sku_code = pc.sku_code AND t.from_shop_code = sh.shop_code
          ), 0)
        + COALESCE((
            SELECT SUM(t.quantity)
            FROM transfers t
            WHERE t.sku_code = pc.sku_code AND t.to_shop_code = sh.shop_code
          ), 0)
    AS 'Остаток'
FROM shops sh
CROSS JOIN product_configurations pc
INNER JOIN models m ON pc.model_code = m.model_code
INNER JOIN manufacturers man ON m.manufacturer_code = man.manufacturer_code
LEFT JOIN arrivals a ON a.sku_code = pc.sku_code AND a.shop_code = sh.shop_code
GROUP BY
    sh.shop_code, sh.shop_name,
    man.manufacturer_name, m.model_name,
    pc.sku_code, pc.color, pc.ram_size, pc.rom_size, pc.retail_price
HAVING `Остаток` > 0;