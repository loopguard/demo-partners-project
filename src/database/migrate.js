const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const migrationsDir = path.join(__dirname, 'migrations');

const db = new sqlite3.Database(dbPath);

function runMigrations() {
    fs.readdirSync(migrationsDir).forEach(file => {
        if (file.endsWith('.sql')) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            db.exec(sql, (err) => {
                if (err) {
                    console.error(`Ошибка миграции ${file}:`, err);
                } else {
                    console.log(`Миграция ${file} применена успешно.`);
                }
            });
        }
    });
}

runMigrations();
db.close();
