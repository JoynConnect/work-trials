const { faker } = require("@faker-js/faker");
const fs = require("fs");

function generatePeople(count = 100) {
    const people = [];
    for (let i = 0; i < count; i++) {
        people.push({
            fullName: faker.person.fullName(),
            email: faker.internet.email()
        });
    }

    return people;
}

const people = generatePeople();
fs.writeFile("people.json", JSON.stringify(people, null, 2), (err) => {
  if (err) throw err;
  console.log("Saved data to people.json");
});
