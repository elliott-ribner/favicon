const DataCollector = require('./data-collector')

const getFaviconForUrl = (url, getFresh) => {
  const DataCollectorInstance = new DataCollector(url)
  if (getFresh) {
    return DataCollectorInstance.findAndSave()
  } else {
    return DataCollectorInstance.checkForExisting()
    .then((existing) => {
      if (existing) {
        return existing.fav_url
      } else {
        return DataCollectorInstance.findAndSave()
      }
    })
  }
}

module.exports = getFaviconForUrl
