const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

mongoose.connect('mongodb+srv://mahaashri:mahaashri%40123@e-learning-platform.wx1swy3.mongodb.net/elearning?retryWrites=true&w=majority').then(async () => {
  await Admin.deleteMany({}); // optional, to clear old data

  const admins = [
    { name: 'admin1', email: 'admin1@gmail.com', password: await bcrypt.hash('admin1', 10) },
    { name: 'admin2', email: 'admin2@gmail.com', password: await bcrypt.hash('admin2', 10) }
  ];

  await Admin.insertMany(admins);
  console.log('✅ Admins seeded with hashed passwords');
  mongoose.disconnect();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
