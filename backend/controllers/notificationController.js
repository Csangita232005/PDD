const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.query.userId;
    const role = req.user ? req.user.role : null;
    let filter = {};

    if (role === 'ADMIN' || req.query.isAdmin === 'true' || req.query.all === 'true') {
      filter = {}; // Admin gets complete system audit log of notifications
    } else if (userId) {
      filter = { userId };
    } else if (req.user) {
      filter = { userId: req.user._id };
    }

    // Return notifications sorted by creation date
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notifId = req.params.id;
    await Notification.findByIdAndUpdate(notifId, { isRead: true });
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
