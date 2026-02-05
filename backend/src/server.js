require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const ngoRoutes = require('./routes/ngos');
const campaignRoutes = require('./routes/campaigns');
const messageRoutes = require('./routes/messages');
const donationRoutes = require('./routes/donations');
const volunteerRoutes = require('./routes/volunteering');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5001;

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-connect');

app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteering', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => res.send({ ok: true, message: 'NGO Connect API running' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
