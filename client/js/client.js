const _client = {
  socket: io(),
  app: {
    intro: document.querySelector('#intro'),
    start: document.querySelector('#start'),
    id: document.querySelector('#app'),
    users: document.querySelector('#users'),    
    boxes: document.querySelector('#boxes'),
    actions: document.querySelector('#actions'),
    items: document.querySelector('#items'),
  }, 
  players: {
    id: document.querySelector('#players'),
    userID: document.querySelector('#userID'),
    score: document.querySelector('#score'),
    ranks: document.querySelector('#ranks'),
  },
  sound: {
    hitRock: document.querySelector('#hit-rock'),
    powerUp1: document.querySelector('#power-up-1'),
    powerUp2: document.querySelector('#power-up-2'),
    powerUp3: document.querySelector('#power-up-3'),
    powerUp4: document.querySelector('#power-up-4'),
    smallBomb: document.querySelector('#small-bomb'),
  },  
  message: {
    success: "Connected Successfully...",
    error: "Failed to connect the server..."
  },
  user: {},
  init() {
    if(this.app.id === null) return
    
    this.IntroActions()

    let { users, boxes, actions } = this.app
    let { ranks } = this.players
    let _socket = this.socket
      

    const {success, error} = this.message

    if(!this.socket) {
      console.log(error)
      return
    };
   
    _socket.on('box clicked', (data) => {
      let {boxID, userID, color} = data
      let hub = document.querySelector(`.box[data-id="${boxID}"]`)
      
      hub.classList.add('active')
      hub.setAttribute('data-own', userID)
      // hub.style.backgroundColor = color
    })

    _socket.on('dataToUser', (data) => {
      let {id, color} = data
      
      this.user['id'] = id
      this.user['color'] = color

      let html = `<div class="flex alignItemsCenter">
        <div class="box circle" style="background-color: ${color}"></div>
        <div class="form__group ">
          <input type="text" class="form__field" placeholder="Username" name="username" id="username">
          <label for="username" class="form__label">${id}</label>
        </div>
      
      </div>`

      console.log('this.user',this.user)
      // return (users.innerHTML = html, player.innerHTML = html2)
      return users.innerHTML = html
    })

    _socket.on('reward show', (data) => {
      let [id, reward] = data
      document.querySelector(`.box[data-id="${id}"]`).setAttribute('data-rewards', reward)
    })

    _socket.on('reward score', (data) => {
      let {userID, rewards} = data
      let {items} = this.app
      let {score} = this.players
      let sum = 0  

      let html = ''

      let uniqs = rewards.reduce((acc, val) => {
        acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
        return acc;
      }, {});

      for (var key in uniqs) {
        if (uniqs.hasOwnProperty(key)) {
            sum = sum + parseInt(key)
            html +=`<div class="box" data-rewards="${key}"><span>x${uniqs[key]}</span></div>`
        }
      }

      items.innerHTML = html
      score.querySelector('span').innerHTML = sum
    })

    _socket.on('soundEffects', (data) => {
    })

    _socket.on('players', (data) => {
      ranks.querySelector('span').innerHTML = `${0} of ${data}`
    })

    // document.body.innerHTML += this.SoundEffects()
  },
  BoxActions() {
    let { boxes } = this.app
    let { userID } = this.players
    let { hitRock, powerUp1, smallBomb } = this.sound

    let boxesOwn = 0

    let data = {
      boxID: "" ,
      userID: this.user['id'],
      username: this.user['username'],
      color: this.user['color'],
    }    

    userID.innerHTML = data.username ? data.username : data.userID

    boxes.oncontextmenu = e => {
      return e.which !== 3 ?'': false
    }

    boxes.onclick = e => {
      let target = e.target
      data['boxID'] = target.getAttribute('data-id')

      if(target.classList.contains('box')) {
        // if(boxesOwn === 1) return

        if(!target.getAttribute('data-own')) {
          boxesOwn++
          let active = target.classList.toggle('active')
          target.setAttribute('data-own', this.user['id'])
          this.socket.emit('box click', data)          
        }
        if(target.hasAttribute('data-rewards')) {
          if(target.dataset.reward != 0 && target.dataset.reward != '-5') {
            powerUp1.currentTime = 0.5
            powerUp1.play()
          } else {
            smallBomb.play()
          }
        } else {
          hitRock.currentTime = 0.2
          hitRock.play()
        }

        // smallBomb.play()
        
      }
    }
    boxes.onmousedown = e => {
      let target = e.target
      data['boxID'] = target.getAttribute('data-id')

      if(target.classList.contains('box') ) {
        target.classList.add('y-shaking')
        this.socket.emit('box digging', data)
      }
    }
    boxes.onmouseup = e => {
      let target = e.target
      data['boxID'] = target.getAttribute('data-id')

      if(target.classList.contains('box')) {
        target.classList.remove('y-shaking')        
      }
      this.resetSound()
    }
    boxes.onmouseout = e => {
      let target = e.target
      let boxID = target.getAttribute('data-id')

      if(target.classList.contains('box')) {
        target.classList.remove('y-shaking')
      }
      this.resetSound()
    }
  },
  IntroActions() {
    let { start, users, boxes, id } = this.app
    let _socket = this.socket

    start.onclick = e => {
      let username = users.querySelector('#username').value

      start.closest('#intro').remove()
      id.classList.remove('hide')

      _socket.emit('connectedUser', username)
      this.user['username'] = username

      _socket.on('boxHTML', (html) => {
        boxes.innerHTML = html
        this.BoxActions()
      })
    }

    document.body.oncontextmenu = e => {
      // return e.which === 3 ? false : false
    }
  },
  SoundEffects() {
    let audio = ['hit-rock', 'power-up-1', 'power-up-2', 'power-up-3', 'power-up-4', 'small-bomb']
    let html = `<div class="audios">`
    audio.forEach(au => {
      html += `<audio id="${au}"><source src="/sounds/${au}.mp3" type="audio/mpeg"></audio>`
    });
    html += `</div>`

    return html
  },
  resetSound() {
    let { hitRock, powerUp1, smallBomb } = this.sound

    hitRock.pause()
    powerUp1.pause()  
    smallBomb.pause()

    hitRock.currentTime = 0
    powerUp1.currentTime = 0    
    smallBomb.currentTime = 0
  },
}

export default {..._client}
