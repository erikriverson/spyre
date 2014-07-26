app.controller('importController', function($scope, WSService, $upload) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('import', function(msg) {
            console.log("got import message:");
            console.log(msg.value);
        });
    });

    $scope.quandl_import = function(form) {
        console.log("quandl importer called");
        WSService.send_r_data('import_quandl', $scope.quandl_code);
    };


    $scope.import_rdata_url = function() {
        console.log('hi');
        WSService.send_r_data('import_rdata_url', $scope.rdata_url);
    };

    $scope.onFileSelect = function($files) {
        var fileReader = new FileReader();
        fileReader.readAsBinaryString($files[0]);
        fileReader.onload = function(e) {
            WSService.send_r_data('import_rdata', fileReader.result);

        };
    };

});
