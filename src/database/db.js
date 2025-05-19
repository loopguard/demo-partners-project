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
        const { type, name, director, email, phone, legal_address, inn, rating } = partnerData;
        const sql = `
            INSERT INTO partners (type, name, director, email, phone, legal_address, inn, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [type, name, director, email, phone, legal_address, inn, rating];
        return this.runQuery(sql, params);
    }

    async updatePartner(id, partnerData) {
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
        this.db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

module.exports = new Database();
