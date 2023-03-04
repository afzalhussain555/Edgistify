const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: "+05:30"
});

const User = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  fullName: Sequelize.STRING,
});

const Quiz = sequelize.define('Quiz', {
  quiz_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quiz_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url : {
    type : DataTypes.STRING,
    allowNull: false,
  }
});

const Question = sequelize.define('Question', {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_position: {
    type: DataTypes.INTEGER,   
  },
  question_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  question_type: {
    type: DataTypes.ENUM(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']),
    allowNull: false,
    field: 'description',
  }
 
});

const Option = sequelize.define('Option', {
  option_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  option_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
});


User.hasMany(Quiz, {
  foreignKey: 'createdBy', 
  onDelete: 'CASCADE'
});

// Each Quiz belongs to one User
Quiz.belongsTo(User, {
  foreignKey: 'createdBy', // the foreign key in the Quiz model referencing the User model
  onDelete: 'CASCADE', // if a User is deleted, the associated Quiz should be deleted as well
});

Quiz.hasMany(Question, { 
  foreignKey: 'quiz_id',
  onDelete: 'CASCADE', 
});
Question.belongsTo(Quiz);

Question.hasMany(Option, { 
  foreignKey: 'question_id',
  onDelete: 'CASCADE', 
});

Option.belongsTo(Question);

module.exports = { sequelize, Quiz, User, Question,Option };