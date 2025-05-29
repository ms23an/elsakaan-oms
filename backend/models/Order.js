
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const orderCommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingCode: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  comments: [orderCommentSchema]
}, {
  timestamps: true
});

// Calculate totalAmount before saving
orderSchema.pre('save', function(next) {
  this.totalAmount = this.totalPrice + this.shippingCost;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
