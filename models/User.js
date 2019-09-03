const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
       
    },
    online:{
        type:Boolean,
        required:true,
        default:true
    }
});

module.exports  = mongoose.model('User', userSchema);