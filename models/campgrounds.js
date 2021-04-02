const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

//  

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200'); //https://res.cloudinary.com/dfx4mjv8p/image/upload/w_200/v1615239431/Campito/j3slehnk6xunuec94dqi.jpg. Originalus failas be /w_200
});

ImageSchema.virtual('sumazinta').get(function() {
    return this.url.replace('/upload', '/upload/c_lpad,h_431,w_616');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.location}</p>`
});
//reikia patikrinti kokia middleware!
CampgroundSchema.post('findOneAndDelete', async function(camp) { // await Campground.findByIdAndDelete(id); naudoja 'findOneAndDelete' middleware!
    if (camp.reviews.length) {
        await Review.deleteMany({ _id: { $in: camp.reviews } });
    }
    console.log('post middleware')
})

module.exports = mongoose.model('Campground', CampgroundSchema)