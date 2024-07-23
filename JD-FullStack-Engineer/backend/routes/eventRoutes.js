const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController'); 

// GET all events (with pagination, sorting, filtering)
router.get('/events', eventController.getEvents);

// GET a single event by ID
router.get('/events/:id', eventController.getEventById);

// GET all events for a specific user
router.get('/users/:userId/events', eventController.getUserFootprints);

// POST a new event
router.post('/events', eventController.createEvent);

// PUT (update) an existing event
router.put('/events/:id', eventController.updateEvent);

// DELETE an event
router.delete('/events/:id', eventController.deleteEvent);

// GET aggregated statistics
router.get('/stats', eventController.getStats);

module.exports = router;
