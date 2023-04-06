const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const createBox = require('./createBox');
const { count } = require('console');

const app = express();
const router = express.Router();

const clientPath = `${__dirname}/../client`;
const SERVER_PORT = 4000;

router.get('/', function(req, res, next) {
  res.end()
})

app.use('/', express.static(clientPath));


const server = http.createServer(app);
const io = socketio(server);

let {generateBox, generateBoxHTML, generateBoxData, generateRandomColors} = createBox()
let userData = {}

io.on('connection', async (socket) => {
  let size = 10
  let socketID = socket.id
  let color = generateRandomColors()
  let boxData = generateBoxData(size)
  let _box = []  
  let digging = 0
  let rewards = []

  ///////////////////////////
  socket.join(socketID)
  ////////// USERS //////////
  io.to(socketID).emit('dataToUser', {'id': socketID, 'color': color})

  socket.on('connectedUser', username => {
    userData[socketID] = {'color':color, username}
    
    countUser = Object.keys(userData).length
    // size = countUser < 4 ? 2 : countUser < 9 ? 3 : countUser < 15 ? 4 : countUser < 25 ? 5 : undefined
    console.log(userData)
    io.emit('boxHTML', generateBoxHTML(size))
  })
  /////// endof USERS /////// 

  socket.on('box click', (data) => {
    let {boxID, userID, color} = data
    _box.push(boxID)

    userData[userID] = {'boxes': _box}
    io.emit('box clicked', {boxID, userID, color})

    // console.log(data)
  })

  socket.on('box digging', (data) => {
    let {boxID, userID, color} = data

    // console.log(data)

    let count = boxData[boxID]['breaks']
    let reward = boxData[boxID]['reward']
    
    // console.log('reward', reward)
    
    if(boxData[boxID]['collapse']) {
      digging = 0
      // console.log('collapsed...')
      return false
    }

    if(count == digging) {
      digging = 0      
      // console.log('found item!', reward)
      boxData[boxID]['collapse'] = true 
      rewards.push(reward)

      io.emit('reward show', [boxID, reward])
      io.to(userID).emit('reward score', {userID, rewards})

      // console.log('item found...')
    }
    // console.log(`digging... ${count} - ${digging}`)
    digging += 1
  })
  /////// DISCONNECT ///////
  socket.on('disconnect', () => {
    delete userData[socketID]
  })

  
})



/////////////// endof io.on('connection') ///////////////

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(SERVER_PORT, () => {
  console.log('Server started on', SERVER_PORT);
});