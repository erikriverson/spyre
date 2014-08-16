

spyre.controller('consoleController', function($scope, WSService) {
    // 'console' automatically registered as callback event

    // use 'console' automatically as the event name with rargs,
    // or include 'console on rargs?


    $scope.rcall = { fun  : 'console', 
                     args : $scope.rargs
                   };

    // does rcall get the latest version of $scope.rargs?
    // we may need to make rcall on $scope, and use an ng-model
    // on the html tab div

    $scope.eval_text = function() {
        WSService.r($scope.rcall); 
    };

});
    

// app.controller('evalController', function($scope, WSService) {
//     $scope.$on('connected', function() {
//         WSService.register_ws_callback('eval_string', function(msg) {
//             console.log("Console logged: " + msg);
//         });
//     });

//     $scope.eval_me = function() {
//         WSService.r("eval_string", $scope.eval_string);
//         $scope.eval_string = ""; 
//     };
// });
