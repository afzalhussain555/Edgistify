const express = require('express');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const passport = require('passport');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize, Quiz, User, Question, Option } = require('./models');
var cors = require('cors');
const crypto = require('crypto');


const app = express();
app.use(cors())
const PORT = process.env.PORT || 3001;

const passportJWT = require('passport-jwt');
const { Strategy: JWTStrategy, ExtractJwt } = passportJWT;


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JWTStrategy(jwtOptions, (payload, done) => {
    User.findByPk(payload.userId)
      .then((user) => {
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      })
      .catch((error) => {
        done(error, false);
      });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Configuring middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

function generateRandomCode() {
  // Generate a random 32-bit integer
  const randomInt = crypto.randomInt(0, Math.pow(2, 32));

  // Convert the integer to a 6-character hexadecimal string
  const hexString = randomInt.toString(16).padEnd(6, '0');

  return hexString.slice(0, 6);
}

// Defining routes
app.post('/register', async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user object
    const user = await User.create({
      username,
      fullName,
      password: bcrypt.hashSync(password, 10),
    });

    // Create a JWT token for the user
    const token = jwt.sign({ userId: user.id, username: username, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the user and token as response
    return res.json({ token });
  } catch (error) {
    console.error('Error creating user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if password is correct
    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Create a JWT token for the user
    const token = jwt.sign({ userId: user.id, username: username, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the user and token as response
    return res.json({ user, token });
  } catch (error) {
    console.error('Error logging in user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/quiz', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { quiz_title, questions } = req.body;
    // console.log(quiz_title);
    // console.log(questions);

    const created_quiz = await Quiz.create({
      createdBy: req.user.id,
      quiz_title,
      url: generateRandomCode(),
      // createdBy: req.user.id, // use the authenticated user's ID as the createdBy value
    });
    let question_position = 1;
    for (const question of questions) {

      let createrd_question = await Question.create({
        question_title: question.question_title,
        question_type: question.question_type,
        quiz_id: created_quiz.quiz_id,
        question_position: question_position
      })

      let dbOptionObjects = [];

      for (const opt of question.options) {
        dbOptionObjects.push({
          option_title: opt.option_title,
          is_correct: opt.is_correct,
          question_id: createrd_question.question_id,
        });
      }

      await Option.bulkCreate(dbOptionObjects);
      question_position++;
    }

    await t.commit();
    res.json(Quiz);

  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).send('Server Error');
  }
});


app.get('/quiz', async (req, res) => {
  const { url } = req.query;
  try {
    console.log("url", url);
    let whereClause = {}
    if (url) whereClause.url = url;
    const quizs = await Quiz.findAll({
      where: whereClause,
      attributes: ['quiz_title', 'url'],
      include: [
        {
          model: Question,
          // as: 'questions',
          attributes: ['question_id', 'question_title', 'question_type', 'question_position'],
          include: {
            model: Option,
            // as: 'options',
            attributes: ['option_id', 'option_title'],
          },
        },
      ],
    })

    res.json(quizs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.get('/user_quiz', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // const { url } = req.query;
  try {

    const quizs = await Quiz.findAll({
      where: { createdBy: req.user.id },
      include: [
        {
          model: Question,
          // as: 'questions',
          attributes: ['question_id', 'question_title', 'question_type'],
          include: {
            model: Option,
            // as: 'options',
            attributes: ['option_id', 'option_title', 'is_correct'],
          },
        },
      ],
    })

    res.json(quizs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/quiz', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { quiz_id } = req.query;
  try {
    if (!quiz_id) {
      res.status(400).send("Quiz Id is required")
      return;
    }

    const quizs = await Quiz.destroy({
      where: { createdBy: req.user.id, quiz_id: quiz_id }
    })

    res.json(quizs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  a.sort();
  b.sort();

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

app.post('/submit', async (req, res) => {
  const { url, answers } = req.body;
  console.log(url, answers);
  try {
    const quizs = await Quiz.findOne({
      where: { url: url },
      attributes: ['quiz_title', 'url'],
      include: [
        {
          model: Question,
          // as: 'questions',
          attributes: ['question_id', 'question_title', 'question_type', 'question_position'],
          include: {
            model: Option,
            // as: 'options',
            attributes: ['option_id', 'option_title', 'is_correct'],
          },
        },
      ],
    })
    // console.log(quizs);
    let correctAnswerCount = 0;
    // let unAnswered = 0;
    for (const question of quizs.Questions) {
      // console.log(question);
      if (Object.prototype.hasOwnProperty(answers, question.question_id.toString())){
        res.status(400).send("Please answer all the questions");
        return;
      }
      let answer = answers[question.question_id.toString()];
      
      let correctAnswers = question.Options.filter(opt => opt.is_correct).map(opt=>opt.option_id);
      console.log(typeof(question.question_type), correctAnswers, answer);
      switch (question.question_type) {
        case "SINGLE_CHOICE":
          if (answer == correctAnswers[0]) {
            correctAnswerCount++;
          }
          break;
        case "MULTIPLE_CHOICE":
          //  (correctAnswers.length == answer.length){

          //   correctAnswers++;
          // }if
          if(arraysEqual(answer, correctAnswers)){
            correctAnswerCount++;
          }

          break;
        default:
          break;
      }

    }
    res.json({ correctAnswerCount: correctAnswerCount, totalQuestionCount: quizs.Questions.length})
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Connect to the database and start the server
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database: ', error);
  });