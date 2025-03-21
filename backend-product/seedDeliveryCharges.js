// backend/seedDeliveryCharges.js
const mongoose = require('mongoose');
const DeliveryCharge = require('./models/DeliveryCharge');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL);

const deliveryCharges = [
  { province: 'Western', postalCodeStart: 100, postalCodeEnd: 1599, deliveryCharge: 300 }, // Colombo
  { province: 'Western', postalCodeStart: 11000, postalCodeEnd: 12999, deliveryCharge: 300 }, // Gampaha, Kalutara
  { province: 'Central', postalCodeStart: 20000, postalCodeEnd: 22999, deliveryCharge: 400 }, // Kandy, Matale, Nuwara Eliya
  { province: 'Southern', postalCodeStart: 80000, postalCodeEnd: 82999, deliveryCharge: 450 }, // Galle, Matara, Hambantota
  { province: 'North Western', postalCodeStart: 60000, postalCodeEnd: 61999, deliveryCharge: 500 }, // Kurunegala, Puttalam
  { province: 'North Central', postalCodeStart: 50000, postalCodeEnd: 51999, deliveryCharge: 550 }, // Anuradhapura, Polonnaruwa
  { province: 'Uva', postalCodeStart: 90000, postalCodeEnd: 91999, deliveryCharge: 600 }, // Badulla, Monaragala
  { province: 'Sabaragamuwa', postalCodeStart: 70000, postalCodeEnd: 71999, deliveryCharge: 550 }, // Ratnapura, Kegalle
  { province: 'Eastern', postalCodeStart: 30000, postalCodeEnd: 32999, deliveryCharge: 650 }, // Batticaloa, Ampara
  { province: 'Eastern', postalCodeStart: 31000, postalCodeEnd: 31999, deliveryCharge: 650 }, // Trincomalee
  { province: 'Northern', postalCodeStart: 40000, postalCodeEnd: 43999, deliveryCharge: 700 }, // Jaffna, Kilinochchi, Mannar, Mullaitivu, Vavuniya
];

const seedDeliveryCharges = async () => {
  try {
    await DeliveryCharge.deleteMany(); // Clear existing data
    await DeliveryCharge.insertMany(deliveryCharges);
    console.log('Delivery charges seeded successfully');
  } catch (err) {
    console.error('Error seeding delivery charges:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDeliveryCharges();