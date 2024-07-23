const Event = require('../models/event');
const { Op } = require('sequelize');
const { parse } = require('querystring');

// ... (Event normalization functions)

// Controller Functions

// Get all events with pagination, sorting, and filtering
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = 'DESC', filter = {} } = req.query;
    console.log({query: req.query});
    const offset = (page - 1) * limit;

    // Convert filter query parameters to Sequelize operators
    const where = {};
    for (const [key, value] of Object.entries(filter)) {
      where[key] = { [Op.iLike]: `%${value}%` }; // Case-insensitive LIKE
    }

    const events = await Event.findAll({ where, order: [[sortBy, sortOrder]], offset, limit });
    const totalEvents = await Event.count({ where });

    res.json({
      events,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all events for a specific user
exports.getUserFootprints = async (req, res) => {
  try {
    const userId = req.params.userId;
    const events = await Event.findAll({ where: { userId } });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { source, ...eventData } = req.body; 
    let normalizedEvent;

    switch (source) {
      case 'Jira':
        normalizedEvent = normalizeJiraEvent(eventData);
        break;
      case 'Notion':
        normalizedEvent = normalizeNotionEvent(eventData);
        break;
      case 'Slack':
        normalizedEvent = normalizeSlackEvent(eventData);
        break;
      default:
        return res.status(400).json({ error: 'Invalid source' });
    }

    const createdEvent = await Event.create(normalizedEvent);
    res.status(201).json(createdEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
  try {
    const [updatedRows] = await Event.update(req.body, {
      where: { id: req.params.id }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const updatedEvent = await Event.findByPk(req.params.id);
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const deletedRows = await Event.destroy({
      where: { id: req.params.id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get aggregate statistics (e.g., event count by source)
exports.getStats = async (req, res) => {
  try {
    const stats = await Event.findAll({
      attributes: ['source', [Sequelize.fn('COUNT', 'source'), 'count']],
      group: ['source']
    });
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
