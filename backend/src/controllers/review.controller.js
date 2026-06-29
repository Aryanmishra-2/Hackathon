const reviewService = require("../services/review.service");

// ==========================================
// Employee Reviews
// ==========================================

exports.getEmployeeReviews = async (req, res) => {

  try {

    const reviews = await reviewService.getEmployeeReviews(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      total: reviews.length,
      data: reviews,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Manager Reviews
// ==========================================

exports.getManagerReviews = async (req, res) => {

  try {

    const reviews = await reviewService.getManagerReviews(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      total: reviews.length,
      data: reviews,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Get Review By Id
// ==========================================

exports.getReviewById = async (req, res) => {

  try {

    const review = await reviewService.getReviewById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: review,
    });

  } catch (error) {

    console.error(error);

    return res.status(404).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Create Review
// ==========================================

exports.createReview = async (req, res) => {

  try {

    const review = await reviewService.createReview(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      data: review,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Submit Review
// ==========================================

exports.submitReview = async (req, res) => {

  try {

    const review = await reviewService.submitReview(

      req.params.id,

      req.body

    );

    return res.status(200).json({

      success: true,

      message: "Review submitted successfully.",

      data: review,

    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================================
// HR - Get All Reviews
// ==========================================

exports.getAllReviews = async (req, res) => {

  try {

    const reviews = await reviewService.getAllReviews();

    return res.status(200).json({

      success: true,

      total: reviews.length,

      data: reviews,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================================
// HR Review Statistics
// ==========================================

exports.getReviewStats = async (req, res) => {

  try {

    const stats = await reviewService.getReviewStats();

    return res.status(200).json({

      success: true,

      data: stats,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};