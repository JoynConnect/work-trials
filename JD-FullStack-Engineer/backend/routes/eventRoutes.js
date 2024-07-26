const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController'); 

// GET all events (with pagination, sorting, filtering)
router.get('/events', eventController.getEvents);

// GET a single event by ID
router.get('/events/:id', eventController.getEventById);

// GET all events for a specific user
router.get('/users/:userId/events', eventController.getUserFootprints);

// GET aggregated statistics
router.get('/stats', eventController.getStats);

module.exports = router;
