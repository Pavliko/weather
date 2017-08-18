import 'html-loader!./index.html'
import './styles.css'

const START_DATE = new Date(2017, 8, 17)
let dateNode = document.querySelector('[role="date"]')
let timeNode = document.querySelector('[role="time"]')

function parseDate (string) {
  let timestamp = Date.parse(string)

  return timestamp > 0 ? new Date(timestamp) : false
}

function isValidDate (date) {
  return date >= START_DATE
}

function formatDate (date) {
  const monthsArr = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']

  return date.getDate() + ' ' + monthsArr[date.getMonth()] + ' ' + date.getFullYear()
}

dateNode.innerHTML = formatDate(new Date())
console.log(parseDate('11.05.198dsa'))
