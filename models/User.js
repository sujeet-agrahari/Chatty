const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        min:6
    },
    online:{
        type:Boolean,
        required:true,
        default:true
    },
    connections:{
        type
    } 
});

module.exports  = mongoose.model('User', userSchema);