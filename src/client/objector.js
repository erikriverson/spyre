var evalController = function($scope) {
    $scope.eval_me = function() {
        $scope.send_eval_string($scope.eval_string);
        $scope.eval_string = ""; 
    };
};

var iconController = function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            $scope.send_object(".CLOSING.");
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

var drawBar = function(msg) {
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
};

var MainController = function($scope) {
    $scope.isConnected = false;

    $scope.connect = function() {
        try {
            var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");        

            w_socket
                .bind('objects', function(msg) {
                    console.log(msg);

                    $scope.test = msg;
                    $scope.$apply();
                })
                .bind('default', function(msg) {
                    console.log(msg);

                    $scope.object_summary = msg.summary[0];
                    $scope.$apply();
                    
                    drawBar(msg);
                    
                });
        }

        catch(ex) { 
            console.log("Caught exception!");
            $scope.isConnected = false; 
        };

        $scope.ws = w_socket; 
        $scope.isConnected = true;

    };

    $scope.send_object = function(object_name) {
        $scope.ws.send("request_objects", object_name);
        
        if(object_name === ".CLOSING.") {
            $scope.isConnected = false;
        }
        return(0);
    };

    $scope.send_eval_string = function(eval_string) {
        $scope.ws.send("eval_string", eval_string);
        return(0);
    };

    
};
