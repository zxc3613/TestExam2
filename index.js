var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var uuidv4 = require('uuid/v4');

rooms = [];
roomsRandoms = [];
const maxClient = 2;


app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
    console.log('a user connected, 서버에 접속');

    //방 만들기
    var addRoom = function(socket) {
        var roomId = uuidv4();
        socket.join(roomId, function() {
            var room = {roomId: roomId, clients: [{clients: socket.io, ready: false}]};
            rooms.push(room);
            socket.emit('addRoom', {roomId: roomId});
        });
    }
    //유효한 방 배열로 찾기
    var getAcailableRoom = function() {
        if (rooms.length > 0)
        {
            for (var i = 0; i < rooms.length; i++)
            {
                if (rooms[i].clients.length < maxClient)
                {
                    roomsRandoms.push(i);
                }
            }
            return roomsRandoms;
        }
    }
    //찾은 방 배열에 넣기
    roomsRandoms = getAcailableRoom();
    if (roomsRandoms.length > -1)
    {
        //배열의 길이를 추출
        var roomsIndex = roomsRandoms.length
        //배열의 길이만큼 랜덤으로 나온 숫자를 구해 랜덤입장한다.
        var randomIndex = (int)(Math.random() * roomsIndex);

        socket.join(rooms[roomsRandoms[randomIndex]].roomId, function() {
            var clientsNum = rooms[roomsRandoms[randomIndex]].clients.length;
        });

        var client = {clientId:socket.id, ready:false}
        rooms[roomsRandoms[randomIndex]].clients.push(client);
    }


    socket.on('disconnect', function(){
      console.log('user disconnected, 서버를 나감');
    });
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});