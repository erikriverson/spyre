app.controller('importController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('import', function(msg) {
            console.log("got import message:");
            console.log(msg.value);
        });
    });
        

    $scope.$watch('ctrlBoundFile', function(newVal, oldVal) {
        if(newVal !== oldVal) {
            WSService.send_r_data('import', $scope.ctrlBoundFile);
        }
    });

    $scope.quandl_import = function(form) {
        console.log("quandl importer called");
        WSService.send_r_data('import_quandl', $scope.quandl_code);
    };
});
