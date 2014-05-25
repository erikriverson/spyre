var app = angular.module('spyre', ['angularBootstrapNavTree', 'ui.bootstrap',
                                   'ngDragDrop', 'ngGrid']);

app.factory('WS2', function($q) {
    var ws = new WebSocket("ws://localhost:7681");

    ws.onopen = function(){  
        var defer = $q.defer();
        console.log("Socket has been opened!");  
        defer.resolve("socket connected");
    };

    var send_request = function(request) {
      var defer = $q.defer();
      console.log('Sending request', request);
      ws.send(JSON.stringify(request));
      return defer.promise;
    };

    return {
	get_r_data: function(event, data) {
            var request = {
                event: event,
                data : data
            };
	    return send_request(request)
	        .then(function(response) {
	            if (typeof response.data === 'object') {
                        console.log("here with:");
                        console.log(response.data);
	                return response.data;
	            } else {
	                return $q.reject(response.data);
	            }
	        }, function(response) {
	            return $q.reject(response.data);
	        });
	}
    };
    
});

app.controller('rawController', function($scope, WS2) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 

    $scope.totalServerItems = 0;

    $scope.pagingOptions = {
        pageSizes: [10, 50, 100],
        pageSize: 10,
        currentPage: 1
    };	

    $scope.setPagingData = function(data, page, pageSize){	
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.rawdata = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                $http.get('jsonFiles/largeLoad.json').success(function (largeLoad) {		
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
//                WS2.get_r_data("rawdata", $scope.recent_branch);
                console.log("just skip this");
            }
        }, 100);
    };
	
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
	
    $scope.gridOptions = { data: 'rawdata',
                           enableColumnResize : true,
                           showGroupPanel : true,
                           showFilter : true,
                           enablePaging: true, 
                           showFooter: true,
                           totalServerItems : 'totalServerItems',
                           pagingOptions: $scope.pagingOptions, 
                           filterOptions: $scope.filterOptions,
                           showColumnMenu: true};

});

app.controller('mvController', function($scope, WS2) {

    // for drag and drop testing
    $scope.xvar_target = [];
    $scope.yvar_target = [];
    
    $scope.$watchCollection('xvar_target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv(newValue, $scope.yvar_target);
        }
    });

    $scope.$watchCollection('yvar_target', function(newValue, oldValue) {
        console.log(newValue + oldValue);
        if(newValue !== oldValue) {
            $scope.mv($scope.xvar_target, newValue);
        }
    });

    $scope.mv = function(xvar_target, yvar_target) {
        console.log("Calling the mv function with" + xvar_target + "and" + yvar_target);
        var mv_object = {xvar_target : xvar_target[0].data.object_index, 
                         yvar_target: yvar_target[0].data.object_index};

        console.log(mv_object);

        WS2.get_r_data("mv", mv_object);
        return(0);
    };
});

app.controller('tabsController', function($scope) {
    $scope.tabs = [{title:'Object Explorer', content:'stuff'}, 
                   {title:'Data Explorer', content:'stuff'}, 
                   {title:'Plotting', content:'stuff'}, 
                   {title:'Regression', content:'stuff'}, 
                   {title:'Console',content:'more stuff'}];
});

app.controller('evalController', function($scope, WS2) {

    $scope.eval_me = function() {
        WS2.get_r_data("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
    };
});

app.controller('iconController',  function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            WS2.get_r_data("CLOSE", {});
            $scope.isConnected = false;
        } else {
            $scope.connect();
        }
    };
});

app.controller('MainController', function($scope, WS2) {
    // really need the app/app.controller stuff.
    $scope.isConnected = false;
    // so tree does not complain about no data
    $scope.objects_tree = [];

    $scope.connect = function() {

        WS2.get_r_data("objects", "objects")
            .then(function(msg) {
                console.log("Object of Objects:");
                console.log(msg);

                $scope.objects = msg;
                $scope.objects_tree = msg;
                    
                $scope.$apply();

            });
        
        $scope.isConnected = true;

    };

    $scope.tree_control = {};

    $scope.send_object = function(event, object_name) {
        WS2.get_r_data(event, object_name);
        return(0);
    };

    $scope.tree_control_test = function(branch) {
        console.log("tree_control_test called");
        console.log(branch);
        // We want send_object to behave differently depending on the
        // active tab, so pass in event?  how do we get some data
        // associated with the active tab, like its id?
        $scope.send_object("uv", branch.data.object_index);
        branch.selected = branch.expanded = false;

        // this let's us keep an application scoped variable of what
        // is most recently selected tree branch
        $scope.recent_branch = branch.data.object_index;
    };

    $scope.items = [
        'The first choice!',
        'And another choice for you.',
        'but wait! A third!'
    ];

    $scope.status = {
        isopen: false
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };

});
