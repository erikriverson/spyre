var iconController = function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            $scope.send_object(".CLOSING.");
            console.log('isConnected is now: ' + $scope.isConnected);
        } else {
            $scope.connect();
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
    $scope.isConnected = false;

    $scope.connect = function() {
        try {

            var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");        

            w_socket.bind('objects', function(msg) {
                console.log(msg);
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
            $scope.isConnected = true;
            console.log('isConnected is now: ' + $scope.isConnected);
        }

        catch(ex) { 
            console.log("Caught exception!");
            $scope.isConnected = false; 
        };
    };

    $scope.send_object = function(object_name) {
        $scope.ws.send("request_objects", object_name);
        
        if(object_name === ".CLOSING.") {
            $scope.isConnected = false;
        }
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




