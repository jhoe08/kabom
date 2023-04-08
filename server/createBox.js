const createBox = () => {

  let boxData = {}

  const generateBox = (size) => {
    return size * size
  }

  const generateBoxHTML = (size) => {
    let boxes = size * size;
    
    let html = '<div class="boxes flex column alignItemsCenter justifyContentCenter">'
      for (let index = 1; index <= boxes; index++) {
        if(index % size == 1) {
          html += `<div class="row flex tile3">`
        }        
        html += `<div data-id="${index}" class="box block${randomNumber(3)}"></div>`
        if(index % size == 0) {
          html += '</div>'
        }
       
      }
      html += '</div>'
      return html
  }

  const generateBoxData = (size) => {
    
    const total = size * size

    for (let index = 1; index <= total; index++) {
      let reward = randomNumber(6)
      boxData[index] = {
        'breaks' : randomNumber(20), 
        'reward' : (reward === 0) ? '-5' : reward,
        'collapse': false,
      }
    }
    return boxData
  }

  const randomColor = () => {
    var r = Math.floor(Math.random() * 6)
    return r;
  } 

  const randomNumber = (limit=9) => {
    return Math.floor(Math.random() * limit)
  }

  const generateRandomColors = () => {
      var hexValues = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e"];
      var newColor = "#";
      
      for ( var i = 0; i < 6; i++ ) {
        var x = Math.round( Math.random() * 14 );
        var y = hexValues[x];
        newColor += y;
      }
      return newColor
  }

  return {
    generateBox, generateBoxHTML, generateBoxData, generateRandomColors
  }
}

module.exports = createBox