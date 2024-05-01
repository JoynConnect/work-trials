import { Sequelize, DataTypes } from 'sequelize';

const db = new Sequelize({dialect: 'sqlite', storage: 'storage.db'});


const StatusDistribution = db.define(
  'StatusDistribution',
  {
    scope: DataTypes.STRING,
    unresolved: DataTypes.INTEGER,
    resolved: DataTypes.INTEGER,
  },
  {
      tableName: 'status_distribution',
      timestamps: false,
  },
);
StatusDistribution.removeAttribute('id');

const CompletedTasksByDate = db.define(
  'CompletedTasksByDate',
  {
    date: DataTypes.STRING,
    assignee: DataTypes.STRING,
    count: DataTypes.INTEGER,
  },
  {
      tableName: 'completed_by_date',
      timestamps: false,
  },
);

CompletedTasksByDate.removeAttribute('id');

export {
    StatusDistribution,
    CompletedTasksByDate,
};

