const mongoose = require('mongoose');
require('dotenv').config();

const Service = require('./src/models/service');
const User = require('./src/models/user');

async function fixPaths() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. Fix Services
    const services = await Service.find({});
    console.log(`Found ${services.length} services.`);
    let updatedServiceCount = 0;

    for (const service of services) {
      let changed = false;
      const newImages = (service.serviceImages || []).map(img => {
        if (typeof img === 'string' && (img.includes('localhost') || img.includes('onrender.com'))) {
          changed = true;
          const match = img.match(/\/uploads\/(.+)$/);
          return match ? `/uploads/${match[1]}` : img;
        }
        return img;
      });

      if (changed) {
        service.serviceImages = newImages;
        await service.save();
        updatedServiceCount++;
      }
    }

    // 2. Fix Users
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    let updatedUserCount = 0;

    for (const user of users) {
      let changed = false;
      const newPhotos = (user.photos || []).map(img => {
        if (typeof img === 'string' && (img.includes('localhost') || img.includes('onrender.com'))) {
          changed = true;
          const match = img.match(/\/uploads\/(.+)$/);
          return match ? `/uploads/${match[1]}` : img;
        }
        return img;
      });

      if (changed) {
        user.photos = newPhotos;
        await user.save();
        updatedUserCount++;
      }
    }

    console.log(`Done. Updated ${updatedServiceCount} services and ${updatedUserCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing paths:', err);
    process.exit(1);
  }
}

fixPaths();
