CREATE TABLE IF NOT EXISTS material_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    defect_percent REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS product_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    coefficient REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT UNIQUE NOT NULL,
    director TEXT,
    email TEXT,
    phone TEXT,
    legal_address TEXT,
    inn TEXT UNIQUE,
    rating INTEGER
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    article TEXT UNIQUE NOT NULL,
    min_partner_price REAL,
    FOREIGN KEY (product_type_id) REFERENCES product_type(id)
);

CREATE TABLE IF NOT EXISTS partner_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    partner_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    sale_date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);
