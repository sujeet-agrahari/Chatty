const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server)
const mongoose = require("mongoose");
require("dotenv/config");
//Connect to Database
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useCreateIndex: true,}, () =>
  console.log("Connected to DB...")
);
//Get models
const User = require("./models/User");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

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

//Fetch a user's chat history
async function fetchUserChats(clickedUser, currentUser){
   const conversation = await Conversation.findOne({$or:[{ participants: clickedUser +'_' + currentUser },  {participants: currentUser + '_' + clickedUser}]});
   console.log(conversation);
   if(conversation) return await Message.find({conversation_id:conversation._id});
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
        saveMsg(data);  
    })
    //Save message to db
    async function saveMsg(data) {
        //check if conversation exist between users
        var conversation = await Conversation.findOne({$or:[{ participants: data.to+'_'+data.from },  {participants: data.from +'_' + data.to}]});
        //create conversation if doesn't exist
        if(!conversation){
            var conversation = await new Conversation({
                participants: data.to + '_'+ data.from
            })
            var conversation = await conversation.save();
        }
            //insert message
            const chat = new Message({
                sender:data.from,
                msg_type:1,
                msg:data.msg,
                conversation_id:conversation.id
            });
            const saveChat = await chat.save();
            return;
    
        //create new conversation between usres  
    }

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

    //return chat history
    socket.on('get-chat-history', async function (clickedUser,currentUser, callback){
        
        const chats = await fetchUserChats(clickedUser, currentUser);
        callback(chats);
        console.log(chats,clickedUser,currentUser);
        
    });

})
server.listen(3000, () => {
    console.log('Server Up and running...');
})


