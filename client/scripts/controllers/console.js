app.controller('evalController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('eval_string', function(msg) {
            console.log("Console logged: " + msg);
        });
    });

    $scope.eval_me = function() {
        WSService.send_r_data("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
    };
});
