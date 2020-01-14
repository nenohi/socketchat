// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var util = require('util');
var serverdata={};
server.listen(port, () => {
	console.log('Server listening at port %d', port);
});
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection',(socket)=>{
    socket.on('login_user',(data)=>{
        socket.join(String(data['userroom']),()=>{
            let room = Object.keys(socket.rooms)
            serverdata[socket.id]={"username":data["username"],"userroom":room[0]};
            console.log(data["username"]);
            let ubuf = new Buffer.from(data["username"],'utf16le')
            io.to(serverdata[socket.id]["userroom"]).emit("userlist",{"userid":socket.id,"username":data["username"],"userroom":room[0],"userbuf":ubuf});
        })
    })
    socket.on('msgcreat',(data)=>{
        data.id = socket.id;
        var now = new Date();
        data.time = now.getHours()+':'+('0' + now.getMinutes()).slice(-2);
        data.day = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate();
        now = undefined;
        buf = new Buffer.from(data.message,'utf16le');
        data.message = buf.toString('utf-16le',0,buf.length)
        ubuf = new Buffer.from(data.username,'utf16le')
        data.buf = buf;
        data.ubuf = ubuf;
        io.to(serverdata[socket.id]["userroom"]).emit('createdmsg',data)
        fs.appendFile( serverdata[socket.id]["userroom"]+'.log', JSON.stringify(data)+'\r\n', function (err) {
            if (err) {
                throw err;
            }
          });
          console.log(serverdata[socket.id])
    })
    socket.on('disconnect',()=>{
        if(serverdata[socket.id]["userroom"]!=undefined){
            io.to(serverdata[socket.id]["userroom"]).emit("removeuserlist",{"userid":socket.id,"userroom":serverdata[socket.id]["userroom"],"username":serverdata[socket.id]["username"]});
        }
        delete serverdata[socket.id]
    })
    socket.on('reconnect', ()=>{

    })
    
})