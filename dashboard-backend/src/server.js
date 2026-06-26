require('dotenv').config(); // Load this at the very top
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./config/database');

const monitoringRoutes = require('./routes/monitoringRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();
const server = http.createServer(app);

// 1. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

// 2. Middleware to make 'io' accessible in your Controllers
// This allows you to call 'req.io.emit()' inside HospitalController.handleEvent
app.use((req, res, next) => {
    req.io = io;
    next();
});

// 3. Basic Socket Connection Logic
io.on('connection', (socket) => {
    console.log('📡 New Dashboard Client Connected:', socket.id);

    // You can handle "rooms" here if you want to separate data by hospital_id
    socket.on('join_hospital', (hospitalId) => {
        socket.join(String(hospitalId));
        console.log(`🏥 Client joined room: ${hospitalId}`);
    });

    socket.on('join_admin', () => {
        socket.join('admin');
        console.log('🛡️ Admin client joined admin room');
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client Disconnected');
    });
});

// 4. Routes
// Public routes
app.use('/api/auth', authRoutes);

// Protected monitoring routes
app.use('/api/monitoring', authMiddleware, monitoringRoutes);

// Hospital routes (Auth handled inside the router)
app.use('/api/hospital', hospitalRoutes);
app.use('/api/support', supportRoutes);

// 5. Database Connection Test
db.query('SELECT NOW()')
    .then(res => {
        console.log('✅ Database connected at:', res.rows[0].now);
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.stack);
    });

// 6. Start the SERVER (Use server.listen, NOT app.listen)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Server + Sockets running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});