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
// const checkGuest = checkRoles('GUEST');
// const checkAdmin = checkRoles('ADMIN');
// const checkUser = checkRoles('USER')
//get routes Here we will display the signup fors for users

router.get('/signup', (req,res) => res.render('auth/signup'));
//post routes
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
  successRedirect: "/",
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
//Passport Roles
// router.get('/private', ensureAuthenticated, (req, res) => {
//   res.render('private', { user: req.user });
// });

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     // The user is authenticated
//     // and we have access to the logged user in req.user
//     return next();
//   } else {
//     res.redirect('/login');
//   }
// }


// router.get('/login',(req,res) => res.render('auth/login'));
// router.post('/login', (req, res, next) => {
//   console.log('SESSION =====> ', req.session);
//  const { email, password } = req.body;
 
//   if (email === '' || password === '') {
//     res.render('auth/login', {
//       errorMessage: 'Please enter both, email and password to login.'
//     });
//     return;
//   }
 
//   User.findOne({ email })
//     .then(user => {
//       if (!user) {
//         res.render('auth/login', { errorMessage: 'Email is not registered. Try with other email.' });
//         return;
//       } else if (bcryptjs.compareSync(password, user.passwordHash)) {
//         req.session.currentUser = user;
//         res.redirect('/userProfile');
//       } else {
//         res.render('auth/login', { errorMessage: 'Incorrect password.' });
//       }
//     })
//     .catch(error => next(error));
// });

router.get('/userProfile', (req, res) => {
// TODO Record.find() --> to get all the records
// in the .then() of Record.find() --> map the results that match with the _id value of req.user. 
// send the mapped results to user-profile.hbs -->> {userInSession: req.user, userRecords : the mapped results}

Records.find()
.then((results) => {
  console.log('Retrieved results: ', results);


  results.map()

  res.render('users/user-profile', { userInSession: req.user, userRecords: 1});
}).catch(() => {})
  
});

router.get('/logout',(req,res) => {
  req.logout();
  res.redirect('/login');
})

// router.post('/logout', (req,res) => {
//   req.session.destroy();
//   res.redirect('/');
// });

//Passport logou
router.get('/logout',(req,res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;