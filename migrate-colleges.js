const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user');
const Service = require('./src/models/service');

const COLLEGES_TO_ASSIGN = ["CEV", "CET", "KMCT"];

async function migrateColleges() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. Find all users without a college
    const users = await User.find({
      $or: [
        { college: { $exists: false } },
        { college: null },
        { college: "" }
      ]
    });

    console.log(`Found ${users.length} users with missing college info.`);

    let updatedCount = 0;
    for (const user of users) {
      // Pick random college
      const randomCollege = COLLEGES_TO_ASSIGN[Math.floor(Math.random() * COLLEGES_TO_ASSIGN.length)];
      
      // Update User
      user.college = randomCollege;
      // Also potentially update university if it's missing to keep it in sync
      if (!user.university) user.university = randomCollege;
      
      await user.save();

      // IMPORTANT: Update all services belonging to this user
      // We also update services that have missing college field
      const result = await Service.updateMany(
        { provider: user._id },
        { $set: { college: randomCollege } }
      );

      console.log(`- Updated User: ${user.name} (${user.email}) -> ${randomCollege}. (${result.modifiedCount} services updated)`);
      updatedCount++;
    }

    // 2. Final sweep: If any services are still missing college but have a provider with one
    console.log('Performing final sweep for services...');
    const allServices = await Service.find({
        $or: [
          { college: { $exists: false } },
          { college: null },
          { college: "" }
        ]
    }).populate('provider', 'college');

    let orphanedServiceCount = 0;
    for (const service of allServices) {
        if (service.provider && service.provider.college) {
            service.college = service.provider.college;
            await service.save();
            orphanedServiceCount++;
        }
    }

    console.log(`\n✅ Migration Complete!`);
    console.log(`Total Users Updated: ${updatedCount}`);
    console.log(`Orphaned Services Fixed: ${orphanedServiceCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateColleges();
