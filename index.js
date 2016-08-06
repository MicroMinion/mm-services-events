'use strict'

var assert = require('assert')
var _ = require('lodash')

var SUBSCRIPTION_TIMEOUT = 1000 * 60 * 5

var Events = function (options) {
  assert(_.isObject(options))
  assert(_.isObject(options.platform))
  this.platform = options.platform
  assert(_.isObject(options.logger))
  this._log = options.logger
  var events = this
  this.subscribers = {}
  this.platform.messaging.on('self.*', this.processEvent.bind(this))
  this.platform.messaging.on('self.events.subscribe', this.subscribe.bind(this))
  setInterval(function () {
    _.forEach(events.subscribers, function (subscribers, topic) {
      _.forEach(subscribers, function (date, subscriberKey) {
        if (Math.abs(new Date() - date) > SUBSCRIPTION_TIMEOUT) {
          delete events.subscribers[topic][subscriberKey]
        }
      })
      if (_.size(_.keys(events.subscribers[topic])) === 0) {
        delete events.subscribers[topic]
      }
    })
  }, SUBSCRIPTION_TIMEOUT)
}

Events.prototype.processEvent = function (topic, publicKey, data) {
  var self = this
  // debug('processEvent')
  topic = topic.replace('self.', '')
  if (publicKey !== 'local') {
    return
  }
  if (_.has(self.subscribers, topic)) {
    self._log.debug('processEvent - has subscribers')
    _.forEach(self.subscribers[topic], function (date, subscriberKey) {
      self._log.debug('send message to subscriber ' + subscriberKey)
      self.platform.messaging.send(topic, subscriberKey, data, {
        realtime: true,
        expireAfter: 2000
      })
    })
  }
}

Events.prototype.subscribe = function (topic, publicKey, data) {
  if (topic !== 'self.events.subscribe') {
    return
  }
  if (!_.has(this.subscribers, data.topic)) {
    this.subscribers[data.topic] = {}
  }
  if (!_.has(this.subscribers[data.topic], publicKey)) {
    this.subscribers[data.topic][publicKey] = {}
  }
  this.subscribers[data.topic][publicKey] = new Date()
}

module.exports = Events
