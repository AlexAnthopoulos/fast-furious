const { Router } = require('express');
const mongoose = require('mongoose');
//Add user here
const User = require('../models/User.model');
const router = new Router();
//Add Bcrypt here
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const passport = require('passport');
const Records = require('../models/Records.model');
const Games = require('../models/Game.model');


router.get('/signup', (req,res) => res.render('auth/signup'));

router.post('/signup',(req,res,next) =>{
  const { username, email, password } = req.body;
  //Validation
  if (!username || !email || !password) {
    res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    return;
  }
// make sure passwords are strong:
const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
if (!regex.test(password)) {
  res
    .status(500)
    .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
  return;
}
  bcryptjs
  .genSalt(saltRounds)
  .then(salt => bcryptjs.hash(password,salt))
  .then(hashedPassword => {
    return User.create({
      username,
      email,
      passwordHash:hashedPassword
    });
  })
  .then(userFromDB => {
    console.log('Newly created user is: ', userFromDB);
    res.redirect('/userProfile');
  })
  .catch(error => {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render('auth/signup', { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render('auth/signup', {
         errorMessage: 'Username and email need to be unique. Either username or email is already used.'
      });
    } else {
      next(error);
    }
  });
});

router.get('/login', (req, res, next) => {
  res.render('auth/login');
});
 
router.post("/login", passport.authenticate("local", {
  
  successRedirect: "/userProfile",
  failureRedirect: "/login"
}));

router.get("/private", (req, res) => {
  if (!req.user) {
    res.redirect('/login'); // not logged-in
    return;
  } else {
    res.render("private", {user: req.user});
  }
});


router.get('/userProfile', (req, res) => {
  console.log('USER:', req.user);
  if(!req.user){
    res.redirect('/');
    return;
  }


Records.find({
  users: { $in: [ mongoose.Types.ObjectId(req.user.id) ] }
}).then((results) => {

  

  console.log('records for current user', results)

  res.render('users/user-profile', { userInSession: req.user, records: results});
}).catch(() => {})
  
});

router.get('/logout',(req,res) => {
  req.logout();
  res.redirect('/login');
})


router.get('/logout',(req,res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;