const request = require('request')
const cheerio = require('cheerio')
const _ = require('lodash')
const Site = require('./site')
const mongooseWrapper = require('./mongoose-wrapper')

class DataCollector {
  constructor (url) {
    this.websiteUrl = url
    this.redirectUrl = undefined
    this.html = undefined
    this.faviconUrl = undefined
  }
  getFaviconByUrl () {
    return new Promise((resolve, reject) => {
      const concatenatedUrl = `${this.websiteUrl}/favicon.ico`
      const options = {}
      setTimeout(() => { // hack to end these calls sooner if website is unresponsive
        resolve(null)
      }, 5000)
      request.get(concatenatedUrl, options, (err, resp) => {
        if (err) {
          reject(err)
        } else {
          if (resp.statusCode = 200) {
            this.faviconUrl = concatenatedUrl
          }
          resolve(resp)
        }
      })
    })
  }
  getMarkUpByUrl () {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // hack to end these calls sooner if website is unresponsive
        resolve(null)
      }, 5000)
      const options = {}
      request.get(this.websiteUrl, options, (err, resp) => {
        if (err) {
          reject(err)
        } else {
          if (!this.redirect) {
            this.redirectUrl = _.get(resp, 'request.uri.href')
          }
          this.html = resp.body
          resolve(resp)
        }
      })
    })
  }
  findIconWithMarkUp () {
    if (!this.html) { throw new Error('HTML has not yet been scraped') }
    const $ = cheerio.load(this.html)
    const iconObject = $('link').attr('rel', 'icon')
    for (let key in iconObject) {
      const subObject = iconObject[key]
      const href = _.get(subObject, 'attribs.href') || ''
      const splitHref = href.split('.')
      const fileType = splitHref[splitHref.length - 1] || ' '
      const fileTypeLowerCase = fileType.toLowerCase()
      if (fileTypeLowerCase === 'ico' || fileTypeLowerCase === 'png' || fileTypeLowerCase === 'gif') {
        const favicon = `${this.websiteUrl}${href}`
        this.faviconUrl = favicon
        return favicon // we have found favicon - can exit early
      }
    }
    return null
  }
  saveInfo (failed) {
    const siteDoc = new Site({
      original_url: this.websiteUrl,
      redirect_url: this.redirectUrl,
      fav_url: this.faviconUrl,
      created: new Date(),
      failed: failed || false
    })
    return new Promise((resolve, reject) => {
      siteDoc.save((err) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  checkForExisting () {
    return mongooseWrapper.findMostRecent({original_url: this.websiteUrl})
    .then((result) => {
      return result
    })
    .catch((e) => {
      console.log('error in check for existing', e)
    })
  }

  findAndSave () {
    if (!this.websiteUrl) { throw new Error('You must first instantiate with the web url') }
    return this.getFaviconByUrl()
    .then(() => this.getMarkUpByUrl())  //  icon already found in first step - we merely fetched url to record redirect
    .then(() => {
      if (!this.faviconUrl) {
        return this.findIconWithMarkUp()
      }
    })
    .then(() => this.saveInfo())
    .then(() => this.faviconUrl)
    .catch((e) => {
      console.log('error on website:', this.websiteUrl)
      console.log('error running find and save:', e)
      return this.saveInfo(true) // save as failure
    })
  }
}

module.exports = DataCollector
