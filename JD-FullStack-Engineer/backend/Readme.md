# The backend server for unifying data to trace user footprint

# Dependency installation

```
npm install
```

# Docker compose

```
docker-compose up -d -f docker-compose.yml
```

# Steps to run the server
  - Make sure you already generated the fake data in `dataGen` directory.
  - Run `npm run seeders-up` for insert seed data to db.
  - Run `npm start` to run the server
  