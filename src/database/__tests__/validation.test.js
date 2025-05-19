const { describe, expect, test, beforeEach, afterAll } = require('@jest/globals');
const db = require('../db');

describe('Validation Tests', () => {
    beforeEach(async () => {
        await db.runQuery('DELETE FROM partner_products');
        await db.runQuery('DELETE FROM products');
        await db.runQuery('DELETE FROM partners');
    });

    afterAll(async () => {
        await db.close();
    });

    test('should reject empty partner name', async () => {
        const partner = {
            type: 'ООО',
            name: '',
            director: 'Иванов Иван',
            email: 'test@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 1',
            inn: '1234567890',
            rating: 5
        };
        await expect(db.addPartner(partner))
            .rejects
            .toThrow('Имя партнера не может быть пустым');
    });

    test('should reject invalid email format', async () => {
        const partner = {
            type: 'ООО',
            name: 'Test Partner',
            director: 'Иванов Иван',
            email: 'invalid-email',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 1',
            inn: '1234567890',
            rating: 5
        };
        await expect(db.addPartner(partner))
            .rejects
            .toThrow('Некорректный формат email');
    });

    test('should reject invalid INN format', async () => {
        const partner = {
            type: 'ООО',
            name: 'Test Partner',
            director: 'Иванов Иван',
            email: 'test@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 1',
            inn: '12345',
            rating: 5
        };
        await expect(db.addPartner(partner))
            .rejects
            .toThrow('ИНН должен содержать 10 или 12 цифр');
    });

    test('should reject negative rating', async () => {
        const partner = {
            type: 'ООО',
            name: 'Test Partner',
            director: 'Иванов Иван',
            email: 'test@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 1',
            inn: '1234567890',
            rating: -1
        };
        await expect(db.addPartner(partner))
            .rejects
            .toThrow('Рейтинг должен быть от 0 до 10');
    });

    test('should reject rating greater than 10', async () => {
        const partner = {
            type: 'ООО',
            name: 'Test Partner',
            director: 'Иванов Иван',
            email: 'test@example.com',
            phone: '1234567890',
            legal_address: 'ул. Тестовая, 1',
            inn: '1234567890',
            rating: 11
        };
        await expect(db.addPartner(partner))
            .rejects
            .toThrow('Рейтинг должен быть от 0 до 10');
    });

    test('should reject zero quantity for partner product', async () => {
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
            product_type_id: 1,
            name: 'Test Product',
            article: 'A123',
            min_partner_price: 1000
        };
        await db.runQuery('INSERT INTO products (product_type_id, name, article, min_partner_price) VALUES (?, ?, ?, ?)', [product.product_type_id, product.name, product.article, product.min_partner_price]);
        const productRow = await db.getQuery('SELECT id FROM products WHERE article = ?', [product.article]);
        const productId = productRow.id;

        // Пытаемся добавить продукт с нулевым количеством
        const zeroQuantity = 0;
        const saleDate = '2024-06-10';
        await expect(db.addPartnerProduct(productId, partnerId, zeroQuantity, saleDate))
            .rejects
            .toThrow('Количество должно быть положительным числом');
    });
});
