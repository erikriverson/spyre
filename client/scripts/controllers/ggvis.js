spyre.controller('mvController', function($scope, WSService) {
    $scope.$on('connected', function() {

        WSService.register_ws_callback('mv', function(msg) {
            ggvis.getPlot("ggvis_multivariate").
                parseSpec(JSON.parse(msg.value));
            $scope.object_summary = msg.summary[0];

        });
    });

    $scope.callr = function(rcall) {
        WSService.r(rcall);
    };



    $scope.ggvis = {props : { xvar : "Not Set",
                              yvar : "Not Set",
                              fill : "#000000",
                              stroke : "#000000",
                              size   : 50
                            }
                   };

    $scope.ggvis.set_prop = function(event, object) {
        console.log(object);
        $scope.ggvis.props[event] = object;
    };
    
    $scope.$watchCollection('ggvis.props', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.ggvis.props);
        }
    });

    $scope.mv = function(plot_spec) {
        var fill, stroke, size;

        if(typeof(plot_spec.fill) !== "string") {
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
        
        var mv_object = { xvar : plot_spec.xvar.data.object_index, 
                          yvar: plot_spec.yvar.data.object_index,
                          fill: fill,
                          stroke : stroke,
                          size   : plot_spec.size};

        console.log("going to call mv with:");
        console.log(mv_object);

        $scope.callr({fun:"ggvis_explorer", args : {mv_object : mv_object}});
        return(0);
    };

    $scope.fill_scaled = 'false';
    $scope.stroke_scaled = 'false';
    
});
