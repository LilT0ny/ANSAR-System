const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const odontogramController = require('./controllers/odontogramController');
const analyticsRoutes = require('./routes/analyticsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const publicRoutes = require('./routes/publicRoutes');
const auth = require('./middleware/authMiddleware');
const cron = require('./cron/reminderCron');

// Start cron
cron.start();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Public Routes
app.use('/api/v1/public', publicRoutes);

// Protected Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/gallery', galleryRoutes);

// Odontogram routes (Directly in index for brevity or could be separate file)
const odRouter = express.Router();
odRouter.use(auth.protect);
odRouter.get('/:patientId', odontogramController.getOdontogram);
odRouter.post('/:patientId', odontogramController.updateOdontogram);
app.use('/api/v1/odontograms', odRouter);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
