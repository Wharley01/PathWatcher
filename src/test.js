import Watcher from "./index";

const watcher = new Watcher("TestLive")
    //TestLive is the liveController class specified on the backend
    .setParams({name: 'adewale'})
    //Controller initiation params, this will parsed to TestLive and its methods
    .watch("isLogin","profile")
    /*
    * controller methods to watch, this can be ignored, 
    * Watcher will watch all methods instead
    */
    .start();
    //tell watcher to start watching to changes on Server side


// watcher.SSESend("HELLO WORLD");
// watcher.navigate({"school":"College"});

watcher.onReady((watcher) => {
    //this will execute when watcher has started and now watching


    watcher.listenTo("isLogin",(res) => {
        /*
        *
        * this callback will execute when there is changes to what isLogin method returns in server side, 
        * this will execute at least once then wait for changes
        * `res` is the response data from the method (isLogin)

         */
        // alert("isLoggin Changes");
        console.log("isLogin changed");
        console.log({"islogin-response": res});
    });

    watcher.listenTo("profile",(res,prevRes) => {
        //this listen to changes in profile methods
        console.log("profile changed");
        console.log({"profile": res});
    });

    // document.querySelector("#sender").addEventListener("submit", (e) => {
    //     e.preventDefault();
    //     watcher.send(document.querySelector("#text_input").value);
    //     document.querySelector("#text_input").value = "";
    // });
    // document.querySelector("#navigate").addEventListener("click", (e) => {
    //     e.preventDefault();
    // });

        //this will forces changes to emit in all methods,
});

