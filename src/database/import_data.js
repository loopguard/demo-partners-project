const { MaterialType, ProductType, Partner, Product, PartnerProduct } = require('./models');

// Данные для импорта в базу данных из excel файлов
// Можно было файлы в прицнипе читать но я так размапил тк их не много
const productTypes = [
  { name: "Ламинат", coefficient: 2.35 },
  { name: "Массивная доска", coefficient: 5.15 },
  { name: "Паркетная доска", coefficient: 4.34 },
  { name: "Пробковое покрытие", coefficient: 1.5 }
];

const materialTypes = [
  { name: "Тип материала 1", defect_percent: 0.10 },
  { name: "Тип материала 2", defect_percent: 0.95 },
  { name: "Тип материала 3", defect_percent: 0.28 },
  { name: "Тип материала 4", defect_percent: 0.55 },
  { name: "Тип материала 5", defect_percent: 0.34 }
];

const partners = [
  {
    type: "ЗАО",
    name: "База Строитель",
    director: "Иванова Александра Ивановна",
    email: "aleksandraivanova@ml.ru",
    phone: "493 123 45 67",
    legal_address: "652050, Кемеровская область, город Юрга, ул. Лесная, 15",
    inn: "2222455179",
    rating: 7
  },
  {
    type: "ООО",
    name: "Паркет 29",
    director: "Петров Василий Петрович",
    email: "vppetrov@vl.ru",
    phone: "987 123 56 78",
    legal_address: "164500, Архангельская область, город Северодвинск, ул. Строителей, 18",
    inn: "3333888520",
    rating: 7
  },
  {
    type: "ПАО",
    name: "Стройсервис",
    director: "Соловьев Андрей Николаевич",
    email: "ansolovev@st.ru",
    phone: "812 223 32 00",
    legal_address: "188910, Ленинградская область, город Приморск, ул. Парковая, 21",
    inn: "4440391035",
    rating: 7
  },
  {
    type: "ОАО",
    name: "Ремонт и отделка",
    director: "Воробьева Екатерина Валерьевна",
    email: "ekaterina.vorobeva@ml.ru",
    phone: "444 222 33 11",
    legal_address: "143960, Московская область, город Реутов, ул. Свободы, 51",
    inn: "1111520857",
    rating: 5
  },
  {
    type: "ЗАО",
    name: "МонтажПро",
    director: "Степанов Степан Сергеевич",
    email: "stepanov@stepan.ru",
    phone: "912 888 33 33",
    legal_address: "309500, Белгородская область, город Старый Оскол, ул. Рабочая, 122",
    inn: "5552431140",
    rating: 10
  }
];

const products = [
  {
    product_type: "Паркетная доска",
    name: "Паркетная доска Ясень темный однополосная 14 мм",
    article: "8758385",
    min_partner_price: 4456.90
  },
  {
    product_type: "Паркетная доска",
    name: "Инженерная доска Дуб Французская елка однополосная 12 мм",
    article: "8858958",
    min_partner_price: 7330.99
  },
  {
    product_type: "Ламинат",
    name: "Ламинат Дуб дымчато-белый 33 класс 12 мм",
    article: "7750282",
    min_partner_price: 1799.33
  },
  {
    product_type: "Ламинат",
    name: "Ламинат Дуб серый 32 класс 8 мм с фаской",
    article: "7028748",
    min_partner_price: 3890.41
  },
  {
    product_type: "Пробковое покрытие",
    name: "Пробковое напольное клеевое покрытие 32 класс 4 мм",
    article: "5012543",
    min_partner_price: 5450.59
  }
];

const partnerProducts = [
  { product: "Паркетная доска Ясень темный однополосная 14 мм", partner: "База Строитель", quantity: 15500, sale_date: "2023-03-23" },
  { product: "Ламинат Дуб дымчато-белый 33 класс 12 мм", partner: "База Строитель", quantity: 12350, sale_date: "2023-12-18" },
  { product: "Ламинат Дуб серый 32 класс 8 мм с фаской", partner: "База Строитель", quantity: 37400, sale_date: "2024-06-07" },
  { product: "Инженерная доска Дуб Французская елка однополосная 12 мм", partner: "Паркет 29", quantity: 35000, sale_date: "2022-12-02" },
  { product: "Пробковое напольное клеевое покрытие 32 класс 4 мм", partner: "Паркет 29", quantity: 1250, sale_date: "2023-05-17" },
  { product: "Ламинат Дуб дымчато-белый 33 класс 12 мм", partner: "Паркет 29", quantity: 1000, sale_date: "2024-06-07" },
  { product: "Паркетная доска Ясень темный однополосная 14 мм", partner: "Паркет 29", quantity: 7550, sale_date: "2024-07-01" },
  { product: "Паркетная доска Ясень темный однополосная 14 мм", partner: "Стройсервис", quantity: 7250, sale_date: "2023-01-22" },
  { product: "Инженерная доска Дуб Французская елка однополосная 12 мм", partner: "Стройсервис", quantity: 2500, sale_date: "2024-07-05" },
  { product: "Ламинат Дуб серый 32 класс 8 мм с фаской", partner: "Ремонт и отделка", quantity: 59050, sale_date: "2023-03-20" },
  { product: "Ламинат Дуб дымчато-белый 33 класс 12 мм", partner: "Ремонт и отделка", quantity: 37200, sale_date: "2024-03-12" },
  { product: "Пробковое напольное клеевое покрытие 32 класс 4 мм", partner: "Ремонт и отделка", quantity: 4500, sale_date: "2024-05-14" },
  { product: "Ламинат Дуб дымчато-белый 33 класс 12 мм", partner: "МонтажПро", quantity: 50000, sale_date: "2023-09-19" },
  { product: "Ламинат Дуб серый 32 класс 8 мм с фаской", partner: "МонтажПро", quantity: 670000, sale_date: "2023-11-10" },
  { product: "Паркетная доска Ясень темный однополосная 14 мм", partner: "МонтажПро", quantity: 35000, sale_date: "2024-04-15" },
  { product: "Инженерная доска Дуб Французская елка однополосная 12 мм", partner: "МонтажПро", quantity: 25000, sale_date: "2024-06-12" }
];

// Функция для импорта данных в бд
async function importAll() {
  const productTypeMap = {};
  for (const pt of productTypes) {
    const id = await ProductType.create(pt.name, pt.coefficient);
    productTypeMap[pt.name] = id;
  }

  for (const mt of materialTypes) {
    await MaterialType.create(mt.name, mt.defect_percent);
  }

  const partnerMap = {};
  for (const p of partners) {
    const id = await Partner.create(p);
    partnerMap[p.name] = id;
  }

  const productMap = {};
  for (const p of products) {
    const product_type_id = productTypeMap[p.product_type];
    const id = await Product.create({
      product_type_id,
      name: p.name,
      article: p.article,
      min_partner_price: p.min_partner_price
    });
    productMap[p.name] = id;
  }

  for (const pp of partnerProducts) {
    const product_id = productMap[pp.product];
    const partner_id = partnerMap[pp.partner];
    await PartnerProduct.create({
      product_id,
      partner_id,
      quantity: pp.quantity,
      sale_date: pp.sale_date
    });
  }

  console.log('Импорт завершён!');
  process.exit(0);
}

importAll().catch(e => { console.error(e); process.exit(1); });
