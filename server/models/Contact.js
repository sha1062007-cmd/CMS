const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  address: {
    type: String,
    default: '',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  profilePictureUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Pre-save hook to handle avatars
contactSchema.pre('save', async function() {
  // Only override if profilePictureUrl is missing or just whitespace
  if (!this.profilePictureUrl || String(this.profilePictureUrl).trim() === '') {
    this.profilePictureUrl = `https://ui-avatars.com/api/?background=random&color=fff&size=128&rounded=true&name=${encodeURIComponent(this.name)}`;
  }
});

module.exports = mongoose.model('Contact', contactSchema);
