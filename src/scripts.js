import './index.html'
import './styles.css'

import averageColor from './average_color.js'

const START_DATE = new Date(2017, 7, 21, 0, 0, 0)
const NOW = new Date()

let currentDate = false
if (window.location.search !== '') {
  let matches = (/\?time=([^&]+)/).exec(window.location.search)
  if (matches && matches[1]) {
    let date = new Date(decodeURIComponent(matches[1]))
    if (date.getTime()) currentDate = date
  }
}
if (!currentDate || currentDate > NOW) {
  currentDate = new Date()
  if (currentDate.getMinutes() % 10 === 0) currentDate.setTime(currentDate - (10 * 60 * 1000))
}

if (currentDate < START_DATE) currentDate = START_DATE

let nextDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000))
let prevDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

let dateNode = document.querySelector('[role="date"]')
let datePrevNode = document.querySelector('[role="date-prev"]')
let dateNextNode = document.querySelector('[role="date-next"]')
let timelineNode = document.querySelector('[role="timeline"]')
let mapBgNode = document.querySelector('[role="map-background"]')

function formatHummanDate (date) {
  const monthsArr = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']

  return date.getDate() + ' ' + monthsArr[date.getMonth()] + ' ' + date.getFullYear()
}

function formatTime (date) {
  return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes().toString()).slice(-2)
}

if (new Date(prevDate.toDateString()) < START_DATE) datePrevNode.classList.add('informer-prev--hidden')
if (new Date(nextDate.toDateString()) > NOW) dateNextNode.classList.add('informer-next--hidden')

datePrevNode.innerHTML = formatHummanDate(prevDate)
dateNextNode.innerHTML = formatHummanDate(nextDate)
datePrevNode.setAttribute('href', '/?time=' + prevDate.toISOString())
dateNextNode.setAttribute('href', '/?time=' + nextDate.toISOString())
dateNextNode.onclick = datePrevNode.onclick = function () { window.location.reload() }
dateNode.innerHTML = formatHummanDate(currentDate)

class Timeline {
  constructor (node, start, current, count, step, urlBuilder) {
    this.node = node
    this.start = start
    this.count = count
    this.step = step
    this.current = { value: this._floor(current), index: false }
    this.getUrl = urlBuilder
    this._preloadedImages = []
    this._initBars()
    this._loadFull(this.current.index)
    this._loadThumbs()
    this._setLinks()
  }

  _setLinks () {
    nextDate = new Date(this.current.value + (24 * 60 * 60 * 1000))
    prevDate = new Date(this.current.value - (24 * 60 * 60 * 1000))
    datePrevNode.setAttribute('href', '/?time=' + prevDate.toISOString())
    dateNextNode.setAttribute('href', '/?time=' + nextDate.toISOString())
  }

  _floor (num) {
    return Math.floor(num / this.step) * this.step
  }

  _preloadImage (params, callback) {
    if (this._preloadedImages.indexOf(params.url) !== -1) return callback(false, params)

    let img = new Image()
    img.onload = () => {
      this._preloadedImages.push(params.url)
      callback(img, params)
    }

    img.onerror = () => {
      this._preloadedImages.push(params.url)
      callback(false, params)
    }
    img.src = params.url
  }

  _loadFull (index) {
    mapBgNode.style.filter = 'blur(20px)'
    let blur = 20
    let promise = false
    let unblur = (limit) => {
      if (blur > limit) {
        mapBgNode.style.filter = `blur(${--blur}px)`
        promise = setTimeout(() => {
          unblur(limit)}, 200)
      } else {
        promise = false
      }
    }
    unblur(15)

    this._loadThumb(index, (params) => {
      mapBgNode.style.backgroundImage = `url('${params.url}')`
      if (promise) { clearTimeout(promise) }
      unblur(3)
      this._preloadImage({url: this.bars[index].url.full}, (i, p) => {
        if (promise) { clearTimeout(promise) }
        mapBgNode.style.backgroundImage = `url('${p.url}')`
        mapBgNode.style.filter = 'initial'
      })
    })
  }

