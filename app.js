require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session      = require('express-session');
const MongoStore   = require('connect-mongo')(session);
const bcryptjs      = require ('bcryptjs');
const passport     = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User=require('./models/User.model');
// const { MongoStore } = require('connect-mongo');


mongoose
  .connect('mongodb://heroku_rvgrg3k5:fvng43dov4tlsvpu5u2ujtg6tj@ds129625.mlab.com:29625/heroku_rvgrg3k5', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();
// require( './configs/session.config')(app);

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



//Passport stuff

app.use(
  session({
    secret: process.env.SESS_SECRET,
    store: new MongoStore( { mongooseConnection: mongoose.connection }),
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, cb) => {
  cb(null, user._id);
});
passport.deserializeUser((id, cb) => {
  User.findById(id)
    .then(user => cb(null, user))
    .catch(err => cb(err))
  ;
});
 
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // by default
    passwordField: 'password'  // by default
  },
  (email, password, done) => {
    console.log(email);
    console.log(password);
    User.findOne({email})
      .then(user => {
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
 
        if (!bcryptjs.compareSync(password, user.passwordHash)) {
          return done(null, false, { message: "Incorrect password" });
        }
        console.log(user);
        done(null, user);
      })
      .catch(err => done(err))
    ;
  }
));

// Express View engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Fast and Furious';



const index = require('./routes/index');
const authRouter = require('./routes/auth.routes');

app.use('/', index);
app.use('/',authRouter);


module.exports = app;
