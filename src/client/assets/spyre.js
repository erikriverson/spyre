var app = angular.module('spyre', ['angularBootstrapNavTree', 'ui.bootstrap',
                                   'ngDragDrop', 'ngGrid']);

app.controller('rawController', function($scope) {

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
                $scope.ws.send("rawdata", $scope.recent_branch);
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
	
    $scope.request_raw_data = function() {
        $scope.ws.send("rawdata", $scope.recent_branch);
    };
        
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

app.controller('mvController', function($scope) {

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

        $scope.ws.send("mv", mv_object);
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

app.controller('evalController', function($scope) {

    $scope.eval_me = function() {
        $scope.ws.send("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
    };
});

app.controller('iconController',  function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            $scope.ws.send("CLOSE", {});
            $scope.isConnected = false;
        } else {
            $scope.connect();
        }
    };
});

app.controller('MainController', function($scope) {
    // really need the app/app.controller stuff.
    $scope.isConnected = false;
    // so tree does not complain about no data
    $scope.objects_tree = [];

    $scope.connect = function() {
        try {
            var w_socket = new FancyWebSocket("ws://127.0.0.1:7681");        

            w_socket
                .bind('objects', function(msg) {
                    console.log("Object of Objects:");
                    console.log(msg);

                    $scope.objects = msg;
                    $scope.objects_tree = msg;
                    
                    $scope.$apply();
                })
                .bind('uv', function(msg) {
                    ggvis.getPlot("ggvis_univariate").
                        parseSpec(JSON.parse(msg.value));
                    
                    $scope.object_summary = msg.summary[0];
                    console.log("hi");
                    console.log($scope.object_summary);
                    $scope.$apply();
                })
                .bind('mv', function(msg) {
                    ggvis.getPlot("ggvis_multivariate").
                        parseSpec(JSON.parse(msg.value));
                    $scope.object_summary = msg.summary[0];
                    $scope.$apply();
                })
                .bind('rawdata', function(msg) {
                    console.log("got rawdata message:");
                    console.log(msg.value);
                    $scope.rawdata = msg.value;
                    $scope.setPagingData(msg.value ,1, 10);
                    $scope.$apply();
                })
                .bind('eval_string', function(msg) {
                    console.log("Console logged: " + msg);
                });
        }
                     
        catch(ex) { 
            console.log("Caught exception!");
            $scope.isConnected = false; 
        };

        $scope.ws = w_socket; 
        $scope.isConnected = true;

    };

    $scope.tree_control = {};

    $scope.send_object = function(event, object_name) {
        $scope.ws.send(event, object_name);
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
