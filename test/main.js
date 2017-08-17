const DataCollector = require('../data-collector')
const {expect} = require('chai')
require('mocha')
const mongooseWrapper = require('../mongoose-wrapper')
const getFaviconForUrl = require('../get-favicon-for-url')
const request = require('supertest')
const server = require('../server')

describe('fetch methods', () => {
  beforeEach(() => {
    return mongooseWrapper.clearSites()
  })
  it('fetches url using guess', () => {
    const DataCollectorInstance = new DataCollector('http://www.google.com')
    return DataCollectorInstance.getFaviconByUrl()
    .then(() => {
      expect(DataCollectorInstance.faviconUrl).to.eql('http://www.google.com/favicon.ico')
    })
  })
  it('fetches html', () => {
    const DataCollectorInstance = new DataCollector('http://www.google.com')
    return DataCollectorInstance.getMarkUpByUrl()
    .then(() => {
      expect(DataCollectorInstance.faviconUrl).to.eql(undefined)
      const splitHTML = DataCollectorInstance.html.split('>')
      expect(splitHTML[0]).to.eql('<!doctype html')
    })
  })
  it('sorts through the html and provides icon', () => {
    const DataCollectorInstance = new DataCollector('https://www.w3.org')
    return DataCollectorInstance.getMarkUpByUrl()
    .then(() => DataCollectorInstance.findIconWithMarkUp())
    .then(() => {
      expect(DataCollectorInstance.faviconUrl).to.eql('https://www.w3.org/2008/site/images/favicon.ico')
    })
  })
  it('follows redirects', () => {
    const DataCollectorInstance = new DataCollector('http://www.gogle.com') // google with one o - typo
    return DataCollectorInstance.getMarkUpByUrl()
    .then(() => {
      expect(DataCollectorInstance.redirectUrl).to.eql('https://www.google.com/')
    })
  })
  it('saves info after full round', () => {
    const DataCollectorInstance = new DataCollector('https://www.w3.org')
    return DataCollectorInstance.findAndSave()
    .then(() => {
      return mongooseWrapper.findOneSite({})
    })
    .then((site) => {
      expect(site.redirect_url).to.eql('https://www.w3.org/')
      expect(site.original_url).to.eql('https://www.w3.org')
      expect(site.fav_url).to.eql('https://www.w3.org/favicon.ico')
      expect(site.created).to.exist
    })
    .then(() => {
      return getFaviconForUrl('https://www.w3.org', false)
    })
    .then((result) => {
      expect(result).to.eql('https://www.w3.org/favicon.ico')
    })
  })

  it('calls get favicon on non existing url', () => {
    return getFaviconForUrl('https://www.w3.org', false)
    .then((result) => {
      expect(result).to.eql('https://www.w3.org/favicon.ico')
    })
  })

  it('calls get favicon on non existing url, then recalls with getFreshTrue', () => {
    return getFaviconForUrl('https://www.w3.org', false)
    .then((result) => {
      expect(result).to.eql('https://www.w3.org/favicon.ico')
    })
    .then(() => getFaviconForUrl('https://www.w3.org', true))
    .then((result) => {
      expect(result).to.eql('https://www.w3.org/favicon.ico')
    })
  })

  it('/get-favicon', function (done) {
    request(server)
      .post('/get-favicon')
      .send({
        "url": "http://www.google.com"
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .end(function (err, resp) {
        if (err) {
          expect(err).to.eql(undefined)
          done()
        }
        expect(resp.text).to.eql('http://www.google.com/favicon.ico')
        done()
      })
  })
})
