const { describe, expect, test, beforeEach, afterAll } = require('@jest/globals');
const db = require('../db');

describe('Database Tests', () => {
  // Очищаем базу данных перед каждым тестом
  beforeEach(async () => {
    await db.runQuery('DELETE FROM partner_products');
    await db.runQuery('DELETE FROM products');
    await db.runQuery('DELETE FROM partners');
  });

  // Закрываем соединение после всех тестов
  afterAll(async () => {
    await db.close();
  });

  test('should add partner', async () => {
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
    const result = await db.addPartner(partner);
    expect(result.lastID).toBeDefined();
  });

  test('should get partner by id', async () => {
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
    const result = await db.addPartner(partner);
    const partnerId = result.lastID;
    const retrievedPartner = await db.getPartnerById(partnerId);
    expect(retrievedPartner).toBeDefined();
    expect(retrievedPartner.name).toBe(partner.name);
  });

  test('should update partner', async () => {
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
    const result = await db.addPartner(partner);
    const partnerId = result.lastID;
    const updatedPartner = {
      ...partner,
      name: 'Updated Partner'
    };
    await db.updatePartner(partnerId, updatedPartner);
    const retrievedPartner = await db.getPartnerById(partnerId);
    expect(retrievedPartner.name).toBe(updatedPartner.name);
  });

  test('should delete partner', async () => {
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
    const result = await db.addPartner(partner);
    const partnerId = result.lastID;
    await db.deletePartner(partnerId);
    const retrievedPartner = await db.getPartnerById(partnerId);
    expect(retrievedPartner).toBeUndefined();
  });
});
