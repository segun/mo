const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const offenderRoutes = require('./routes/offenderRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors')

app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use('/api/offenders', offenderRoutes);
app.use('/api/users', userRoutes);

app.listen('1337', () => {
    console.log('Listen Successfully on 1337');
})