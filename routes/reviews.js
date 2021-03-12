const express = require('express')
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews') //importinam kontrolerius



router.post('/', validateReview, isLoggedIn, catchAsync(reviews.postReview))

router.delete('/:reviewId', isReviewAuthor, isLoggedIn, catchAsync(reviews.deleteReview))



module.exports = router;