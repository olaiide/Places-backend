const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
    },
    address : {
        type : String,
        required : true,
    },
    location : {
        0 : { type : Number, required : true},
        1 : { type : Number, required : true},
    },
    creator : {
        type : mongoose.Types.ObjectId, 
        required : true,
        ref : 'User'
    }
})

module.exports = mongoose.model('Place', placeSchema)



 // "test": "echo \"Error: no test specified\" && exit 1",
    // "start": "nodemon app.js"