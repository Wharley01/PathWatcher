# PathWatcher

Path Watcher is a javascript library for interacting with Path's Live Controller, Path Watcher is based on WebSocket and Server-sent-event(SSE).

## Installation

Using npm

```bash
$ npm i --save @__path/watcher
```

Using Yarn(recommended)

```bash
$ yarn add @__path/watcher
```

## Usage

Configure Watcher in `./path/project.pconf.json`, Set method to how you want Path watcher to work (WS or SSE)

```json
  "WATCHER": {
    "method": "WS",//change this to SSE/WS
    "WEBSOCKET": {
      "host": "yourLocalHost.test",
      "port": 443,
      "scheme": "SSL"
    }
  }

```

Import for Usage

```javascript
import Watcher from "@__path/watcher";
```

Instantiate, Set Live Controller name and proceed to listening to changes

```javascript
let watcher =  new Watcher('TestChanges')
//here we are referencing the class we created earlier
                   .watch('prop')//we told path-watcher which of the properties to watch, this case we are watching $prop property
                   .setParams({
                       key1:'a value',
                       anotherKey:'another value'
                   })//we are adding additional infos that can be retrieved from the server side with `getParam()` method of WatcherInterface instance.
watcher.onReady(watcher => {
    // here, we can assign functions to be executed when a particular property changes
    watcher.listenTo("prop", response => {
// we assign an anonymous function to execute when $prop changes on server side
//the `response` parameter will be an object where key "data" will be our property's value

        let is_logged_in = response.data;
// extract the data
        if(is_logged_in !== 'yes'){
            location.href = '/logout'
        }
    })
})
watcher.start();//tell path to begin watching

```
