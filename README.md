# This is the backend nodejs/express app.

## This needs to be running before you start the frontend, instructions for building/running below

### BUILDING/RUNNING

1. Clone this repo
2. Install dependencies
    `npm install`
3. Code runs on PORT 1337 by default, to change the PORT edit index.js
4. Code uses postgres database, you can change database connection settings on config.js to point to your own instance of postgres
5. Run the backend
    `npm run start`
6. On successfull start, you should see the message
    'Listen Successfully on 1337'
7. Now you can start the frontend
