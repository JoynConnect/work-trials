const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const eventController = require('../controllers/eventController');
const Event = require('../models/event');

jest.mock('../models/event');

const app = express();
app.use(bodyParser.json());
app.get('/events', eventController.getEvents);
app.get('/events/:id', eventController.getEventById);
app.get('/users/:userId/events', eventController.getUserFootprints);
app.post('/events', eventController.createEvent);
app.put('/events/:id', eventController.updateEvent);
app.delete('/events/:id', eventController.deleteEvent);
app.get('/stats', eventController.getStats);

describe('Event Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events', () => {
    it('should return events with pagination', async () => {
      Event.findAll.mockResolvedValue([{ id: 1, source: 'Jira', userId: 'user1', eventType: 'create', updatedAt: new Date() }]);
      Event.count.mockResolvedValue(1);

      const response = await request(app).get('/events').query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        events: [{ id: 1, source: 'Jira', userId: 'user1', eventType: 'create', updatedAt: expect.any(String) }],
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event by ID', async () => {
      Event.findByPk.mockResolvedValue({ id: 1, source: 'Jira', userId: 'user1', eventType: 'create', updatedAt: new Date() });

      const response = await request(app).get('/events/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, source: 'Jira', userId: 'user1', eventType: 'create', updatedAt: expect.any(String) });
    });

    it('should return 404 if event not found', async () => {
      Event.findByPk.mockResolvedValue(null);

      const response = await request(app).get('/events/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Event not found' });
    });
  });

  describe('GET /users/:userId/events', () => {
    it('should return all events for a specific user', async () => {
      Event.findAll.mockResolvedValue([{ id: 1, source: 'Jira', userId: 'user1', eventType: 'create', updatedAt: new Date() }]);

      const response = await request(app).get('/users/user1/events');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, source: 'Jira', userId: 'user1', eventType: 'create', updatedAt: expect.any(String) }]);
    });

    it('should return 400 for invalid source', async () => {
      const newEvent = { source: 'InvalidSource', userId: 'user1', eventType: 'create', updatedAt: new Date() };

      const response = await request(app)
        .post('/events')
        .send(newEvent);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid source' });
    });
  });

  describe('PUT /events/:id', () => {
    it('should update an existing event', async () => {
      const updatedEvent = { id: 1, source: 'Jira', userId: 'user1', eventType: 'update', updatedAt: new Date() };
      Event.update.mockResolvedValue([1]);
      Event.findByPk.mockResolvedValue(updatedEvent);

      const response = await request(app)
        .put('/events/1')
        .send(updatedEvent);

      expect(response.status).toBe(200);
    });

    it('should return 404 if event not found', async () => {
      Event.update.mockResolvedValue([0]);

      const response = await request(app)
        .put('/events/1')
        .send({ eventType: 'update' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Event not found' });
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete an event', async () => {
      Event.destroy.mockResolvedValue(1);

      const response = await request(app).delete('/events/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Event deleted successfully' });
    });

    it('should return 404 if event not found', async () => {
      Event.destroy.mockResolvedValue(0);

      const response = await request(app).delete('/events/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Event not found' });
    });
  });

  describe('GET /stats', () => {
    it('should return event statistics', async () => {
      const stats = [{ source: 'Jira', count: 10 }];
      Event.findAll.mockResolvedValue(stats);

      const response = await request(app).get('/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ stats });
    });
  });
});
