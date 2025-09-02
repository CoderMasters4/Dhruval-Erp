const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB using the same URI as the server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  fullName: String,
  isSuperAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  companyAccess: [{
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    role: String,
    isActive: { type: Boolean, default: true }
  }],
  preferences: {
    dashboard: {
      defaultCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
    }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function testUser() {
  try {
    console.log('🔍 Checking for superadmin user...');
    console.log('📊 Using database:', process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB');
    
    const user = await User.findOne({ username: 'superadmin' });
    
    if (user) {
      console.log('✅ User found:', {
        username: user.username,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        hasPassword: !!user.password
      });
      
      // Test password comparison
      const isPasswordValid = await bcrypt.compare('admin123', user.password);
      console.log('🔐 Password test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
      // Test with wrong password
      const isWrongPasswordValid = await bcrypt.compare('wrongpassword', user.password);
      console.log('🔐 Wrong password test:', isWrongPasswordValid ? '❌ Should be invalid' : '✅ Correctly invalid');
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error testing user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testUser();
