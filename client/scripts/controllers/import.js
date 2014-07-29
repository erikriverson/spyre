app.controller('importController', function($scope, WSService, $upload) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('import', function(msg) {
            console.log("got import message:");
            console.log(msg.value);
        });
    });

    $scope.quandl_import = function(form) {
        console.log("quandl importer called");
        WSService.r('import_quandl', $scope.quandl_code);
    };


    $scope.import_rdata_url = function() {
        console.log('hi');
        WSService.r('import_rdata_url', $scope.rdata_url);
    };

    $scope.import_http = function() {
        WSService.r('import_http_url', $scope.http_url);
    };

    $scope.onFileSelect = function($files) {
        var fileReader = new FileReader();
        fileReader.readAsBinaryString($files[0]);
        fileReader.onload = function(e) {
            WSService.r('import_rdata', fileReader.result);

        };
    };

});
