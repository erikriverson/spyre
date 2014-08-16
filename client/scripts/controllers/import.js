// let's try re-writing this in new style

spyre.controller('importController', function($scope, WSService) {

    $scope.callr = function(rcall) {
        WSService.r(rcall);
    };

    $scope.import_rdata_url = 
        { fun  : 'import_rdata_url', 
          args : { 'url' : 'http://cran.ocpu.io/MASS/data/bacteria/rda' 
                 }
        };

    $scope.import_quandl = 
        { fun  : 'import_quandl',
          args : { quandl_code : 'LBMA/GOLD', 
                   object_name : 'quandl_data'
                 }
        };

    $scope.import_sas7bdat_url = 
        { fun  : 'import_sas7bdat_url',
          args : { url : "http://crn.cancer.gov/resources/ctcodes-procedures.sas7bdat", 
                   object_name : 'sas_data'
                 }
        };


    $scope.import_http_api = 
        { fun  : 'import_http_api',
          args : { url : "http://api.meetup.com/2/cities?page=20", 
                   object_name : 'http_data'
                 }
        };

});
