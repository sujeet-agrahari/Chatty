const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server)
const mongoose = require("mongoose");
require("dotenv/config");
//Connect to Database
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () =>
  console.log("Connected to DB...")
);
//Get models
const User = require("./models/User");

//store users socket ids
const people = {};

//create the user
async function createUser(username){
    //check if user already exists
    const userExists = await User.findOne({ username: username });
    if (userExists) {
        const makeUserOnline = await User.updateOne({username:username}, {$set : {online:true}});
        return;
    }
    
    //create new user
    const user = new User({
        username: username,
        online:true
    });

        const createdUser = await user.save();
    return;
}
//Fetch Users
async function fetchUsers(){
    return  await User.find({online:true});
    
}
//disconnect user
async function disconnectUser(username){
    const disconnect = await User.updateOne({username:username}, {$set : {online:false}});
    return;
}

    users = [];
    connections = [];
    app.use(express.static('public'));

    app.get('/', (req, res) => {
        return res.status(200).sendFile(__dirname + '/index.html');
    })



//Open connections and push to the opened connections
io.sockets.on('connection', socket => {
    console.log(socket.id);
    connections.push(socket);
   

    //Disconnect
    socket.on('disconnect', async function (data) {
       await disconnectUser(socket.username);
       updateUsernames();
        
    });

    //Send message  
    socket.on('send-message', function (data) {
        io.to(people[data.to]).to(people[data.from]).emit('new-message', { msg: data.msg, user: data.from });
    })

    //Neww user
    socket.on('new-user', async function (currentUser, callback){
        callback(true);
        socket.username = currentUser;
        people[socket.username] = socket.id;
        await createUser(socket.username);
        updateUsernames(currentUser);
    })
    async function updateUsernames(currentUser){
        users = await fetchUsers();      
        io.sockets.emit('get-users', users, currentUser);
    }

})
server.listen(3000, () => {
    console.log('Server Up and running...');
})


