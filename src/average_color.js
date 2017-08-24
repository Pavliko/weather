module.exports = function (imgEl) {
  var blockSize = 5
  var defaultRGB = {r: 0, g: 0, b: 0}
  var canvas = document.createElement('canvas')
  var context = canvas.getContext && canvas.getContext('2d')
  var data, width, height
  var i = -4
  var length
  var rgb = {r: 0, g: 0, b: 0}
  var count = 0

  if (!context) { return defaultRGB }

  height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width

  context.drawImage(imgEl, 0, 0)

  try {
    data = context.getImageData(0, 0, width, height)
  } catch (e) {
    /* security error, img on diff domain */alert('x')
    return defaultRGB
  }

  length = data.data.length

  while ((i += blockSize * 4) < length) {
    ++count
    rgb.r += data.data[i]
    rgb.g += data.data[i + 1]
    rgb.b += data.data[i + 2]
  }

  return `rgb(${Math.floor(rgb.r / count)},${Math.floor(rgb.g / count)},${Math.floor(rgb.b / count)})`
}
