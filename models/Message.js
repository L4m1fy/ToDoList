const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isBot: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

messageSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.content = CryptoJS.AES.encrypt(
      this.content,
      process.env.ENCRYPTION_KEY
    ).toString();
  }
  next();
});

messageSchema.methods.decryptContent = function() {
  const bytes = CryptoJS.AES.decrypt(this.content, process.env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = mongoose.model('Message', messageSchema);
