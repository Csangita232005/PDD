const Review = require('../models/Review');
const Donation = require('../models/Donation');

exports.createReview = async (req, res) => {
  try {
    const { donationId, fromUserId, fromUserName, toUserId, rating, comment } = req.body;

    if (!donationId || !rating) {
      return res.status(400).json({ success: false, message: 'Donation ID and star rating are required.' });
    }

    const review = await Review.create({
      donationId,
      fromUserId: fromUserId || (req.user ? req.user._id : null),
      fromUserName: fromUserName || (req.user ? req.user.name : 'Anonymous'),
      toUserId,
      rating: Number(rating),
      comment: comment || '',
    });

    // Update donation rating
    await Donation.findByIdAndUpdate(donationId, {
      rating: Number(rating),
      reviewComment: comment || '',
    });

    return res.status(201).json({ success: true, message: 'Review submitted successfully.', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
