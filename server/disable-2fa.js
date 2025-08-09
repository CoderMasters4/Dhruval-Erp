const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const TwoFactor = require('./dist/models/TwoFactor').default;
const User = require('./dist/models/User').default;

async function disable2FA() {
  try {
    console.log('Finding user...');
    const user = await User.findOne({ 
      $or: [
        { username: 'superadmin@testcompany.com' },
        { 'personalInfo.email': 'superadmin@testcompany.com' }
      ]
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.username, user._id);
    
    // Find and disable 2FA
    const twoFactor = await TwoFactor.findOne({ userId: user._id });
    if (twoFactor) {
      console.log('2FA found, disabling...');
      twoFactor.isEnabled = false;
      await twoFactor.save();
      console.log('2FA disabled successfully');
    } else {
      console.log('No 2FA found for user');
    }
    
    // Also check user's password
    console.log('User password hash:', user.password ? 'exists' : 'missing');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

disable2FA();
