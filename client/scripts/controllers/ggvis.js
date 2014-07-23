app.controller('mvController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('mv', function(msg) {
            console.log('reply from mv');
            ggvis.getPlot("ggvis_multivariate").
                parseSpec(JSON.parse(msg.value));
            $scope.object_summary = msg.summary[0];
        });
    });

    $scope.target = {xvar : "Not Set",
                     yvar : "Not Set",
                     fill : "#000000",
                     stroke : "#000000",
                     size   : 1
                     };

    $scope.select = function(event, object) {
        console.log("this is the event:" + event);
        console.log(object);
        $scope.target[event] = object;
    };
    
    $scope.$watchCollection('target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.target);
        }
    });

    $scope.mv = function(plot_spec) {
        console.log(plot_spec);
        var fill, stroke, size;
        if(typeof(plot_spec.fill) !== "string") {
            console.log('think fill is not a string');
            fill = plot_spec.fill.data.object_index;
        } else {
            fill = plot_spec.fill;
        }                       

        // strings are hex color codes in this case
        if(typeof(plot_spec.stroke) !== "string") {
            stroke = plot_spec.stroke.data.object_index;
        } else {
            stroke = plot_spec.stroke;
        }
        
        var mv_object = {xvar : plot_spec.xvar.data.object_index, 
                         yvar: plot_spec.yvar.data.object_index,
                         fill: fill,
                         stroke : stroke,
                         size   : size};

        console.log("going to call mv with:");
        console.log(mv_object);

        WSService.send_r_data("ggvis_explorer", mv_object);
        return(0);
    };

    $scope.fill_scaled = 'false';
    $scope.stroke_scaled = 'false';
    
});
