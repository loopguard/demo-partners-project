const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('Connected to the SQLite database.');
                this.init();
            }
        });
    }

    init() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS partners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                name TEXT UNIQUE NOT NULL,
                director TEXT,
                email TEXT,
                phone TEXT,
                legal_address TEXT,
                inn TEXT UNIQUE,
                rating INTEGER
            )`,
            `CREATE TABLE IF NOT EXISTS partner_products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                partner_id INTEGER,
                quantity INTEGER,
                FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
            )`
        ];
        tables.forEach(table => {
            this.db.run(table, err => {
                if (err) {
                    console.error('Error creating table:', err);
                }
            });
        });
    }

    // Вспомогательные методы для работы с базой данных
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    allQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Методы валидации
    validatePartner(partnerData) {
        const { name, email, inn, rating } = partnerData;

        if (!name || name.trim() === '') {
            throw new Error('Имя партнера не может быть пустым');
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Неверный формат email');
        }

        if (inn && !/^\d{10}$|^\d{12}$/.test(inn)) {
            throw new Error('ИНН должен содержать 10 или 12 цифр');
        }

        if (rating !== undefined && (rating < 0 || rating > 10)) {
            throw new Error('Рейтинг должен быть от 0 до 10');
        }
    }

    validatePartnerProduct(productId, partnerId, quantity, saleDate) {
        if (!productId) {
            throw new Error('Не указан продукт');
        }
        if (!partnerId) {
            throw new Error('Не указан партнер');
        }
        if (quantity <= 0) {
            throw new Error('Количество должно быть положительным числом');
        }
        if (!saleDate || isNaN(Date.parse(saleDate))) {
            throw new Error('Некорректная дата продажи');
        }
        return Promise.all([
            this.getQuery('SELECT id FROM partners WHERE id = ?', [partnerId]),
            this.getQuery('SELECT id FROM products WHERE id = ?', [productId])
        ]).then(([partner, product]) => {
            if (!partner) {
                throw new Error('Партнер не найден');
            }
            if (!product) {
                throw new Error('Продукт не найден');
            }
        });
    }

    // Методы для работы с партнерами
    async getPartners() {
        const sql = `
            SELECT p.*,
                   IFNULL(COUNT(pp.id), 0) as total_sales,
                   IFNULL(SUM(pp.quantity), 0) as total_quantity
            FROM partners p
            LEFT JOIN partner_products pp ON p.id = pp.partner_id
            GROUP BY p.id
            ORDER BY p.name
        `;
        return this.allQuery(sql);
    }

    async addPartner(partnerData) {
        this.validatePartner(partnerData);
        const { type, name, director, email, phone, legal_address, inn, rating } = partnerData;
        const sql = `
            INSERT INTO partners (type, name, director, email, phone, legal_address, inn, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [type, name, director, email, phone, legal_address, inn, rating];
        return this.runQuery(sql, params);
    }

    async updatePartner(id, partnerData) {
        this.validatePartner(partnerData);
        const { type, name, director, email, phone, legal_address, inn, rating } = partnerData;
        const sql = `
            UPDATE partners
            SET type = ?, name = ?, director = ?, email = ?, phone = ?, legal_address = ?, inn = ?, rating = ?
            WHERE id = ?
        `;
        const params = [type, name, director, email, phone, legal_address, inn, rating, id];
        return this.runQuery(sql, params);
    }

    async deletePartner(partnerId) {
        const sql = `DELETE FROM partners WHERE id = ?`;
        const params = [partnerId];
        return this.runQuery(sql, params);
    }

    async addPartnerProduct(productId, partnerId, quantity, saleDate) {
        await this.validatePartnerProduct(productId, partnerId, quantity, saleDate);
        const sql = `
            INSERT INTO partner_products (product_id, partner_id, quantity, sale_date)
            VALUES (?, ?, ?, ?)
        `;
        const params = [productId, partnerId, quantity, saleDate];
        return this.runQuery(sql, params);
    }

    async getPartnerById(partnerId) {
        const sql = `
            SELECT p.*,
                   IFNULL(COUNT(pp.id), 0) as total_sales,
                   IFNULL(SUM(pp.quantity), 0) as total_quantity
            FROM partners p
            LEFT JOIN partner_products pp ON p.id = pp.partner_id
            WHERE p.id = ?
            GROUP BY p.id
        `;
        const params = [partnerId];
        return this.getQuery(sql, params);
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = new Database();
