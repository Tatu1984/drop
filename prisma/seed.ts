import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Create main categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Starters', icon: '🥗', sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: 'Main Course', icon: '🍛', sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: 'Breads', icon: '🥖', sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: 'Rice & Biryani', icon: '🍚', sortOrder: 4 },
    }),
    prisma.category.create({
      data: { name: 'Desserts', icon: '🍨', sortOrder: 5 },
    }),
    prisma.category.create({
      data: { name: 'Beverages', icon: '🥤', sortOrder: 6 },
    }),
  ]);

  console.log('Created categories');

  // Create sample vendors
  const vendors = await Promise.all([
    // Restaurants
    prisma.vendor.create({
      data: {
        name: 'Spice Garden',
        description: 'Authentic North Indian cuisine with a modern twist',
        logo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200',
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        type: 'RESTAURANT',
        isVerified: true,
        rating: 4.5,
        totalRatings: 234,
        address: '123 MG Road, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        openingTime: '10:00',
        closingTime: '23:00',
        minimumOrder: 150,
        avgDeliveryTime: 30,
        commissionRate: 15,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Pizza Paradise',
        description: 'Wood-fired pizzas and Italian favorites',
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
        coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        type: 'RESTAURANT',
        isVerified: true,
        rating: 4.3,
        totalRatings: 456,
        address: '456 Brigade Road, Bangalore',
        latitude: 12.9750,
        longitude: 77.6066,
        openingTime: '11:00',
        closingTime: '23:00',
        minimumOrder: 200,
        avgDeliveryTime: 35,
        commissionRate: 15,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Dragon Bowl',
        description: 'Authentic Chinese and Pan-Asian cuisine',
        logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200',
        coverImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
        type: 'RESTAURANT',
        isVerified: true,
        rating: 4.4,
        totalRatings: 312,
        address: '789 Indiranagar, Bangalore',
        latitude: 12.9784,
        longitude: 77.6408,
        openingTime: '12:00',
        closingTime: '22:30',
        minimumOrder: 180,
        avgDeliveryTime: 40,
        commissionRate: 15,
      },
    }),
    // Grocery
    prisma.vendor.create({
      data: {
        name: 'Fresh Mart',
        description: 'Fresh groceries delivered to your doorstep',
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
        coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
        type: 'GROCERY',
        isVerified: true,
        rating: 4.6,
        totalRatings: 567,
        address: '321 Koramangala, Bangalore',
        latitude: 12.9352,
        longitude: 77.6245,
        openingTime: '07:00',
        closingTime: '22:00',
        minimumOrder: 100,
        avgDeliveryTime: 25,
        commissionRate: 12,
      },
    }),
    // Wine Shop
    prisma.vendor.create({
      data: {
        name: 'The Wine Cellar',
        description: 'Premium wines and spirits',
        logo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
        coverImage: 'https://images.unsplash.com/photo-1516594915307-8f71a04a7e91?w=800',
        type: 'WINE_SHOP',
        isVerified: true,
        rating: 4.7,
        totalRatings: 189,
        address: '555 HSR Layout, Bangalore',
        latitude: 12.9121,
        longitude: 77.6446,
        openingTime: '10:00',
        closingTime: '22:00',
        minimumOrder: 500,
        avgDeliveryTime: 45,
        commissionRate: 10,
        licenseNumber: 'WL-BLR-2024-0001',
        licenseExpiry: new Date('2025-12-31'),
      },
    }),
  ]);

  console.log('Created vendors');

  // Create products for each vendor
  const products = [];

  // Spice Garden products
  products.push(
    ...(await Promise.all([
      prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          categoryId: categories[0].id,
          name: 'Paneer Tikka',
          description: 'Marinated cottage cheese grilled to perfection',
          images: ['https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400'],
          price: 280,
          isVeg: true,
          rating: 4.6,
          totalRatings: 89,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          categoryId: categories[1].id,
          name: 'Butter Chicken',
          description: 'Creamy tomato-based chicken curry',
          images: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400'],
          price: 350,
          isVeg: false,
          rating: 4.8,
          totalRatings: 156,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          categoryId: categories[1].id,
          name: 'Dal Makhani',
          description: 'Slow-cooked black lentils in creamy gravy',
          images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'],
          price: 220,
          isVeg: true,
          rating: 4.5,
          totalRatings: 112,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          categoryId: categories[2].id,
          name: 'Garlic Naan',
          description: 'Soft naan bread with garlic butter',
          images: ['https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400'],
          price: 60,
          isVeg: true,
          rating: 4.4,
          totalRatings: 98,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[0].id,
          categoryId: categories[3].id,
          name: 'Chicken Biryani',
          description: 'Fragrant basmati rice with spiced chicken',
          images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'],
          price: 320,
          isVeg: false,
          rating: 4.7,
          totalRatings: 201,
        },
      }),
    ]))
  );

  // Pizza Paradise products
  products.push(
    ...(await Promise.all([
      prisma.product.create({
        data: {
          vendorId: vendors[1].id,
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato, mozzarella, and basil',
          images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'],
          price: 299,
          isVeg: true,
          rating: 4.5,
          totalRatings: 178,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[1].id,
          name: 'Pepperoni Pizza',
          description: 'Loaded with pepperoni and cheese',
          images: ['https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'],
          price: 449,
          isVeg: false,
          rating: 4.6,
          totalRatings: 234,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[1].id,
          name: 'Veggie Supreme',
          description: 'Loaded with bell peppers, olives, mushrooms, and onions',
          images: ['https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400'],
          price: 399,
          isVeg: true,
          rating: 4.4,
          totalRatings: 145,
        },
      }),
    ]))
  );

  // Dragon Bowl products
  products.push(
    ...(await Promise.all([
      prisma.product.create({
        data: {
          vendorId: vendors[2].id,
          name: 'Kung Pao Chicken',
          description: 'Spicy stir-fried chicken with peanuts',
          images: ['https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400'],
          price: 320,
          isVeg: false,
          rating: 4.5,
          totalRatings: 134,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[2].id,
          name: 'Vegetable Fried Rice',
          description: 'Wok-tossed rice with mixed vegetables',
          images: ['https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'],
          price: 180,
          isVeg: true,
          rating: 4.3,
          totalRatings: 98,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[2].id,
          name: 'Hakka Noodles',
          description: 'Stir-fried noodles with vegetables',
          images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'],
          price: 200,
          isVeg: true,
          rating: 4.4,
          totalRatings: 112,
        },
      }),
    ]))
  );

  // Fresh Mart products
  products.push(
    ...(await Promise.all([
      prisma.product.create({
        data: {
          vendorId: vendors[3].id,
          name: 'Fresh Milk (1L)',
          description: 'Farm fresh pasteurized milk',
          images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
          price: 60,
          isVeg: true,
          packSize: '1 Litre',
          brand: 'Nandini',
          rating: 4.7,
          totalRatings: 234,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[3].id,
          name: 'Organic Bananas',
          description: 'Fresh organic bananas (1 dozen)',
          images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'],
          price: 50,
          isVeg: true,
          packSize: '12 pieces',
          rating: 4.5,
          totalRatings: 189,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[3].id,
          name: 'Basmati Rice (5kg)',
          description: 'Premium aged basmati rice',
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
          price: 450,
          isVeg: true,
          packSize: '5 kg',
          brand: 'India Gate',
          rating: 4.6,
          totalRatings: 156,
        },
      }),
    ]))
  );

  // Wine Cellar products
  products.push(
    ...(await Promise.all([
      prisma.product.create({
        data: {
          vendorId: vendors[4].id,
          name: 'Sula Chenin Blanc',
          description: 'Refreshing white wine with fruity notes',
          images: ['https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400'],
          price: 750,
          isVeg: true,
          abvPercent: 12.5,
          tasteProfile: 'Fruity, Crisp',
          countryOfOrigin: 'India',
          year: 2022,
          pairings: ['Seafood', 'Salads', 'Light appetizers'],
          rating: 4.4,
          totalRatings: 67,
        },
      }),
      prisma.product.create({
        data: {
          vendorId: vendors[4].id,
          name: 'Grover Zampa Cabernet',
          description: 'Full-bodied red wine with oak aging',
          images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'],
          price: 1200,
          isVeg: true,
          abvPercent: 13.5,
          tasteProfile: 'Bold, Oaky',
          countryOfOrigin: 'India',
          year: 2020,
          grapeType: 'Cabernet Sauvignon',
          pairings: ['Red meat', 'Cheese', 'Dark chocolate'],
          rating: 4.6,
          totalRatings: 89,
        },
      }),
    ]))
  );

  console.log('Created products');

  // Create promotions
  await Promise.all([
    prisma.promotion.create({
      data: {
        code: 'WELCOME50',
        description: '50% off on your first order',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        maxDiscount: 150,
        minOrderValue: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
    prisma.promotion.create({
      data: {
        code: 'FREEDEL',
        description: 'Free delivery on orders above ₹299',
        discountType: 'FREE_DELIVERY',
        discountValue: 40,
        minOrderValue: 299,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
    prisma.promotion.create({
      data: {
        code: 'FLAT100',
        description: 'Flat ₹100 off on orders above ₹500',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderValue: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
  ]);

  console.log('Created promotions');

  // Create sample riders
  const riders = await Promise.all([
    prisma.rider.create({
      data: {
        phone: '9876543210',
        name: 'Rajesh Kumar',
        email: 'rajesh@drop.com',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        documentVerified: true,
        policeVerified: true,
        alcoholAuthorized: true,
        vehicleType: 'BIKE',
        vehicleNumber: 'KA-01-AB-1234',
        isOnline: true,
        isAvailable: true,
        currentLat: 12.9716,
        currentLng: 77.5946,
        rating: 4.8,
        totalDeliveries: 1250,
        totalEarnings: 125000,
        assignedZone: 'Bangalore Central',
      },
    }),
    prisma.rider.create({
      data: {
        phone: '9876543211',
        name: 'Amit Singh',
        email: 'amit@drop.com',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        documentVerified: true,
        policeVerified: true,
        vehicleType: 'SCOOTER',
        vehicleNumber: 'KA-01-CD-5678',
        isOnline: true,
        isAvailable: true,
        currentLat: 12.9750,
        currentLng: 77.6066,
        rating: 4.6,
        totalDeliveries: 890,
        totalEarnings: 89000,
        assignedZone: 'Bangalore East',
      },
    }),
  ]);

  console.log('Created riders');

  // Create admin user
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.admin.create({
    data: {
      email: 'admin@drop.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Created admin user (email: admin@drop.com, password: admin123)');

  // Create zones
  await Promise.all([
    prisma.zone.create({
      data: {
        name: 'Bangalore Central',
        polygon: {
          type: 'Polygon',
          coordinates: [[[77.55, 12.95], [77.65, 12.95], [77.65, 13.0], [77.55, 13.0], [77.55, 12.95]]],
        },
        isActive: true,
        surgePricing: 1.0,
        deliveryFee: 30,
      },
    }),
    prisma.zone.create({
      data: {
        name: 'Bangalore East',
        polygon: {
          type: 'Polygon',
          coordinates: [[[77.65, 12.95], [77.75, 12.95], [77.75, 13.0], [77.65, 13.0], [77.65, 12.95]]],
        },
        isActive: true,
        surgePricing: 1.0,
        deliveryFee: 35,
      },
    }),
  ]);

  console.log('Created zones');

  // Create system config
  await Promise.all([
    prisma.systemConfig.create({
      data: {
        key: 'platform_fee_percent',
        value: 2,
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'free_delivery_threshold',
        value: 199,
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'base_delivery_fee',
        value: 40,
      },
    }),
  ]);

  console.log('Created system config');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
