const Site = require('./site')

module.exports = {
  findOneSite: (selector) => {
    return Promise.resolve()
    .then(() => {
      return Site.findOne(selector)
      .then((result) => {
        return result
      })
    })
    .catch((e) => {
      console.log('error on find one site', e)
    })
  },
  findMostRecent: (selector) => {
    return Promise.resolve()
    .then(() => {
      return Site.find(selector).sort({created: -1}).limit(1)
      .then((result = []) => { 
        return result[0] || null
      })
    }).catch((e) => {
      console.log('error in find most recent',e)
    })

  },
  clearSites: () => {
    return Promise.resolve()
    .then(() => {
      return Site.remove()
      .then((result) => {
        return Promise.resolve()
      })
    })
    .catch((e) => {
      console.log('error on clear sites', e)
    })
  }
}
