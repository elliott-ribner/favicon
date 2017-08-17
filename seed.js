const csv = require('csv-parser')
const fs = require('fs')
const getFaviconForUrl = require('./get-favicon-for-url')
const _ = require('lodash')

const convert = ({min = 0, max = 1000}) => {
  const forSave = []
  let count = 0
  return new Promise((resolve, reject) => {
    fs.createReadStream('./top-1m-test.csv')
      .pipe(csv())
      .on('data', function (data) {
        count++
        if (count >= min && count < max) {
          forSave.push(data)
        }
        if (count >= max) {
          resolve(forSave)
        }
      })
  })
}

const run = ({min, max}) => {
  return convert({min, max})
  .then((topSiteArray) => {
    const chunkedTopSites = _.chunk(topSiteArray, 20)
    chunkedTopSites.reduce((p, chunk) => {
      return p
      .then(() => {
        try {
          const promiseMap = chunk.map((element) => {
            const convertedWebsite = `http://${element.website}`
            console.log(convertedWebsite)
            return getFaviconForUrl(convertedWebsite, true)
            .catch((e) => {
              console.log('error', e)
            })
          })
          return Promise.all(promiseMap)
        } catch (e) {
          return Promise.resolve()
        }
      })
    }, Promise.resolve())
  })
}

module.exports = {
  run
}
