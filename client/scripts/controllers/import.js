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


    $scope.import_sas7bdat_url = 
        { fun  : 'import_sas7bdat_url',
          args : { url : "http://www.cdc.gov/nchs/tutorials/Dietary/Downloads/osteo_analysis_data.sas7bdat", 
                   object_name : 'sas_object'
                 }
        };

});
