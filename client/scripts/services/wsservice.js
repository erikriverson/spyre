app.factory('WSConnect', function() {
    var WSConnect = {};

    WSConnect.connect = function(ws_url) {
        WSConnect.ws = new FancyWebSocket(ws_url);
        if(ws_url === undefined) {
            WSConnect.ws.send = {};
            WSConnect.ws.bind = {};
        }
    };

    return WSConnect;
    
});

app.factory('WSService', function(WSConnect) {
    return {
        r: function(fun, data) {
	    return WSConnect.ws.send(fun, data);
        },
        register_ws_callback: function(event, callback) {
            return WSConnect.ws.bind(event, callback);
        }
    };
});
