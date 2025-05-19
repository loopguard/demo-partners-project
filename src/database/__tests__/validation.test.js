const db = require('../db');

describe('Data Validation', () => {
  // Очищаем базу данных перед каждым тестом
  beforeEach(async () => {
    await db.runQuery('DELETE FROM partners');
    await db.runQuery('DELETE FROM partner_products');
  });

  // Закрываем соединение после всех тестов
  afterAll(async () => {
    await db.close();
  });

  describe('Partner Validation', () => {
    it('should not accept empty name', async () => {
      const partnerData = {
        type: 'ООО',
        name: '',
        director: 'Иванов Иван',
        email: 'test@test.com',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '1234567890',
        rating: 5
      };

      await expect(db.addPartner(partnerData)).rejects.toThrow();
    });

    it('should not accept invalid email format', async () => {
      const partnerData = {
        type: 'ООО',
        name: 'Тестовая компания',
        director: 'Иванов Иван',
        email: 'invalid-email',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '1234567890',
        rating: 5
      };

      await expect(db.addPartner(partnerData)).rejects.toThrow();
    });

    it('should not accept invalid INN format', async () => {
      const partnerData = {
        type: 'ООО',
        name: 'Тестовая компания',
        director: 'Иванов Иван',
        email: 'test@test.com',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '123', // INN должен быть 10 или 12 цифр
        rating: 5
      };

      await expect(db.addPartner(partnerData)).rejects.toThrow();
    });

    it('should not accept negative rating', async () => {
      const partnerData = {
        type: 'ООО',
        name: 'Тестовая компания',
        director: 'Иванов Иван',
        email: 'test@test.com',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '1234567890',
        rating: -1
      };

      await expect(db.addPartner(partnerData)).rejects.toThrow();
    });

    it('should not accept rating greater than 10', async () => {
      const partnerData = {
        type: 'ООО',
        name: 'Тестовая компания',
        director: 'Иванов Иван',
        email: 'test@test.com',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '1234567890',
        rating: 11
      };

      await expect(db.addPartner(partnerData)).rejects.toThrow();
    });
  });

  describe('Partner Product Validation', () => {
    let partnerId;

    beforeEach(async () => {
      const partnerData = {
        type: 'ООО',
        name: 'Тестовая компания',
        director: 'Иванов Иван',
        email: 'test@test.com',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '1234567890',
        rating: 5
      };

      const result = await db.addPartner(partnerData);
      partnerId = result.lastID;
    });

    it('should not accept negative quantity', async () => {
      await expect(
        db.runQuery(
          'INSERT INTO partner_products (partner_id, quantity) VALUES (?, ?)',
          [partnerId, -100]
        )
      ).rejects.toThrow();
    });

    it('should not accept zero quantity', async () => {
      await expect(
        db.runQuery(
          'INSERT INTO partner_products (partner_id, quantity) VALUES (?, ?)',
          [partnerId, 0]
        )
      ).rejects.toThrow();
    });

    it('should not accept non-existent partner_id', async () => {
      await expect(
        db.runQuery(
          'INSERT INTO partner_products (partner_id, quantity) VALUES (?, ?)',
          [999999, 100]
        )
      ).rejects.toThrow();
    });
  });
});
