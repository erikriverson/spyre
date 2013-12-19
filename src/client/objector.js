var socket;

try {
    socket = new WebSocket("ws://127.0.0.1:7681", "chat");

    socket.onopen = function() {
      document.getElementById("statustd").textContent =
      "Connected to R session at " + socket.url;
      document.getElementById("statustd").style.backgroundColor = "#40f300";
    };

    socket.onmessage = function got_packet(msg) {
        payload = JSON.parse(msg.data);
        
        if(payload.key == "objects") {
            make_rects(payload.value);
        } else if (payload.key == "default") {
            console.log(payload.key + payload.summary);
            show_default(payload.summary);

            var t_data = {
                "xScale": "ordinal",
                "yScale": "linear",
                "yMin": 0,
                "main": [
                    {
                        "data": payload.value
                    }
                ]
            };
            t_data.main[0].className = "." + Math.random().toString(36).substring(7);

            var myChart = new xChart('bar', t_data, '#plot');
        }
    };

    socket.onclose = function(){
        document.getElementById("wsdi_status").textContent =
            " websocket connection CLOSED ";
        document.getElementById("statustd").style.backgroundColor = "#ff4040";
    };
}

catch(ex) {document.getElementById("output").textContent = "Error: " + ex;}

send_object = function(object_name) {
    socket.send(object_name);
    return(0);
};

show_default = function(value) {
//    console.log(value);
    d3.select("p").remove();
    text = d3.select("#output").append("p");
    text.selectAll("pre")
        .data(value)
        .enter()
        .append("pre")
        .text(function(d) { return(d); });

};

make_rects = function (objects) {
    d3.select("svg").remove();
    svg = d3.select("#objects").append("svg");

    svg.selectAll("rect")
        .data(objects)
        .enter()
        .append("rect")
        .attr("x", 100)
        .attr("y", function(d, i) { return((i) * 25);})
        .attr("width", 200)
        .attr("height", 15)
        .attr("fill", "lightblue")
        .on("mouseover", function() {
            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill", "orange");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill", "lightblue");
        })
        .on("click", function(d) {send_object(d);});

    svg.selectAll("text")
        .data(objects)
        .enter()
        .append("text")
        .text(function(d) {return (d);})
        .attr("x", 140)
        .attr("y", function(d, i) { return((i) * 25 + 11);})
        .attr("fill", "black")
        .style("pointer-events", "none");



};


