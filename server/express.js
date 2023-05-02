const createBox = require('./createBox');

const _express = (io) => {
  let {generateBox, generateBoxHTML, generateBoxData, generateRandomColors} = createBox()
  let userData = {}

  const messages = {
    success: 'Connected Successfully!',
    error: 'Failed to connect!'
  }

  const connection = (socket) => {
    
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
        let details = {'color':color, username}
        userData[socketID] = {...details}
        
        countUser = Object.keys(userData).length
        // size = countUser < 4 ? 2 : countUser < 9 ? 3 : countUser < 15 ? 4 : countUser < 25 ? 5 : undefined
        // console.log(userData)
        io.emit('boxHTML', generateBoxHTML(size))
        io.emit('players', countUser)
      })
      /////// endof USERS /////// 

      socket.on('box click', (data) => {
        let {boxID, userID, color} = data
        _box.push(boxID)

        userData[userID] = {...userData[userID],'boxes': _box}
        io.emit('box clicked', {boxID, userID, color})

        // console.log(userData)
      })

      socket.on('box digging', (data) => {
        let {boxID, userID, color} = data

        let count = boxData[boxID]['breaks']
        let reward = boxData[boxID]['reward']
        
        if(boxData[boxID]['collapse']) {
          digging = 0
          return false
        }

        if(count == digging) {
          digging = 0      
          boxData[boxID]['collapse'] = true 
          rewards.push(reward)

          io.emit('reward show', [boxID, reward])
          io.to(userID).emit('reward score', {userID, rewards})

          userData[userID] = {...userData[userID],'rewards': rewards}
          console.log('item found...',userData)
        }
        digging += 1
      })
      /////// DISCONNECT ///////
      socket.on('disconnect', () => {
        delete userData[socketID]
      })
    })
  } 

  return {
    connection
  }
}

module.exports = _express