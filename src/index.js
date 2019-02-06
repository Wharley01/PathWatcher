export default function Watcher(controller) {

    if(!controller)
        throw ("Specify Controller to watch");

    this.controller = controller;
    this.server = "path.loc";
    this.port = 443;
    this.watching = [];
    this.params   = {};
    this.listening = {};
    this.socket = null;
    this.onMessageCallback = () => {
        console.error("Set onMessage() function")
    };
    this.onReadyCallback = () => {
        console.log("Set onOpen() function")
    };

    this.onCloseCallback = () => {
        console.log("Set onClose() function")
    };

    this.onErrorCallback = (error) => {
        throw error;
    };

    this.serverConfig = (server, port) => {
        this.server = server;
        this.port = port;
        return this;
    };

    this.watch = (...methods) => {
    this.watching = [...this.watching , ...methods];
    return this;
    };

    this.setParams = (params) => {
      this.params = params;
      return this;
    };

    this.navigate = (params,data = null) => {
      this.params = params;
      let re_data = {
          data: data,
          type:"navigate",
          params: params | {}
      };
      if(!this.socket)
          throw("Initiate Watcher before you navigate");
      this.socket.send(JSON.stringify(re_data));
      return this;
    };

    this.send = (data,func,method = null) => {
        try{
            this.socket.send(data);
            if(func){
                func(this);
            }
        }catch (err){
            throw (err.message);
        }
    };

    this.onMessage = (func) => {
        this.onMessageCallback = func;
        return this;
    };

    this.listenTo = (method,fun) => {
        if(this.watching.indexOf(method) < 0)
            throw("you can only listen to methods you are watching");
        this.listening[method] = fun;
    };

    this.onReady = (func) => {
        this.onReadyCallback = func;
        return this;
    };

    this.onClose = (func) => {
        this.onCloseCallback = func;
        return this;
    };

    this.onError = (func) => {
        this.onErrorCallback = func;
        return this;
    };

    let paramsToStr = () => {
        let str = "";
        for(let key in this.params){
            if(str.length > 0)
                str += `,${key}=${this.params[key]}`;
            else
                str += `${key}=${this.params[key]}`;
        }
        return str;
    };

    this.start = () => {
      let tcp_uri = `ws://${this.server}:${this.port}/${this.controller}/Watch=[${this.watching.join(",")}]&Params=[${paramsToStr()}]`;
      try{
          this.socket =  new WebSocket(tcp_uri);
          this.socket.onmessage = (response) => {
              let _response = JSON.parse(response.data);
              for (let method in _response){
              //    check if there is a listener fr the method already
                  if(this.listening[method]){
                      this.listening[method](_response[method])
                  }
              }
              // this.onMessageCallback(JSON.parse(response));
          };
          this.socket.onclose = this.onCloseCallback;
          this.socket.onopen = () => {
              this.onReadyCallback(this);
          };
      }catch (error){
          this.onErrorCallback(error);
      }

      return this;
    };
    return this;
}