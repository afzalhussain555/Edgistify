# Edgistify 

This is a Node.js Express server that handles user registration, login, and event creation and attendance. The server uses JWT authentication for protecting certain routes, such as the route for creating events or viewing attendees.
The application that uses several libraries such as Express, Passport, and Sequelize to provide APIs for registering and logging in users, creating and retrieving events, and managing attendees.
Overall, this application provides a secure and efficient way for users to create and manage events and attendees.
The application also defines a passport-jwt strategy for authentication with JWT tokens. The strategy uses the jsonwebtoken package to decode and verify the token, and queries the database to retrieve the user associated with the token.
It also uses bcrypt for password hashing to securely store user passwords.

The application uses JWT (JSON Web Tokens) for authentication and authorization, which is a standard method for securely transmitting information between parties. It also uses bcrypt for password hashing to securely store user passwords.
The server uses the following middleware:
1. express.urlencoded() and express.json(): parse incoming requests with urlencoded or JSON payloads
2. passport.initialize(): initialize Passport for authentication
3. passport.authenticate('jwt', { session: false }): authenticate with JWT token, with session disabled
4. cors(): enable Cross-Origin Resource Sharing (CORS) for all routes

The server defines the following routes:

1. POST /register: creates a new user with a username, password, and full name. Returns the user and a JWT token.
2. POST /login: logs in a user with a username and password. Returns the user and a JWT token.
3. POST /events: creates a new event with a name, start and end time, and capacity. Requires authentication with JWT. Returns the new event.
4. GET /events: retrieves all events. Does not require authentication.
5. GET /attendees: retrieves attendees for an event. Requires authentication with JWT. Accepts query parameters for filtering attendees by ID, event ID, or user ID. Returns the attendees.
6. POST /attendees: creates a new attendance request for an event. Requires authentication with JWT. Accepts the event ID in the request body. Checks if the user has already sent a request to join the event.

