const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {};

        // 1. Total Patients
        const totalPatients = await db.query('SELECT COUNT(*) FROM patients');
        stats.totalPatients = parseInt(totalPatients.rows[0].count);

        // 2. Appointments Today
        const todayAppointments = await db.query(
            "SELECT COUNT(*) FROM appointments WHERE date(start_time) = CURRENT_DATE AND status != 'cancelada'"
        );
        stats.appointmentsToday = parseInt(todayAppointments.rows[0].count);

        // 3. Revenue (Estimated: count completed * 100)
        // In real app, rely on invoices table.
        const completedAppts = await db.query(
            "SELECT COUNT(*) FROM appointments WHERE status = 'completada' AND start_time >= date_trunc('month', CURRENT_DATE)"
        );
        stats.monthlyRevenue = parseInt(completedAppts.rows[0].count) * 100; // Mock value per appointment

        // 4. Satisfaction Rate
        const surveyData = await db.query('SELECT AVG(rating) as avg_rating FROM surveys');
        stats.satisfactionRate = parseFloat(surveyData.rows[0].avg_rating || 0).toFixed(1);

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTreatmentTrends = async (req, res) => {
    try {
        // Return last 6 months of data
        const query = `
      SELECT 
        to_char(date_trunc('month', start_time), 'Mon') as month,
        COUNT(*) as count
      FROM appointments
      WHERE status = 'completada'
      GROUP BY date_trunc('month', start_time)
      ORDER BY date_trunc('month', start_time) DESC
      LIMIT 6
    `;
        const { rows } = await db.query(query);
        res.status(200).json(rows.reverse());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
