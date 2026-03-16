const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Contact = require('../models/Contact');

// GET /api/contacts/check - Health check for DB
router.get('/check', async (req, res) => {
  const status = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    status: states[status] || 'Unknown',
    mongodb: process.env.MONGODB_URI,
    port: process.env.PORT || 5000,
  });
});

// POST /api/contacts/seed - Seed sample data for testing
router.post('/seed', async (req, res, next) => {
  try {
    const samples = [
      { name: 'Admin User', email: 'admin@connectflow.com', phone: '000-000-0000', address: 'Tech City, CA', isFavorite: true },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '123-456-7890', address: 'London, UK', isFavorite: false },
      { name: 'John Doe', email: 'john@example.com', phone: '987-654-3210', address: 'New York, USA', isFavorite: true },
    ];
    await Contact.insertMany(samples);
    res.json({ message: 'Sample data seeded successfully', count: samples.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - Create a contact
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, email, address, isFavorite, profilePictureUrl } = req.body;
    let contact = new Contact({ name, phone, email, address, isFavorite, profilePictureUrl });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// GET /api/contacts - Fetch all contacts with search parameter
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const contacts = await Contact.find(query).sort({ name: 1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:id - Fetch a single contact
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:id - Update contact details
router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, email, address, isFavorite, profilePictureUrl } = req.body;
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    contact.name = name;
    contact.phone = phone;
    contact.email = email;
    contact.address = address;
    contact.isFavorite = isFavorite;
    contact.profilePictureUrl = profilePictureUrl;
    
    await contact.save();
    res.json(contact);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// PATCH /api/contacts/:id/favorite - Toggle the isFavorite status
router.patch('/:id/favorite', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    contact.isFavorite = !contact.isFavorite;
    await contact.save();
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:id - Remove a contact
router.delete('/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
