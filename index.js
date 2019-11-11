// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var util = require('util');
var userdata=[];
var serverdata=[];
server.listen(port, () => {
	console.log('Server listening at port %d', port);
});
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection',(socket)=>{
    //console.log(socket)
    socket.on('login_user',(data)=>{
        //console.log(data);
        socket.join(String(data['userroom']),()=>{
            let room = Object.keys(socket.rooms)
            //console.log(room[0])
            if(serverdata[room[0]] ==undefined){
                serverdata[room[0]] =[];
            }
            serverdata[room[0]][socket.id]=data["username"];
            userdata[socket.id] = room[0]
            //
            io.to(userdata[socket.id]).emit("userlist",{"userid":socket.id,"username":data["username"],"userroom":room[0]});
            console.log("user join" + serverdata[room[0]])
            //io.to(String(data['userroom'])).emit('userlist',)
        })
    })
    socket.on('msgcreat',(data)=>{
        data.id = socket.id;
        var now = new Date();
        data.time = now.getHours()+':'+('0' + now.getMinutes()).slice(-2);
        data.day = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate();
        now = undefined;
        console.log(data)
        buf = new Buffer.from(data.message,'utf16le');
        data.message = buf.toString('utf-16le',0,buf.length)
        data.buf = buf;
        console.log(buf)
        console.log(data.message)
        io.to(userdata[socket.id]).emit('createdmsg',data)
        fs.appendFile( userdata[socket.id]+'.log', JSON.stringify(data)+'\r\n', function (err) {
            if (err) {
                throw err;
            }
          });
    })
    socket.on('disconnect',()=>{
        delete serverdata[userdata[socket.id]][socket.id]
        io.to(userdata[socket.id]).emit("userlist",serverdata);
        console.log("user disconnect" + serverdata[userdata[socket.id]])

    })
    socket.on('reconnect', ()=>{

    })
    
})