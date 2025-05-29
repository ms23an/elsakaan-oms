
const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const router = express.Router();

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customerId', 'name phone1 addresses')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    let filteredOrders = orders;
    
    if (search) {
      filteredOrders = orders.filter(order => {
        const customer = order.customerId;
        return (
          order._id.toString().includes(search) ||
          order.trackingCode?.toLowerCase().includes(search.toLowerCase()) ||
          customer?.name.toLowerCase().includes(search.toLowerCase()) ||
          order.items.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
        );
      });
    }
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders: filteredOrders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('totalPrice').isNumeric().withMessage('Total price must be a number'),
  body('shippingCost').isNumeric().withMessage('Shipping cost must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verify customer exists
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const order = new Order(req.body);
    
    // Generate tracking code if status is not pending
    if (order.status !== 'pending') {
      order.trackingCode = `TRK${Math.floor(Math.random() * 10000)}`;
    }
    
    const savedOrder = await order.save();
    
    // Add order to customer's orders array
    customer.orders.push(savedOrder._id);
    await customer.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id - Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate tracking code if status changed from pending
    if (req.body.status && req.body.status !== 'pending' && !order.trackingCode) {
      req.body.trackingCode = `TRK${Math.floor(Math.random() * 10000)}`;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId');
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Remove order from customer's orders array
    await Customer.findByIdAndUpdate(
      order.customerId,
      { $pull: { orders: order._id } }
    );
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
