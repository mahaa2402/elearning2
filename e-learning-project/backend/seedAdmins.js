const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
require('dotenv').config(); // Load .env

(async () => {
  try {
    // Connect to MongoDB using .env
    await mongoose.connect(process.env.MONGO_URI);

    await Admin.deleteMany({}); // optional, clears old data

    const admins = [
      {
        name: process.env.ADMIN1_NAME,
        email: process.env.ADMIN1_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN1_PASSWORD, 10),
      },
      {
        name: process.env.ADMIN2_NAME,
        email: process.env.ADMIN2_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN2_PASSWORD, 10),
      }
    ];

    await Admin.insertMany(admins);
    console.log('✅ Admins seeded with hashed passwords');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  } finally {
    await mongoose.disconnect();
  }
})();
