const mongoose  = require('mongoose');

const msgSchema = new mongoose.Schema({
  
    msg_type:[Number],
    to:{
        type:ObjectId,
        required:true
    },
    from:{
        type:ObjectId,
        required:true
    },
    mesg:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
});

module.exports  = mongoose.model('User', userSchema);