  _loadThumbs () {
    this._recursiveLoadThumbs(2, this.current.index - 1)
    this._recursiveLoadThumbs(-2, this.current.index + 1)
    this._recursiveLoadThumbs(-2, this.current.index)
    this._recursiveLoadThumbs(2, this.current.index)
  }

  _loadThumb (index, cb) {
    this._preloadImage({url: this.bars[index].url.thumb, index: index}, (img, params) => {
      if (img) this._updateBar(img, params)
      if (cb !== undefined) cb.call(this, params)
    })
  }

  _updateBar (img, params) {
    let bar = this.bars[params.index]
    bar.node.appendChild(img)
    bar.color = averageColor(img)
    bar.node.style.backgroundColor = bar.color
    this._updateNearestBackgrounds(params.index)
  }

  _updateNearestBackgrounds (index) {
    if (this.bars[index - 1] && this.bars[index - 1].color) { this._updateBackground(this.bars[index - 1], this._getGradentColors(index - 1)) }
    if (this.bars[index + 1] && this.bars[index + 1].color) { this._updateBackground(this.bars[index + 1], this._getGradentColors(index + 1)) }
  }

  _getGradentColors (index) {
    return [
      (this.bars[index - 1] && this.bars[index - 1].color) || 'white',
      this.bars[index].color
    ]
  }

  _updateBackground (bar, colors) {
    bar.node.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]}`
  }

  _recursiveLoadThumbs (step, index) {
    let next = index + step
    if (next < 0 || next >= this.count) return false
    this._loadThumb(next, () => {
      this._recursiveLoadThumbs(step, next)})
  }

  _initBars () {
    this.bars = []
    let value = this.start
    let width = Math.floor(10000 / this.count) / 100

    for (let i = 0; i < this.count; i++) {
      let date = new Date(value)
      let bar = document.createElement('div')
      let time = document.createElement('div')
      time.className = 'timeline-bar-time'
      time.innerHTML = formatTime(date)
      bar.appendChild(time)
      if (date.getMinutes() === 0) {
        let hour = document.createElement('div')
        hour.className = 'timeline-bar-hour'
        hour.innerHTML = ('0' + date.getHours()).slice(-2)
        bar.appendChild(hour)
      }
      bar.className = 'timeline-bar'
      if (i > this.count / 2) bar.className += ' timeline-bar--right'
      if (value === this.current.value) {
        this.current.index = i
        bar.className += ' timeline-bar--active'
      }
      bar.style.width = `${width}%`
      bar.addEventListener('click', ((index) => {
        return () => {
          this.setCurrent(index)
        }
      })(i))
      this.bars.push({node: bar, value: value, url: this.getUrl(value), color: false})
      this.node.appendChild(bar)

      value += this.step
    }
  }

  setCurrent (index) {
    let oldBar = this.bars[this.current.index]
    let newBar = this.bars[index]

    oldBar.node.classList.remove('timeline-bar--active')
    newBar.node.classList.add('timeline-bar--active')

    this.current = {index, value: newBar.value}
    let date = new Date(newBar.value).toISOString()
    window.history.replaceState({}, date, '/?time=' + date)
    this._setLinks()
    datePrevNode.setAttribute('href', '/?time=' + prevDate.toISOString())
    this._loadFull(this.current.index)
  }
}

let timelineStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0)

let urlBuilder = function (time, zoneDiff = 0) {
  let date = new Date(time)
  let file = date.toISOString().replace(/:/g, '_').split('.')[0].replace(/_\d\d$/, '')
  let minutes = Math.round(parseInt(file.split('_')[1], 10) / 10) * 10
  file = file.replace(/_\d\d$/, '_' + minutes.toString())
  return {thumb: `/${file}_thumb.jpg`, full: `/${file}.jpg`}
}
let timeline = new Timeline(timelineNode, timelineStart.getTime(), currentDate.getTime(), 144, 10 * 60 * 1000, urlBuilder)
