const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
    } catch (error) {
        console.warn(`Atlas DB Connection Failed: ${error.message}`);
        console.log(`Starting isolated in-memory MongoDB Server for smooth development...`);
        try {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            console.log(`MongoDB Connected (Memory): ${mongoUri}`);
            
            const User = require('../models/User');
            await User.create({
                name: 'System Admin',
                email: 'admin@ca.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Seeded mock admin user: admin@ca.com / admin123');
        } catch (memError) {
             console.error(`Memory DB failed: ${memError}`);
             process.exit(1);
        }
    }
};

module.exports = connectDB;
