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

async function updatePassword() {
  try {
    console.log('🔍 Finding superadmin user...');
    
    const user = await User.findOne({ username: 'superadmin' });
    
    if (user) {
      console.log('✅ User found:', {
        username: user.username,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive
      });
      
      // Hash new password
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('✅ Password updated successfully');
      console.log('📝 New credentials:');
      console.log('   Username: superadmin');
      console.log('   Password: admin123');
      console.log('   Email:', user.email);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updatePassword();
