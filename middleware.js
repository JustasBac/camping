const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campgrounds');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
}

// Validations ------------------------------------
module.exports.validateCampground = (req, res, next) => {
    //JOI apibudinu reikalavimus, kad aptikti erroru!
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permision!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params; // {id} - camp id, {rewievId} - reviewo id
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permision!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}
module.exports.validateReview = (req, res, next) => {
    //JOI apibudinu reikalavimus, kad aptikti erroru!
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
//-------------------------------------------- validations------------