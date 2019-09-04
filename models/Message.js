const mongoose  = require('mongoose');

const msgSchema = new mongoose.Schema({
  
    
    sender:{
        type: String,
        required:true,
        index:true,
        ref:'User'
    },
    conversation_id:{ 
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        index:true,
        ref:'Conversation'
    },
    msg_type:{
        type:Number,
        default:1
    },
    msg:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
});

module.exports  = mongoose.model('Message', msgSchema);