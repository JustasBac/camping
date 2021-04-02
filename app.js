if (process.env.NODE_ENV !== "production") { //jeigu mes NEdevelopment stadijoj tada reikalaujam pasleptu failu kurie yra .evs faile
    require('dotenv').config();
}

const express = require("express")
const app = express();
const mongoose = require('mongoose');
const ExpressError = require('./utilities/ExpressError');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet"); //apsauga su 11 middlewares


const campgroundRoutes = require('./routes/campgrounds')
const reviewROutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const { getMaxListeners } = require("process");
const MongoDBStore = require('connect-mongo');

const db_url = process.env.DB_URL || 'mongodb://localhost:27017/camp';
//const db_url = 'mongodb://localhost:27017/camp';
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(mongoSanitize()); //apsaugo nuo mongo injection

//session!----------------------------------
const store = new MongoDBStore({
    mongoUrl: db_url,
    touchAfter: 24 * 60 * 60 //laikas kada atfreshina in millisekundemis
})

store.on("error", function(e) {
    console.log("Session store error")
})

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const sessionConfig = {
    store, //store pavadinimas yra = store
    name: 'sausainis',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // del saugumo
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //galioja viena savaite!  miliseconds!
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    //store: pavadinimas           kur saugom! nes dabar in memory
}

//session end ----------------------------
app.use(session(sessionConfig));
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(flash());
app.use(helmet());

//helmet Cybersecurito isimtys:
const scriptSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                // "https://res.cloudinary.com/dfx4mjv8p/",
                "https://res.cloudinary.com/", //TURI BUTI MANO ACCOUNTas
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
//helmeto isimciu pabaiga

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //it says how to store User
passport.deserializeUser(User.deserializeUser()); //it says how to un-store User

//----------------SETTINGs DONE ----------------
//Flash middleware!
app.use((req, res, next) => {
    if (!['/login', '/register', '/', '/javascripts/validateForms.js', '/stylesheets/stars.css', '/javascripts/showPageMap.js', '/javascripts/clusterMap.js', '/stylesheets/app.css', '/stylesheets/home.css'].includes(req.originalUrl)) { //if u come from any url except '/login' or '/' then it will set:
        console.log('Checkinu: ', req.originalUrl);
        console.log('------------ ');
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user; // in all templates I have access to currentUser
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

// app.get('/fakeUser', async(req, res) => {
//     const user = new User({ email: 'justas@getMaxListeners.com', username: 'Justas' });
//     const newUser = await User.register(user, 'slaptazodyys');
//     res.send(newUser)
// })



app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewROutes)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong"
    res.status(statusCode).render('error.ejs', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})