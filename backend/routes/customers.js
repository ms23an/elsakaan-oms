
const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const router = express.Router();

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone1: { $regex: search } },
          { phone2: { $regex: search } },
          { 'addresses.address': { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const customers = await Customer.find(query)
      .populate('orders')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Customer.countDocuments(query);
    
    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('orders');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/customers - Create new customer
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone1').notEmpty().withMessage('Phone number is required'),
  body('addresses').isArray({ min: 1 }).withMessage('At least one address is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Phone number already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
