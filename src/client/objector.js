var iconController = function($scope) {
    $scope.isConnected = false;

    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            $scope.ws.socket.close();
            $scope.isConnected = false;
        } else {
            $scope.connect();
            // need a valid check here to make sure this is true...
            $scope.isConnected = true;
        }
    };

};

var ObjectController = function($scope) {
    $scope.$watch('test', 
                  function() {
                      $scope.objects = $scope.test;
                  });
};


var MainController = function($scope) {

    $scope.connect = function() {
        try {

            var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");        

            w_socket.bind('objects', function(msg) {
                $scope.test = msg;
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
                    t_data.main[0].className = "." + 
                        Math.random().toString(36).substring(7);
                    
                    var myChart = new xChart('bar', t_data, '#plot');
                });
            $scope.ws = w_socket; 
        }

        catch(ex) {document.getElementById("output").textContent = "Error: " + ex;}

    };

    $scope.send_object = function(object_name) {
        w_socket.send("request_objects", object_name);
        return(0);
    };

    $scope.show_default = function(value) {
        console.log(value);
        d3.select("p").remove();
        var text = d3.select("#output").append("p");
        text.selectAll("pre")
            .data(value)
            .enter()
            .append("pre")
            .text(function(d) { return(d); });
        
    };
    
};




