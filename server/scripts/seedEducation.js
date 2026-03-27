import mongoose from 'mongoose';
import dns from 'dns';
import { MONGO_URI } from '../src/config/env.js';
import Citizen from '../src/models/Citizen.js';
import EducationRecord from '../src/models/EducationRecord.js';

// Example command (run from the project root so it finds the .env file):
// node server/scripts/seedEducation.js "[EMAIL_ADDRESS]"

const seedEducationData = async () => {
  try {
    const userEmail = process.argv[2];

    if (!userEmail) {
      console.error('Please provide a user email. Example: node server/scripts/seedEducation.js user@example.com');
      process.exit(1);
    }

    // Bypass local resolver issues
    dns.setServers(["8.8.8.8"]);

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    const citizen = await Citizen.findOne({ email: userEmail });

    if (!citizen) {
      console.error(`Citizen with email ${userEmail} not found.`);
      process.exit(1);
    }

    console.log(`Found citizen: ${citizen.name} (${citizen._id})`);

    // Remove existing records first to avoid duplicates (optional, but good for testing)
    await EducationRecord.deleteMany({ citizenId: citizen._id });
    console.log('Cleared existing education records for this user.');

    const dummyData = [
      {
        citizenId: citizen._id,
        qualification: 'Secondary',
        degreeName: 'SSC - Science',
        institution: 'Dhaka Residential Model College',
        passingYear: 2018,
      },
      {
        citizenId: citizen._id,
        qualification: 'Higher Secondary',
        degreeName: 'HSC - Science',
        institution: 'Notre Dame College',
        passingYear: 2020,
      },
      {
        citizenId: citizen._id,
        qualification: 'Bachelors',
        degreeName: 'BSc in Computer Science and Engineering',
        institution: 'BRAC University',
        passingYear: 2024,
      },
    ];

    await EducationRecord.insertMany(dummyData);
    console.log(`Successfully added ${dummyData.length} records for ${citizen.name}.`);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedEducationData();
