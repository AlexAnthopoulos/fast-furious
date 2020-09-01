const { Router } = require('express');
const router = new Router();

//get routes Here we will display the signup fors for users

router.get('/signup', (req,res) => res.render('auth/signup'));
//post routes
router.post('/signup',(req,res,next) =>{
  console.log('Your form data: ', req.body);
});

module.exports = router;