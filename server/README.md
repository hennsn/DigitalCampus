
# Multiplayer - Server

Our server is based on Node.js, because it's really easy to hack together.

- run the server: node digitalcampus.js

- run the server in the background: nohup node digitalcampus.js > logs/nodejs-output.log &

To run the server continously, you can use the npm package forever:

- npm install forever -g

- forever start digitalcampus.js
- to apply changes, use forever restart digitalcampus.js