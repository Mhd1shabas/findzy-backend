const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user');

const DEFAULT_WHATSAPP = "9846809652";

async function migrateWhatsapp() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Find users where whatsappNumber is null, undefined, or empty
    // OR potentially where the older 'whatsapp' field is missing
    const users = await User.find({
      $or: [
        { whatsappNumber: { $exists: false } },
        { whatsappNumber: null },
        { whatsappNumber: "" }
      ]
    });

    console.log(`Found ${users.length} users requiring WhatsApp update.`);

    let updatedCount = 0;
    for (const user of users) {
      // Rule: Do NOT overwrite if they already have one (handled by query, but extra check)
      if (!user.whatsappNumber) {
          user.whatsappNumber = DEFAULT_WHATSAPP;
          
          // If the older 'whatsapp' field is also empty, update it too for system compatibility
          if (!user.whatsapp) {
              user.whatsapp = DEFAULT_WHATSAPP;
          }
          
          await user.save();
          console.log(`- Updated: ${user.name} (${user.email}) -> ${DEFAULT_WHATSAPP}`);
          updatedCount++;
      }
    }

    console.log(`\n✅ Migration Complete!`);
    console.log(`Total Users Updated: ${updatedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateWhatsapp();
