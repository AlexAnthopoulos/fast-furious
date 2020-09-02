const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const RecordSchema = new Schema(
  {
    name: String,
    time: Number,
    picture: String,
    video: String,
    games:[{ type: Schema.Types.ObjectId, ref:'Games'}]
  },
 
)
    
   

const Records = model('Record',RecordSchema);
module.exports = Records;