const express = require('express');
const mongoose = require('mongoose');
const router  = express.Router();
const axios = require('axios')
const Games = require('../models/Game.model');
const Records = require('../models/Records.model');
const { response } = require('../app');
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
  console.log(req.params);
  const { id } = req.params

  Records.find({
    games: mongoose.Types.ObjectId(id)
  })
  .then((response) => {
    console.log('RECORDS:', response)
    res.render('records', {
      game_id: id,
      records: response
    });
  })
    .catch(() => {
      res.send("Nope, check if everything is working")
    })

  // Games.findById(id)
  // .then((response) => {
  //   console.log('GAME', response)
  //   res.render('records', response);
  // })
  //   .catch(() => {
  //     res.send("Nope, check if everything is working")
  //   })
})
 
router.get('/games/:id/records/create', (req,res) => {
  const { id } = req.params
 res.render('create-record.hbs', {id})
});

router.post('/games/:id/records/create', (req,res) => {
  const {name, time, picture, video} = req.body;
  console.log(req.body);
  const { id } = req.params
  const _id = mongoose.Types.ObjectId(id);

  Records.create({name,time,picture,video, games:[ _id ]})
  .then(() => {
    const { id } = req.params
    res.redirect(`/games/${id}`)
  })
  .catch(() => {
    res.render('../views/create-record.hbs')
  })
})

 router.get('/games/:id/records/edit', (req,res) => {
  const {id} = req.params
  Records.findById(id)
  .then((response) => {
    res.render('update-form', response);
  })
    .catch(() => {
      res.send("Nope, check if everything is working")
    })
})

router.post('/games/:id/records/edit', (req,res) => {
  const {id} = req.params
  const { name, time, picture, video } = req.body;
  console.log('saving record', id)
  Records.findByIdAndUpdate(id, {$set: {name,time,picture,video}})
  .then((doc) => {
    //console.log('DOC:', doc)
    //console.log('DOC.records[0]:', typeof doc.games[0])
    res.redirect('/games/'+doc.games[0])
  })
  .catch((err) => {
    console.log('ERROR', err)
    res.render('update-form')
  })
});

router.post('/games/:game_id/records/:record_id/delete',(req,res,next) => {
  const {game_id, record_id} = req.params
  //const { name, time, picture, video} = req.body
  Records.findByIdAndDelete(record_id)
  .then((doc) => {
    res.redirect('/games/'+game_id)
  })
  .catch((response) => {
    res.render('update-form',{response})
  })
});
module.exports = router;

