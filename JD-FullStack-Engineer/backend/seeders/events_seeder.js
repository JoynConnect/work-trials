'use strict';
const { v4: UUIDV4 } = require('uuid');
const jiraData = require('../../dataGen/jiraData.json');
const notionData = require('../../dataGen/notionData.json');
const slackData = require('../../dataGen/slackData.json');

// Function to normalize event data based on the source
async function normalizeEvent(event, source) {
  switch (source) {
    case 'Jira':
      return {
        id: UUIDV4(),
        source: source,
        timestamp: new Date(event.updated || event.created),
        userId: event.assignee.emailAddress,
        eventType: event.status.name || 'issue_updated',
        eventData: JSON.stringify(event), // You might want to select specific fields
        createdAt: new Date(),
        updatedAt: new Date()
      };
    case 'Notion':
      return {
        id: UUIDV4(),
        source: source,
        timestamp: event.last_edited_time || event.created_time,
        userId: event.properties.Assignee.people[0].email,
        eventType: event.properties.Status.select.name || 'page_updated',
        eventData: JSON.stringify(event.properties), // Or select specific properties
        createdAt: new Date(),
        updatedAt: new Date()
      };
    case 'Slack':
      return {
        id: UUIDV4(),
        source: source,
        timestamp: new Date(parseFloat(event.ts)).toISOString(), // Convert Slack timestamp
        userId: event.user,
        eventType: event.type,
        eventData: JSON.stringify({ text: event.text }), // You could include more Slack data
        createdAt: new Date(),
        updatedAt: new Date()
      };
  }
}

// Sequelize seeding function
module.exports = {
  up: async (queryInterface) => {
    try {

      // Normalize and seed each data type
      for (const event of jiraData) {
        const normalizedEvent = await normalizeEvent(event, 'Jira');
        await queryInterface.bulkInsert('Events', [normalizedEvent], {});
      }

      for (const event of notionData) {
        const normalizedEvent = await normalizeEvent(event, 'Notion');
        await queryInterface.bulkInsert('Events', [normalizedEvent], {});
      }

      for (const event of slackData) {
        const normalizedEvent = await normalizeEvent(event, 'Slack');
        await queryInterface.bulkInsert('Events', [normalizedEvent], {});
      }
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Events', null, {});
  }
};
