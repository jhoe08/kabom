const _client = {
  socket: io(),
  app: {
    intro: document.querySelector('#intro'),
    start: document.querySelector('#start'),
    id: document.querySelector('#app'),
    users: document.querySelector('#users'),
    player: document.querySelector('#player'),
    boxes: document.querySelector('#boxes'),
    actions: document.querySelector('#actions'),
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
      <label>${id}</label>
    </div>`

      let html2 = `<div id="userID">${id}</div>
      <div id="score"><label>Points: </label><span>0</span></div>`

      console.log('this.user',this.user)
      return (users.innerHTML = html, player.innerHTML = html2)
    })


    _socket.on('reward show', (data) => {
      let [id, reward] = data
      document.querySelector(`.box[data-id="${id}"]`).setAttribute('data-reward', reward)
    })

    _socket.on('reward score', (data) => {
      let {userID, rewards} = data
      let sum = 0  

      rewards.forEach(reward => {
        sum = sum + parseInt(reward)
      });

      console.log('rewards', rewards)

      return player.innerHTML = `
        <div id="userID">${userID}</div>
        <div id="score"><label>Points: </label><span>${sum}</span></div>`
    })
  },
  BoxActions() {
    let { boxes } = this.app
    let boxesOwn = 0

    let data = {
      boxID: "" ,
      userID: this.user['id'],
      color: this.user['color'],
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
    }
    boxes.onmouseout = e => {
      let target = e.target
      let boxID = target.getAttribute('data-id')

      if(target.classList.contains('box')) {
        target.classList.remove('y-shaking')
      }
    }

    document.body.oncontextmenu = e => {
      // return e.which === 3 ? false : false
    }

  },
  IntroActions() {
    let { start, users, boxes, id } = this.app
    let _socket = this.socket

    start.onclick = e => {
      start.closest('#intro').remove()
      id.classList.remove('hide')

      _socket.emit('connectedUser')

      _socket.on('boxHTML', (html) => {
        boxes.innerHTML = html
        this.BoxActions()
      })
    }

    document.body.oncontextmenu = e => {
      // return e.which === 3 ? false : false
    }
  }
}

export default {..._client}
