const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const connectDB = require('./config/db.js');
const { initSocket } = require('./socket.js');

// Connect to MongoDB Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io Realtime Websocket Hub
const io = initSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Fallback Endpoint for Complaints
app.post('/api/reset-demo-data', require('./controllers/resetController').resetDemoData);
app.use('/api/complaints', (req, res) => {
  res.json({ success: true, complaints: [], message: 'Complaints module active.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', application: 'SHAREBITE', database: 'MongoDB', socket: 'Active', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('SHAREBITE Node.js + Express + MongoDB Server & Socket.io Gateway is Running 🚀');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SHAREBITE Real-Time Server listening on port ${PORT} (MongoDB & Socket.io Ready)`);
});
