const Campground = require("../models/campgrounds");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 2,
        })
        .send();

    if (!req.body.campground)
        throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    })); //jeigy yra kelios foto tada loopinu funkcija f
    campground.author = req.user._id; //issaugojam author of the created camp
    await campground.save();
    console.log(campground);
    req.flash("success", "A new campground was created successfuly!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async(req, res) => {
    const { id } = req.params;
    const pop = {
        //populate viduje reviews!
        path: "reviews",
        populate: {
            path: "author",
        },
    };
    const campground = await Campground.findById(id)
        .populate(pop)
        .populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    }
    //const campgrounds = await Campground.find({});
    res.render("campgrounds/show", { campground });
};

module.exports.renderEditCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    }
    //const campgrounds = await Campground.find({});
    res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async(req, res) => {
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 2,
        })
        .send();
    const { id } = req.params;
    console.log(req.body);
    const camp = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    camp.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs); //jeigy yra kelios foto tada loopinu funkcija f
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
        console.log(camp);
    }
    req.flash("success", "It was updated successfuly!");
    res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground was deleted successfully!");
    res.redirect(`/campgrounds`);
};