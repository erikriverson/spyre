var app = angular.module('spyre', ['angularBootstrapNavTree']);

app.controller('evalController', function($scope) {
    $scope.eval_me = function() {
        $scope.send_eval_string($scope.eval_string);
        $scope.eval_string = ""; 
    };
});
               


app.controller('iconController',  function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            $scope.send_object(".CLOSING.");
        } else {
            $scope.connect();
        }
    };
});



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

app.controller('MainController', function($scope) {
    // really need the app/app.controller stuff.
    $scope.isConnected = false;
    // so tree does not complain about no data
    $scope.objects = [{label:'hi'}, {label:'bye'}];

    $scope.connect = function() {
        try {
            var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");        

            w_socket
                .bind('objects', function(msg) {
                    console.log(msg);

                    $scope.objects = msg;
                    console.log(msg);

                    $scope.objects_tree = 
                        msg.reduce(function(o, v, i) {
                            o[i] = v.name;
                            return o;
                        }, {});
                    console.log($scope.objects_tree);

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

});

