const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const webdriver = require('selenium-webdriver')

const PATH_TO_CHROME = '/usr/bin/google-chrome'

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

driver.takeScreenshot().then(base64png => {
  let date = (new Date())
  let file = date.toISOString().replace(/:/g, '_').split('.')[0]
  let buf = new Buffer(base64png, 'base64')
  gm(buf, 'screenshot.png')
  .crop(1100, 650, 262, 80)
  .thumb(320, 190, `screenshots/${file}_thumb.jpg`, 100, function (err) {
    if (!err) console.log('thumb done')
  })
  .write(`screenshots/${file}.jpg`, function (err) {
    if (!err) console.log('done')
  })
})

driver.quit()
