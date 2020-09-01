const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const gameSchema = new Schema(
  {
    name: {
      type: String,
      unique: true
    },
    background_image: {
      type: String,
      unique: true
    },
    suggestions_count: {
      type: Number,
      unique: true
    },
    metacritic: {
      type: Number,
      unique: true
    },
   released: {
     type: String,
     unique: true
   },
    platforms: {
      type: Array,
      unique: true
    }
  }
)

const Games = model('Game',gameSchema);
module.exports = Games;