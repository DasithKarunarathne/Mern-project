import mongoose from 'mongoose';
import DeliveryCharge from './models/productmodel/DeliveryCharge.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URL = 'mongodb+srv://admin:admin123@cluster0.aqvxpxj.mongodb.net/handicraft?retryWrites=true&w=majority';

const seedDeliveryCharges = async () => {
  try {
    // Connect to MongoDB with additional options
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await DeliveryCharge.deleteMany();
    console.log('Cleared existing delivery charges');

    // Seed new data
    const deliveryCharges = [
      { province: 'Western', postalCodeStart: 100, postalCodeEnd: 1599, deliveryCharge: 300 },
      { province: 'Western', postalCodeStart: 11000, postalCodeEnd: 12999, deliveryCharge: 300 },
      { province: 'Central', postalCodeStart: 20000, postalCodeEnd: 22999, deliveryCharge: 400 },
      { province: 'Southern', postalCodeStart: 80000, postalCodeEnd: 82999, deliveryCharge: 450 },
      { province: 'North Western', postalCodeStart: 60000, postalCodeEnd: 61999, deliveryCharge: 500 },
      { province: 'North Central', postalCodeStart: 50000, postalCodeEnd: 51999, deliveryCharge: 550 },
      { province: 'Uva', postalCodeStart: 90000, postalCodeEnd: 91999, deliveryCharge: 600 },
      { province: 'Sabaragamuwa', postalCodeStart: 70000, postalCodeEnd: 71999, deliveryCharge: 550 },
      { province: 'Eastern', postalCodeStart: 30000, postalCodeEnd: 32999, deliveryCharge: 650 },
      { province: 'Eastern', postalCodeStart: 31000, postalCodeEnd: 31999, deliveryCharge: 650 },
      { province: 'Northern', postalCodeStart: 40000, postalCodeEnd: 43999, deliveryCharge: 700 },
    ];

    await DeliveryCharge.insertMany(deliveryCharges);
    console.log('Delivery charges seeded successfully');
  } catch (err) {
    console.error('Error seeding delivery charges:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDeliveryCharges();