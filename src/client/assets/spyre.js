var app = angular.module('spyre', ['angularBootstrapNavTree', 'ui.bootstrap',
                                   'ngDragDrop']);

app.controller('mvController', function($scope) {

    // for drag and drop testing
    $scope.xvar_target = [];
    $scope.yvar_target = [];
    
    $scope.$watchCollection('xvar_target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv(newValue, $scope.yvar_target);
        }
    });

    $scope.$watchCollection('yvar_target', function(newValue, oldValue) {
        console.log(newValue + oldValue);
        if(newValue !== oldValue) {
            $scope.mv($scope.xvar_target, newValue);
        }
    });

    $scope.mv = function(xvar_target, yvar_target) {
        console.log("Calling the mv function with" + xvar_target + "and" + yvar_target);
        var mv_object = {xvar_target : xvar_target[0].data.object_index, 
                         yvar_target: yvar_target[0].data.object_index};

        console.log(mv_object);

        $scope.ws.send("mv", mv_object);
        return(0);
    };
});

app.controller('tabsController', function($scope) {
    $scope.tabs = [{title:'Object Explorer', content:'stuff'}, 
                   {title:'Data Explorer', content:'stuff'}, 
                   {title:'Plotting', content:'stuff'}, 
                   {title:'Regression', content:'stuff'}, 
                   {title:'Console',content:'more stuff'}];
});

app.controller('evalController', function($scope) {

    $scope.eval_me = function() {
        $scope.ws.send("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
    };
});

app.controller('iconController',  function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            $scope.ws.send("CLOSE", {});
            $scope.isConnected = false;
        } else {
            $scope.connect();
        }
    };
});

app.controller('MainController', function($scope) {
    // really need the app/app.controller stuff.
    $scope.isConnected = false;
    // so tree does not complain about no data
    $scope.objects_tree = [];

    $scope.connect = function() {
        try {
            var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");        

            w_socket
                .bind('objects', function(msg) {
                    console.log("Object of Objects:");
                    console.log(msg);

                    $scope.objects = msg;
                    $scope.objects_tree = msg;
                    
                    $scope.$apply();
                })
                .bind('uv', function(msg) {
                    ggvis.getPlot("ggvis_univariate").
                        parseSpec(JSON.parse(msg.value));
                    
                    $scope.object_summary = msg.summary[0];
                    $scope.$apply();
                })
                .bind('mv', function(msg) {
                    ggvis.getPlot("ggvis_multivariate").
                        parseSpec(JSON.parse(msg.value));

                })
                .bind('eval_string', function(msg) {
                    console.log("Console logged: " + msg);
                });
        }
                     
        catch(ex) { 
            console.log("Caught exception!");
            $scope.isConnected = false; 
        };

        $scope.ws = w_socket; 
        $scope.isConnected = true;

    };

    $scope.tree_control = {};

    $scope.send_object = function(event, object_name) {
        $scope.ws.send(event, object_name);
        return(0);
    };

    $scope.tree_control_test = function(branch) {
        // We want send_object to behave differently depending on the
        // active tab, so pass in event?  how do we get some data
        // associated with the active tab, like its id?
        $scope.send_object("uv", branch.data.object_index);
    };

    $scope.items = [
        'The first choice!',
        'And another choice for you.',
        'but wait! A third!'
    ];

    $scope.status = {
        isopen: false
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };

});
