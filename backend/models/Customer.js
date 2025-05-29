
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone1: {
    type: String,
    required: true,
    unique: true
  },
  phone2: {
    type: String,
    default: null
  },
  addresses: [addressSchema],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
