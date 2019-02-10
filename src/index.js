// import config from "PathRoot/project.pconf.json";
import config from "../../../../Path/project.pconf.json";
import axios from "axios";

// "http://path.loc/SSE/test/watch?Methods=profile,isLoggedIn&Params=[name=wale%20fgfgfgfg,school=trying%20this%20now]"

export default function Watcher(controller,watch_method = "SSE") {
    if(!controller)
        throw ("Specify Controller to watch");
    if(watch_method === "WS"){
        if(!config.WEBSOCKET.host)
            throw ("Specify WebSocket host in path/pconf.json");
        if(!config.WEBSOCKET.port)
            throw ("Specify WebSocket port in path/pconf.json");
    }

    let parsedUrl = new URL(window.location.href);


    this.SSE_url = "";
    this.watch_method = watch_method;
    this.controller = controller;
    this.SSE_url = `${parsedUrl.protocol}//${parsedUrl.host}/SSE/${controller}`;
    console.log(this.SSE_url);
    this.server = config.WEBSOCKET.host;
    this.port = config.WEBSOCKET.port;
    this.watching = [];
    this.params   = {};
    this.listening = {};
    this.socket = null;
    this.SSE_instance = "";
    this.onMessageCallback = () => {
        // console.error("Set onMessage() function")
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

    this.navigate = async (params,data = null) => {
      this.params = params;
      let re_data = {
          data: data,
          type:"navigate",
          params: params | {}
      };

      this.params = params;

      if(!this.socket && this.watch_method === "WS")
          throw("Initiate Watcher before you navigate");
      if(this.watch_method === "SSE"){
          try{
              let nav = await axios.get(buildURL("navigate",data));
          }catch (e){
              throw (e.message);
          }
          console.log("changing the instance")
      }else{
          this.send(JSON.stringify(re_data));
      }
      return this;
    };

    let buildURL = (action,message) =>{
        let _URL = `${this.SSE_url}/${action}`;
        let parsedUrl = new URL(_URL);
        parsedUrl.searchParams.set("Params",paramsToStr());
        parsedUrl.searchParams.set("Methods",this.watching.join(","));
        if(message){
            parsedUrl.searchParams.set("message",message);
        }
        return parsedUrl.toString();
    };

    this.SSESend = async (data) => {
        try{
            let fetch = await axios.get(buildURL("message",data))
        }catch (e){
            throw (e.message)
        }
        return this;
    };

    this.send = (data,func) => {
        try{
            if(this.watch_method === "WS"){
                this.socket.send(data);
            }else if(this.watch_method === "SSE"){
                this.SSESend(data);
            }
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

    const paramsToStr = () => {
        let str = "";
        for(let key in this.params){
            if(str.length > 0)
                str += `,${key}=${this.params[key]}`;
            else
                str += `${key}=${this.params[key]}`;
        }
        return str;
    };
    const resetConnection = async () => {
        try{
            let reset = await axios.get(buildURL("reset"));
            return true;
        }catch (e){
            throw (e.message);
        }
    };
    this.start = () => {
        if(this.watch_method === "SSE"){
            this.startSSE();
        }else{
            this.startWS();
        }
        return this;
    }
    this.startSSE = async () => {
        if (!!window.EventSource) {
            try{
                let reset = await axios.get(buildURL("reset"));

                    this.SSE_instance = new EventSource(buildURL("watch"));
                this.SSE_instance.onopen = () => {
                   this.onReadyCallback(this);

                    for (let method in this.listening) {
                        this.SSE_instance.addEventListener(method,(response) => {
                            let _response = JSON.parse(response.data);
                            this.listening[method](_response[0],_response[1]);
                        })
                    }
                };

                return true;
            }catch (e){
                throw (e.message);
            }

        }else{
            throw ("SSE not supported on this device");
        }
    };

    this.startWS = () => {
      let tcp_uri = `ws://${this.server}:${this.port}/${this.controller}/Watch=[${this.watching.join(",")}]&Params=[${paramsToStr()}]`;
      try{
          this.socket =  new WebSocket(tcp_uri);
          this.socket.onmessage = (response) => {
              let _response = JSON.parse(response.data);
              for (let method in _response){
              //    check if there is a listener fr the method already
                  if(this.listening[method]){
                      this.listening[method](_response[method][0],_response[method][1])
                  }
              }
              this.onMessageCallback(_response);
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

    this.close = () => {
        if(this.watch_method === "WS"){
            this.socket.close();
        }else if(this.watch_method === "SSE"){
            this.SSE_instance.close();
        }
        return this;
    };

    return this;
};


