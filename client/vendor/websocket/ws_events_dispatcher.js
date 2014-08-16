/* Ismael Celis 2010
 Simplified WebSocket events dispatcher (no channels, no users)
 
 var socket = new FancyWebSocket();
 
 // bind to server events
 socket.bind('some_event', function(data){
 alert(data.name + ' says: ' + data.message)
 });
 
 // broadcast events to all connected users
 socket.send( 'some_event', {name: 'ismael', message : 'Hello world'} );
 */

var FancyWebSocket = function(url) {
    var conn = new WebSocket(url);
    this.socket = conn;
    
    var callbacks = {};
    
    this.bind = function(event_name, callback) {
        callbacks[event_name] = callbacks[event_name] || [];
        callbacks[event_name].push(callback);
        return this; // chainable
    };
    
    this.send = function(rcall) {
        var payload = JSON.stringify(rcall);
        conn.send( payload ); // <= send JSON data to socket server
        return this;
    };
    
    // dispatch to the right handlers
    conn.onmessage = function(evt){
        var json = JSON.parse(evt.data);
        console.log('onmessage');
        console.log(json);
        dispatch(json.event, json.data);
    };
    
    conn.onclose = function() {
        dispatch('close',null);
    };

    conn.onopen = function() {
        dispatch('open', null);
    };
    
    var dispatch = function(event_name, message) {
        var chain = callbacks[event_name];
        if(typeof chain == 'undefined') return; // no callbacks for this event
        for(var i = 0; i < chain.length; i++){
            chain[i]( message );
        }
    };
};
