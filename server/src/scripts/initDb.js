require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, UserRole, Product, Workshop } = require('../models');

// Initial products data
const productsData = [
  {
    id: "ceramic-bowl-sage",
    name: "Керамическая миска Sage",
    price: 2800,
    category: "Посуда",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    description: "Элегантная керамическая миска ручной работы в оттенке шалфея. Идеально подходит для подачи салатов, супов или как декоративный элемент.",
    dimensions: "Диаметр 18 см, высота 8 см",
    care: "Можно мыть в посудомоечной машине, подходит для микроволновки",
    inStock: true,
    isNew: true,
    collection: "Минимализм"
  },
  {
    id: "ceramic-vase-earth",
    name: "Ваза Earth",
    price: 4200,
    category: "Декор",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    description: "Уникальная керамическая ваза в земляных тонах. Каждая ваза имеет индивидуальную текстуру благодаря ручной работе.",
    dimensions: "Высота 25 см, диаметр 12 см",
    care: "Ручная мойка, не подходит для микроволновки",
    inStock: true,
    isNew: true,
    collection: "Природа"
  },
  {
    id: "dinnerware-set-natural",
    name: "Набор посуды Natural",
    price: 8900,
    category: "Наборы",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    description: "Комплект из 4 тарелок и 4 мисок в натуральных оттенках. Идеально для семейных обедов.",
    dimensions: "Тарелки: диаметр 24 см, миски: диаметр 16 см",
    care: "Можно мыть в посудомоечной машине, подходит для микроволновки",
    inStock: true,
    isNew: false,
    collection: "Семейная"
  },
  {
    id: "plant-pot-terracotta",
    name: "Горшок для растений Terracotta",
    price: 1900,
    category: "Горшки",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    description: "Классический терракотовый горшок с дренажным отверстием. Отличный выбор для комнатных растений.",
    dimensions: "Высота 15 см, диаметр 16 см",
    care: "Водонепроницаемое покрытие внутри",
    inStock: true,
    isNew: false,
    collection: "Сад"
  },
  {
    id: "mug-artisan",
    name: "Кружка Artisan",
    price: 1600,
    category: "Посуда",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    description: "Удобная керамическая кружка с уникальным рельефом. Каждая кружка неповторима.",
    dimensions: "Объем 350 мл, высота 10 см",
    care: "Можно мыть в посудомоечной машине, подходит для микроволновки",
    inStock: true,
    isNew: true,
    collection: "Утро"
  },
  {
    id: "decorative-plate-moon",
    name: "Декоративная тарелка Moon",
    price: 3200,
    category: "Декор",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    description: "Настенная декоративная тарелка с лунным дизайном. Прекрасно дополнит интерьер в стиле бохо.",
    dimensions: "Диаметр 28 см",
    care: "Только декоративное использование",
    inStock: true,
    isNew: false,
    collection: "Космос"
  }
];

// Initial workshops data
const workshopsData = [
  {
    id: "beginner-pottery",
    title: "Введение в гончарное дело",
    date: "2025-01-20",
    time: "10:00",
    duration: "3 часа",
    format: "Группа",
    price: 3500,
    maxParticipants: 8,
    currentParticipants: 5,
    description: "Узнайте основы работы с глиной, создайте свою первую керамическую миску под руководством мастера.",
    includes: ["Все материалы", "Обжиг изделия", "Чай и печенье"],
    level: "Начинающий"
  },
  {
    id: "advanced-glazing",
    title: "Техники глазурования",
    date: "2025-01-25",
    time: "14:00",
    duration: "4 часа",
    format: "Группа",
    price: 4200,
    maxParticipants: 6,
    currentParticipants: 3,
    description: "Освойте различные техники нанесения глазури для создания уникальных эффектов на ваших изделиях.",
    includes: ["Глазури", "Готовые заготовки", "Двойной обжиг"],
    level: "Продолжающий"
  },
  {
    id: "family-pottery",
    title: "Семейная керамика",
    date: "2025-01-27",
    time: "11:00",
    duration: "2.5 часа",
    format: "Семейное",
    price: 2800,
    maxParticipants: 12,
    currentParticipants: 8,
    description: "Творите вместе с детьми! Создайте семейный набор посуды или декоративные элементы.",
    includes: ["Материалы для всей семьи", "Простой обжиг", "Фото на память"],
    level: "Для всех возрастов"
  },
  {
    id: "individual-masterclass",
    title: "Индивидуальный мастер-класс",
    date: "По договоренности",
    time: "По договоренности",
    duration: "2-4 часа",
    format: "Индивидуальный",
    price: 6000,
    maxParticipants: 1,
    currentParticipants: 0,
    description: "Персональное обучение с учетом ваших интересов и уровня подготовки. Гибкое расписание.",
    includes: ["Индивидуальная программа", "Все материалы", "Полный цикл создания изделия"],
    level: "Любой"
  }
];

async function initDb() {
  try {
    console.log('Initializing database...');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@feia.ru';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const adminUser = await User.create({
      email: adminEmail,
      password: adminPassword,
      name: 'Администратор'
    });
    
    await UserRole.create({
      userId: adminUser.id,
      role: 'admin'
    });
    
    console.log(`Admin user created: ${adminEmail}`);
    
    // Create products
    for (const product of productsData) {
      await Product.create(product);
    }
    console.log(`Created ${productsData.length} products`);
    
    // Create workshops
    for (const workshop of workshopsData) {
      await Workshop.create(workshop);
    }
    console.log(`Created ${workshopsData.length} workshops`);
    
    console.log('Database initialization complete!');
    console.log(`\nAdmin credentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDb();
