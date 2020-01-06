var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var uuidv4 = require('uuid/v4');

rooms = [];
roomsRandoms = [];
const maxClient = 2;

io.on('connection', function(socket){
    console.log('a user connected, 서버에 접속');

    //방 만들기
    var addRoom = function() {
        var roomId = uuidv4();
            socket.join(roomId, function() {
            var room = {roomId, clients: [{clientId: socket.id, ready: false}]};
            rooms.push(room);
            socket.emit('join', {roomId: roomId});
        });
    }


    var createRoom = function() {
        var roomId = uuidv4();          //방 이름 생성
        socket.join(roomId, function() {
            var room = {roomId, clients: [{ clientId: socket.id, ready: false }] };
            rooms.push(room);

            socket.emit('join', {roomId: roomId, clientId: socket.id});
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
        else
        {
            return -1;
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

        socket.emit('join', {roomId: rooms[roomsRandoms[randomIndex]].roomId, clientId: socket.id});
    }
    else
    {
        createRoom();
    }

    socket.on('ready', function(data) {
        if (!data) return;

        var room = rooms.find(room => room.roomId === data.roomId);

        if (room)
        {
            var clients = room.clients;
            var client = clients.find(client => client.clientId === data.clientId);
            if (client) client.ready = true;
            
            //방 안에 모두가 true이면 게임시작
            if (clients.length == 2)
            {
                if (clients[0].ready && clients[1].ready)
                {
                    io.to(clients[0].clientId).emit('play', {first: true});
                    io.to(clients[1].clientId).emit('play', {first: false});
                }
            }
        }
    });
    //상대턴
    socket.on('select', function(data) {
        if (!data) return;

        var index = data.index;
        var roomId = data.roomId;
        if (index > -1 && roomId)
        {
            socket.to(roomId).emit('selected', {index: index});
        }
    });
    //클라이언트가 승리했을때
    socket.on('win', function(data) {
        if (!data) return;
        var roomId = data.roomId;
        var index = data.index;
        if (index > -1 && roomId)
        {
            socket.to(roomId).emit('lose', {index: index});
        }
    });

    //클라이언트가 무승부했을때
    socket.on('tie', function(data) {
        if (!data) return;
        var roomId = data.roomId;
        var index = data.index;
        if (index > -1 && roomId)
        {
            socket.to(roomId).emit('tie', {index: index});
        }
    });


    socket.on('disconnect', function(){
      console.log('user disconnected, 서버를 나감');
    });
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});