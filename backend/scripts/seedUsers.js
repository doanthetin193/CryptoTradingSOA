require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Seed Sample Users Script
 * Tạo một số users mẫu cho hệ thống
 */

const MONGODB_URI = process.env.USER_DB_URI;

// Sample users
const SAMPLE_USERS = [
    {
        email: 'nguyenvana@gmail.com',
        password: '123456',
        fullName: 'Nguyễn Văn A',
        balance: 1500,
    },
    {
        email: 'tranthib@gmail.com',
        password: '123456',
        fullName: 'Trần Thị B',
        balance: 2000,
    },
    {
        email: 'levanc@gmail.com',
        password: '123456',
        fullName: 'Lê Văn C',
        balance: 800,
    },
    {
        email: 'phamthid@gmail.com',
        password: '123456',
        fullName: 'Phạm Thị D',
        balance: 3000,
    },
    {
        email: 'hoangvane@gmail.com',
        password: '123456',
        fullName: 'Hoàng Văn E',
        balance: 1000,
    },
];

// User Schema
const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        balance: { type: Number, default: 1000 },
        isActive: { type: Boolean, default: true },
        balanceHistory: [
            {
                amount: Number,
                type: { type: String, enum: ['deposit', 'withdraw', 'trade', 'initial', 'admin'] },
                description: String,
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

async function seedUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        let created = 0;
        let skipped = 0;

        for (const userData of SAMPLE_USERS) {
            const existing = await User.findOne({ email: userData.email });

            if (existing) {
                console.log(`⚠️  ${userData.email} - Already exists, skipped`);
                skipped++;
                continue;
            }

            await User.create({
                ...userData,
                role: 'user',
                isActive: true,
                balanceHistory: [
                    {
                        amount: userData.balance,
                        type: 'initial',
                        description: 'Initial balance',
                        timestamp: new Date(),
                    },
                ],
            });

            console.log(`✅ ${userData.email} - Created (${userData.fullName})`);
            created++;
        }

        console.log('\n═══════════════════════════════════════');
        console.log(`🎉 Seed completed!`);
        console.log(`   Created: ${created} users`);
        console.log(`   Skipped: ${skipped} users (already exist)`);
        console.log('═══════════════════════════════════════');
        console.log('\n📝 All passwords: 123456');
        console.log('🔗 Login URL: http://localhost:5173/auth\n');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedUsers();
