const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')
var nn = []
function createThumb (arr) {
  let current = arr.pop()
  console.log(current)
  if (current) {
    gm(`./screenshots/${current}.jpg`).thumb(200, 118, `./screenshots/${current}_thumb.jpg`, 70, (err) => {
      if (!err) console.log('thumb done')
      createThumb(arr)
    })
  }
}

fs.readdir('./screenshots/', (err, files) => {
  files.forEach(file => {
    let match = file.match(/(\d\d\d\d-\d\d-\d\dT\d\d_\d\d?)\.jpg/)
    if (match) {
      nn.push(match[1])
    }
  })
  createThumb(nn)
})
