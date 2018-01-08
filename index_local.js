const gm = require('gm').subClass({imageMagick: true})
const webdriver = require('selenium-webdriver')

const PATH_TO_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chromeCapabilities = webdriver.Capabilities.chrome()
chromeCapabilities.set('chromeOptions', {
  binary: PATH_TO_CHROME,
  'args': [
    '--headless',
    '--window-size=1366,768'
  ]
})

const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .withCapabilities(chromeCapabilities)
  .build()

driver.get('https://yandex.ru/pogoda/saint-petersburg/nowcast')
driver.sleep(20000)
let button = driver.findElement(webdriver.By.css('.maps-tutorial button'))
if (button) {
  button.click()
  driver.sleep(1000)
}

driver.takeScreenshot().then(base64png => {
  let date = (new Date())
  let file = date.toISOString().replace(/:/g, '_').split('.')[0].replace(/_\d\d$/, '')
  let minutes = Math.floor(parseInt(file.split('_')[1], 10) / 10) * 10
  file = file.replace(/_\d\d$/, '_' + minutes.toString())

  let buf = new Buffer(base64png, 'base64')
  gm(buf, 'screenshot.png')
  .crop(1100, 650, 262, 80)
  .write(`screenshots/${file}.jpg`, function (err) {
    if (!err) {
      console.log('done')
      gm(`screenshots/${file}.jpg`).thumb(200, 118, `screenshots/${file}_thumb.jpg`, 70, (err) => {
        if (!err) console.log('thumb done')
      })
    }
  })
})

driver.quit()
