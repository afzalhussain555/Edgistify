# Quiz App

This Node.js application is a quiz application that allows users to register, login, create quizzes and attempt them. It uses Passport.js for authentication, JSON Web Tokens (JWTs) for authorization, Sequelize as an ORM, and bcrypt for password hashing.

### Setup
Clone the repository
bash
$ git clone https://github.com/afzalhussain555/Edgistify.git


### Install dependencies

$ npm install


### Start the server

$ npm start


## Features
* User registration and login with password hashing

* JSON Web Tokens for authorization

* User authentication using Passport.js

* Ability to create quizzes with multiple-choice questions

* Randomly generated quiz URLs

* Ability to attempt quizzes and see the score at the end

* Admin can view all quizzes and their results

## API Endpoints
1. POST /register: Registers a new user.

2. POST /login: Logs in a user and returns a JWT.

3. POST /quiz: Creates a new quiz.

4. GET /quiz: Retrieves a quiz by its URL.

5. POST /attempt/:quizUrl: Submits an attempt for a quiz.

6. GET /admin/quizzes: Retrieves all quizzes created by a specific user.



## Dependencies

* express: Web framework for Node.js.

* dotenv: Loads environment variables from a .env file.

* jsonwebtoken: Generates and verifies JSON Web Tokens.

* passport: Authentication middleware for Node.js.

* sequelize: Object-relational mapping library for Node.js.

* bcrypt: Library for hashing passwords.

* cors: Middleware for handling Cross-Origin Resource Sharing.

* crypto: Cryptography library for generating random codes.

* passport-jwt: Passport.js strategy for authenticating with JSON Web Tokens.
