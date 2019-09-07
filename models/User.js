const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        index:true
       
    },
    online:{
        type:Boolean,
        required:true,
        default:true
    },
    
    color:{
        type:String,
        default:'#7646FF'
    }
});

module.exports  = mongoose.model('User', userSchema);