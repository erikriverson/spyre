// let's try re-writing this in new style

spyre.controller('importController', function($scope, WSService) {

    $scope.callr = function(rcall) {
        WSService.r(rcall);
    };

    $scope.import_rdata_url = 
        { fun  : 'import_rdata_url', 
          args : { 'url' : 'http://path.to.rdata.file' 
                 }
        };

    $scope.import_quandl = 
        { fun  : 'import_quandl',
          args : { quandl_code : 'LBMA/GOLD', 
                   object_name : 'quandl_object'
                 }
        };

});
