require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const ParkingLot = require('./models/ParkingLot');
const Slot = require('./models/Slot');

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await ParkingLot.deleteMany({});
    await Slot.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Owner
    console.log('👤 Creating owner...');
    const owner = await User.create({
      name: 'John Doe',
      email: 'owner@example.com',
      password: 'password123',
      role: 'OWNER',
      phone: '+1234567890',
    });
    console.log(`✅ Owner created: ${owner.email} (ID: ${owner._id})\n`);

    // Create Customer
    console.log('👤 Creating customer...');
    const customer = await User.create({
      name: 'Jane Smith',
      email: 'customer@example.com',
      password: 'password123',
      role: 'CUSTOMER',
      phone: '+0987654321',
    });
    console.log(`✅ Customer created: ${customer.email} (ID: ${customer._id})\n`);

    // Create Parking Lot
    console.log('🏢 Creating parking lot...');
    const parkingLot = await ParkingLot.create({
      ownerId: owner._id,
      name: 'Downtown Parking Plaza',
      address: '123 Main Street, City Center',
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco coordinates [longitude, latitude]
      },
      pricePerHour: 5.00,
      totalSlots: 10,
      availableSlots: 10,
      mode: 'MANUAL',
      isActive: true,
    });
    console.log(`✅ Parking lot created: ${parkingLot.name} (ID: ${parkingLot._id})\n`);

    // Create Slots
    console.log('🅿️  Creating parking slots...');
    const slots = [];
    for (let i = 1; i <= 10; i++) {
      const slot = await Slot.create({
        parkingLotId: parkingLot._id,
        slotNumber: `A${i.toString().padStart(2, '0')}`,
        isOccupied: false,
        lastUpdated: new Date(),
      });
      slots.push(slot);
    }
    console.log(`✅ Created ${slots.length} parking slots\n`);

    // Update parking lot available slots
    parkingLot.availableSlots = slots.length;
    await parkingLot.save();

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: 2 (1 Owner, 1 Customer)`);
    console.log(`   - Parking Lots: 1`);
    console.log(`   - Slots: ${slots.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Owner:');
    console.log(`     Email: ${owner.email}`);
    console.log('     Password: password123');
    console.log('   Customer:');
    console.log(`     Email: ${customer.email}`);
    console.log('     Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
