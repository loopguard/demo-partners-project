const db = require('../db');

describe('Database', () => {
  // Очищаем базу данных перед каждым тестом
  beforeEach(async () => {
    await db.runQuery('DELETE FROM partners');
    await db.runQuery('DELETE FROM partner_products');
  });

  // Закрываем соединение после всех тестов
  afterAll(async () => {
    await db.close();
  });

  describe('addPartner', () => {
    it('should add a new partner', async () => {
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
      expect(result.lastID).toBeDefined();

      const partner = await db.getPartnerById(result.lastID);
      expect(partner).toMatchObject(partnerData);
    });

    it('should not add partner with duplicate name', async () => {
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

      await db.addPartner(partnerData);
      await expect(db.addPartner(partnerData)).rejects.toThrow();
    });
  });

  describe('getPartners', () => {
    it('should return empty array when no partners', async () => {
      const partners = await db.getPartners();
      expect(partners).toEqual([]);
    });

    it('should return all partners', async () => {
      const partner1 = {
        type: 'ООО',
        name: 'Компания 1',
        director: 'Иванов Иван',
        email: 'test1@test.com',
        phone: '1234567890',
        legal_address: 'ул. Тестовая, 1',
        inn: '1234567890',
        rating: 5
      };

      const partner2 = {
        type: 'ЗАО',
        name: 'Компания 2',
        director: 'Петров Петр',
        email: 'test2@test.com',
        phone: '0987654321',
        legal_address: 'ул. Тестовая, 2',
        inn: '0987654321',
        rating: 4
      };

      await db.addPartner(partner1);
      await db.addPartner(partner2);

      const partners = await db.getPartners();
      expect(partners).toHaveLength(2);
      expect(partners[0]).toMatchObject(partner1);
      expect(partners[1]).toMatchObject(partner2);
    });
  });

  describe('updatePartner', () => {
    it('should update partner data', async () => {
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
      const partnerId = result.lastID;

      const updatedData = {
        ...partnerData,
        name: 'Обновленная компания',
        rating: 8
      };

      await db.updatePartner(partnerId, updatedData);
      const updatedPartner = await db.getPartnerById(partnerId);
      expect(updatedPartner).toMatchObject(updatedData);
    });
  });

  describe('deletePartner', () => {
    it('should delete partner', async () => {
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
      const partnerId = result.lastID;

      await db.deletePartner(partnerId);
      const deletedPartner = await db.getPartnerById(partnerId);
      expect(deletedPartner).toBeUndefined();
    });
  });
});
