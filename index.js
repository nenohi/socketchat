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
    socket.on('login user',(data)=>{
        console.log(data);
        socket.join(String(data['userroom']),()=>{
            let room = Object.keys(socket.rooms)
            //console.log(room[0])
            serverdata[room[0]] = serverdata[room[0]]+1;
            userdata[socket.id] = room[0]
            //
            
            console.log(socket.rooms)
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
        console.log(buf)
        io.to(userdata[socket.id]).emit('createdmsg',data)
        fs.appendFile( userdata[socket.id]+'.log', JSON.stringify(data)+'\r\n', function (err) {
            if (err) {
                throw err;
            }
          });
    })
    socket.on('disconnect',()=>{
        console.log(serverdata[userdata[socket.id]])
        serverdata[userdata[socket.id]] = serverdata[userdata[socket.io]]-1
    })
    socket.on('reconnect', ()=>{

    })
    
})