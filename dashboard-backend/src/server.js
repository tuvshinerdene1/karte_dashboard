const db = require('./config/database');
const express = require('express');
const monitoringRoutes = require('./routes/monitoringRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const app = express();

app.use(express.json());

// public routes
app.use('/api/auth', authRoutes);

// protected routes (only logged in users can see the dashboard)
app.use('/api/monitoring', authMiddleware, monitoringRoutes);

// hospital routes require auth inside the router
app.use('/api/hospital', hospitalRoutes);

require('dotenv').config();
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
