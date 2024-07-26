const Event = require('../models/event');
const { Op, Sequelize } = require('sequelize');

// Utility function to build the where clause for filtering
const buildWhereClause = (filter) => {
  const where = { [Op.and]: [] };

  if (filter.source) where[Op.and].push({ source: { [Op.eq]: filter.source } });
  if (filter.userId) where[Op.and].push({ userId: { [Op.iLike]: `%${filter.userId}%` } });
  if (filter.eventType) where[Op.and].push({ eventType: { [Op.iLike]: `%${filter.eventType}%` } });
  if (filter.startDate) where[Op.and].push({ updatedAt: { [Op.gte]: filter.startDate } });
  if (filter.endDate) where[Op.and].push({ updatedAt: { [Op.lte]: filter.endDate } });

  return where;
};

// Controller Functions

// Get all events with pagination, sorting, and filtering
exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'DESC',
      filter = {}
    } = req.query;
    const offset = (page - 1) * limit;

    const where = buildWhereClause(filter);

    const events = await Event.findAll({
      where,
      order: [[sortBy, sortOrder]],
      offset,
      limit
    });
    const totalEvents = await Event.count({ where });

    res.json({
      events,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: parseInt(page)
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
    const { userId } = req.params;
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Event.update(req.body, { where: { id } });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updatedEvent = await Event.findByPk(id);
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Event.destroy({ where: { id } });

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
    const { filter = {} } = req.query;
    const where = buildWhereClause(filter);

    const attributes = filter.source
      ? ['eventType', [Sequelize.fn('COUNT', 'eventType'), 'count']]
      : ['source', [Sequelize.fn('COUNT', 'source'), 'count']];

    const group = filter.source ? ['eventType'] : ['source'];

    const stats = await Event.findAll({ attributes, group, where });

    res.json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};