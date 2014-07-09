app.controller('mvController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('mv', function(msg) {
            ggvis.getPlot("ggvis_multivariate").
                parseSpec(JSON.parse(msg.value));
            $scope.object_summary = msg.summary[0];
        });
    });

    $scope.target = {x : "Not Set",
                     y : "Not Set",
                     fill : "Not Set"};

    $scope.select = function(event, object) {
        console.log("this is the event:" + event);
        console.log(object);
        $scope.target[event] = object;
    };
    
    $scope.$watchCollection('target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.target.x, $scope.target.y, $scope.target.fill);
        }
    });

    $scope.mv = function(xvar_target, yvar_target, fill_target) {
        console.log("Calling the mv function with" + xvar_target + "and" + yvar_target + "and" + fill_target);
        var mv_object = {xvar_target : xvar_target.data.object_index, 
                         yvar_target: yvar_target.data.object_index,
                         fill_target: fill_target.data.object_index};

        console.log(mv_object);

        WSService.send_r_data("ggvis_explorer", mv_object);
        return(0);
    };
});
