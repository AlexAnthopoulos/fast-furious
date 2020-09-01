const express = require('express');
const router  = express.Router();
const axios = require('axios')
const Games = require('../models/Game.model');
/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

// Get the games page
router.get('/games',(req,res,next) => {
  axios
  .get('https://api.rawg.io/api/games')
  .then ((response) =>{
    // console.log("Response from the API: ", response.data);
    //res.render('games', {games: response.data.results})
    let results = response.data.results;
    //const {name,background_image,suggestions_count,metacritic,released,platforms} = response.data.results;
    Games.create(results)
    .then((resultsFromDB) => {

      // console.log(`created ${resultsFromDB.length} games`);
      res.render('games', {games: resultsFromDB})
  })
   .catch((error) =>{
  if(error.code === 11000){
    Games.find()
      .then((resultsFromDB) => {
        res.render('games', {games: resultsFromDB})
      })
    return
  }
  next(error)
})

  })
  .catch((error) => {
    console.log('Unable to get games',error)
  })
})


router.get('/about', (req, res, next) => {
  res.render('about');
});
router.get('/hof', (req, res, next) => {
  res.render('hof');
});
router.get('/streams', (req, res, next) => {
  res.render('streams');
});

router.get('/games/:id', (req,res) =>{
  res.render('records');
})

module.exports = router;

