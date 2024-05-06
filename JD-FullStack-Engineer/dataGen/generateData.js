const { faker } = require("@faker-js/faker");
const fs = require("fs");

// Generate data
let people = [];

function generateNotionData(count = 100) {
  const data = [];
  for (let i = 0; i < count; i++) {
    const person = people[i % people.length];
    data.push({
      object: "page",
      id: faker.string.uuid(),
      created_time: faker.date.past({ years: 1 }).toISOString(),
      last_edited_time: faker.date.recent({ days: 10 }).toISOString(),
      properties: {
        Name: {
          title: [{ text: { content: faker.company.buzzPhrase() } }],
        },
        Status: {
          select: {
            name: faker.helpers.arrayElement([
              "Not Started",
              "In Progress",
              "Completed",
            ]),
          },
        },
        Priority: {
          select: {
            name: faker.helpers.arrayElement(["High", "Medium", "Low"]),
          },
        },
        Assignee: {
          people: [
            { name: person.fullName, email: person.email },
          ],
        },
      },
    });
  }
  return data;
}

function generateJiraData(count = 100) {
  const data = [];
  for (let i = 0; i < count; i++) {
    const person = people[i % people.length];
    data.push({
      id: `JIRA-${i}`,
      created: faker.date.past({ years: 2 }).toISOString(),
      updated: faker.date.recent({ days: 30 }).toISOString(),
      status: {
        name: faker.helpers.arrayElement(["Open", "In Review", "Closed"]),
      },
      assignee: {
        displayName: person.fullName,
        emailAddress: person.email,
      },
      priority: {
        name: faker.helpers.arrayElement([
          "Highest",
          "High",
          "Medium",
          "Low",
          "Lowest",
        ]),
      },
      summary: faker.lorem.sentence(),
    });
  }
  return data;
}

function generateSlackData(count = 100) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      type: "message",
      user: `U${faker.string.hexadecimal({ length: 8 }).slice(2)}`, // Corrected method for hexadecimal
      text: faker.lorem.sentence(),
      ts: `${faker.date.recent({ days: 50 }).getTime()}.000${faker.number.int({
        min: 0,
        max: 1000,
      })}`, // Corrected method for generating integers
      channel: `C${faker.string.hexadecimal({ length: 8 }).slice(2)}`, // Corrected method for hexadecimal
    });
  }
  return data;
}


fs.readFile('people.json', (er, data) => {
  people = JSON.parse(data);
  const notionData = generateNotionData(15000); // Generates 150 entries for Notion
  const jiraData = generateJiraData(15880); // Generates 150 entries for Jira
  const slackData = generateSlackData(23150); // Generates 150 entries for Slack
  // Save to files
  fs.writeFile("../solution/raw_data/notionData.json", JSON.stringify(notionData, null, 2), (err) => {
    if (err) throw err;
    console.log("Saved Notion data to notionData.json");
  });

  fs.writeFile("../solution/raw_data/jiraData.json", JSON.stringify(jiraData, null, 2), (err) => {
    if (err) throw err;
    console.log("Saved Jira data to jiraData.json");
  });

  fs.writeFile("../solution/raw_data/slackData.json", JSON.stringify(slackData, null, 2), (err) => {
    if (err) throw err;
    console.log("Saved Slack data to slackData.json");
  });
});


