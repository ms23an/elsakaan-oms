
const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// GET /api/shipments - Get all shipments (orders with status shipped or delivered)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = {
      status: { $in: ['shipped', 'delivered'] }
    };
    
    const shipments = await Order.find(query)
      .populate('customerId', 'name phone1 addresses')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });
    
    let filteredShipments = shipments;
    
    if (search) {
      filteredShipments = shipments.filter(shipment => {
        const customer = shipment.customerId;
        return (
          shipment._id.toString().includes(search) ||
          shipment.trackingCode?.toLowerCase().includes(search.toLowerCase()) ||
          customer?.name.toLowerCase().includes(search.toLowerCase()) ||
          customer?.phone1.includes(search) ||
          customer?.addresses.some(addr => addr.address.toLowerCase().includes(search.toLowerCase()))
        );
      });
    }
    
    const total = await Order.countDocuments(query);
    
    res.json({
      shipments: filteredShipments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shipments/:id - Get shipment by ID
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Order.findById(req.params.id).populate('customerId');
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Only return if it's actually a shipment (shipped or delivered)
    if (!['shipped', 'delivered'].includes(shipment.status)) {
      return res.status(404).json({ message: 'This order is not a shipment yet' });
    }
    
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/shipments/:id/status - Update shipment status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid shipment status' });
    }
    
    const shipment = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('customerId');
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
