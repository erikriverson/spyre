try {
    var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");

    w_socket.bind('open', function() {
        document.getElementById("statustd").textContent =
            "Connected to R session at " + w_socket.socket.url;
        document.getElementById("statustd").style.backgroundColor = "#40f300";
    });

    w_socket.bind('objects', function(msg) {
        update_objects(msg);
    })
    .bind('default', function(msg) {
        show_default(msg.summary);
        
        var t_data = {
            "xScale": "ordinal",
            "yScale": "linear",
            "yMin": 0,
            "main": [
                {
                    "data": msg.value
                }
            ]
        };
        t_data.main[0].className = "." + Math.random().toString(36).substring(7);
        
        var myChart = new xChart('bar', t_data, '#plot');
    });

    w_socket.bind('close',  function(){
        document.getElementById("wsdi_status").textContent =
            " websocket connection CLOSED ";
        document.getElementById("statustd").style.backgroundColor = "#ff4040";
    });
}

catch(ex) {document.getElementById("output").textContent = "Error: " + ex;}

var send_object = function(object_name) {
    w_socket.send("request_objects", object_name);
    return(0);
};

var show_default = function(value) {
    console.log(value);
    d3.select("p").remove();
    var text = d3.select("#output").append("p");
    text.selectAll("pre")
        .data(value)
        .enter()
        .append("pre")
        .text(function(d) { return(d); });

};

var update_objects = function(msg) {
  console.log(msg);  
};


