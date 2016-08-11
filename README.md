# mm-services-events

Event dispatching service for [MicroMinion platform](https://github.com/MicroMinion/mm-platform)

## Initialization

```js
var MicroMinionPlatform = require('mm-platform')
var Events = require('mm-services-events')

var platform = new MicroMinionPlatform()

var events = new Events({
platform: platform,
logger: platform._log
)}
```

## Messaging API

### Published messages

This service can republish any message that is published on local bus to a remote host given that this remote host has send subscribe message.

### Subscribed messages

Subscribe messages subscribe remote hosts to events published on local bus. Subscriptions expire after 5 minutes.

```js
platform.messaging.send('events.subscribe', remoteHostKey, {topic: topicName})
````
