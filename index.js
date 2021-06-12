const express = require('express');
const app = express();
const offenderRoutes = require('./routes/offenderRoutes');
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const cors = require('cors')

app.use(cors())
// parse application/x-www-form-urlencoded
// app.use(express.urlencoded())
// parse application/json
app.use(express.json())

app.use('/api/offenders', offenderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);

app.listen('1337', () => {
    console.log('Listen Successfully on 1337');
})