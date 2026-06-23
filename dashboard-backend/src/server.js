const db = require('./config/database');
const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

db.query('SELECT NOW()')
    .then(res =>{
        console.log('database connected at :', res.rows[0].now);
    })
    .catch(err => {
        console.error('database connection error: ', err.stack);
    });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})
