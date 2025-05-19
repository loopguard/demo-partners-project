const { describe, expect, test, beforeEach, afterAll } = require('@jest/globals');
const db = require('../db');

describe('Partner Products Tests', () => {
    beforeEach(async () => {
        await db.runQuery('DELETE FROM partner_products');
        await db.runQuery('DELETE FROM products');
        await db.runQuery('DELETE FROM partners');
    });

    afterAll(async () => {
        await db.close();
    });

    test('should add partner product with valid data', async () => {
        // Сначала создаем партнера
        const partner = {
            type: 'ООО',
            name: 'Test Partner',
            director: 'Иванов Иван',
            email: 'test@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 1',
            inn: '1234567890',
            rating: 5
        };
        const partnerResult = await db.addPartner(partner);
        const partnerId = partnerResult.lastID;

        // Создаем продукт
        const product = {
            product_type_id: 1, // предполагается, что тип продукта с id=1 существует
            name: 'Test Product',
            article: 'A123',
            min_partner_price: 1000
        };
        await db.runQuery('INSERT INTO products (product_type_id, name, article, min_partner_price) VALUES (?, ?, ?, ?)', [product.product_type_id, product.name, product.article, product.min_partner_price]);
        const productRow = await db.getQuery('SELECT id FROM products WHERE article = ?', [product.article]);
        const productId = productRow.id;

        // Добавляем продукт партнера
        const quantity = 10;
        const saleDate = '2024-06-10';
        const productResult = await db.addPartnerProduct(productId, partnerId, quantity, saleDate);
        expect(productResult.lastID).toBeDefined();
    });

    test('should throw error when adding product with invalid partner ID', async () => {
        // Создаем продукт
        await db.runQuery('INSERT INTO products (product_type_id, name, article, min_partner_price) VALUES (?, ?, ?, ?)', [1, 'Test Product', 'A124', 1000]);
        const productRow = await db.getQuery('SELECT id FROM products WHERE article = ?', ['A124']);
        const productId = productRow.id;
        const invalidPartnerId = 999;
        const quantity = 10;
        const saleDate = '2024-06-10';
        await expect(db.addPartnerProduct(productId, invalidPartnerId, quantity, saleDate))
            .rejects
            .toThrow('Партнер не найден');
    });

    test('should throw error when adding product with invalid product ID', async () => {
        // Сначала создаем партнера
        const partner = {
            type: 'ООО',
            name: 'Test Partner 2',
            director: 'Иванов Иван',
            email: 'test2@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 2',
            inn: '1234567891',
            rating: 5
        };
        const partnerResult = await db.addPartner(partner);
        const partnerId = partnerResult.lastID;
        const invalidProductId = 999;
        const quantity = 10;
        const saleDate = '2024-06-10';
        await expect(db.addPartnerProduct(invalidProductId, partnerId, quantity, saleDate))
            .rejects
            .toThrow('Продукт не найден');
    });

    test('should throw error when adding product with negative quantity', async () => {
        // Сначала создаем партнера и продукт
        const partner = {
            type: 'ООО',
            name: 'Test Partner 3',
            director: 'Иванов Иван',
            email: 'test3@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 3',
            inn: '1234567892',
            rating: 5
        };
        const partnerResult = await db.addPartner(partner);
        const partnerId = partnerResult.lastID;
        await db.runQuery('INSERT INTO products (product_type_id, name, article, min_partner_price) VALUES (?, ?, ?, ?)', [1, 'Test Product 3', 'A125', 1000]);
        const productRow = await db.getQuery('SELECT id FROM products WHERE article = ?', ['A125']);
        const productId = productRow.id;
        const negativeQuantity = -5;
        const saleDate = '2024-06-10';
        await expect(db.addPartnerProduct(productId, partnerId, negativeQuantity, saleDate))
            .rejects
            .toThrow('Количество должно быть положительным числом');
    });

    test('should throw error when adding product with zero quantity', async () => {
        // Сначала создаем партнера и продукт
        const partner = {
            type: 'ООО',
            name: 'Test Partner 4',
            director: 'Иванов Иван',
            email: 'test4@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 4',
            inn: '1234567893',
            rating: 5
        };
        const partnerResult = await db.addPartner(partner);
        const partnerId = partnerResult.lastID;
        await db.runQuery('INSERT INTO products (product_type_id, name, article, min_partner_price) VALUES (?, ?, ?, ?)', [1, 'Test Product 4', 'A126', 1000]);
        const productRow = await db.getQuery('SELECT id FROM products WHERE article = ?', ['A126']);
        const productId = productRow.id;
        const zeroQuantity = 0;
        const saleDate = '2024-06-10';
        await expect(db.addPartnerProduct(productId, partnerId, zeroQuantity, saleDate))
            .rejects
            .toThrow('Количество должно быть положительным числом');
    });

    test('should throw error when adding product with invalid sale date', async () => {
        // Сначала создаем партнера и продукт
        const partner = {
            type: 'ООО',
            name: 'Test Partner 5',
            director: 'Иванов Иван',
            email: 'test5@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 5',
            inn: '1234567894',
            rating: 5
        };
        const partnerResult = await db.addPartner(partner);
        const partnerId = partnerResult.lastID;
        await db.runQuery('INSERT INTO products (product_type_id, name, article, min_partner_price) VALUES (?, ?, ?, ?)', [1, 'Test Product 5', 'A127', 1000]);
        const productRow = await db.getQuery('SELECT id FROM products WHERE article = ?', ['A127']);
        const productId = productRow.id;
        const quantity = 10;
        const invalidSaleDate = 'not-a-date';
        await expect(db.addPartnerProduct(productId, partnerId, quantity, invalidSaleDate))
            .rejects
            .toThrow('Некорректная дата продажи');
    });
});
