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
