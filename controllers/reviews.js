const Campground = require('../models/campgrounds');
const Review = require('../models/review');

module.exports.postReview = async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review); //review[rating] and review[body]
    review.author = req.user._id; //issaugojam author of the created camp
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    // res.redirect(`/campgrounds/${review._id}`)
    req.flash('success', 'Your review was added!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    // pull method --> read more
    await Campground.findByIdAndUpdate(id, { $pull: { reviewId } });
    req.flash('success', 'Review was deleted successfully!')
    res.redirect(`/campgrounds/${id}`)
}