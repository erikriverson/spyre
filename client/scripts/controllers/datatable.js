spyre.controller('rawController', function($scope, WSService, $timeout) {
    var get_rawdata; 

    $scope.$on('connected', function() {
        WSService.register_ws_callback('rawdata', function(msg) {
            $scope.rawdata = msg.value;
            $scope.$apply();
        });
    });

    $scope.callr = function(rcall) {
        console.log(rcall.args);
        WSService.r(rcall);
    };

    $scope.rawGridOptions = { data: 'rawdata',
                              showColumnMenu: true};

    $scope.$watch('selected_data', function(newValue, oldValue) {

        get_rawdata = {fun : 'get_rawdata', 
                       args : { 'data' : $scope.selected_data}};

        if(newValue !== oldValue) {
            $scope.callr(get_rawdata);
        }
    });


});
