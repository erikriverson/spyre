var app = angular.module('spyre', ['angularBootstrapNavTree', 'ui.bootstrap',
                                   'ngDragDrop', 'ngGrid']);

app.factory('WSService', function($q) {

    var ws = new FancyWebSocket("ws://localhost:7681");

    return {
        send_r_data: function(event, data) {
	    return ws.send(event,data);
	},
        register_ws_callback : function(event, callback) {
            return ws.bind(event, callback);
        }
    };
    
});

app.controller('rawController', function($scope, WSService) {

    WSService.register_ws_callback('rawdata', function(msg) {
        console.log("got rawdata message:");
        console.log(msg.value);
        $scope.rawdata = msg.value;
        $scope.setPagingData(msg.value ,1, 10);
        $scope.$apply();
    });

    $scope.request_raw_data = function() {
        WSService.send_r_data('rawdata', $scope.recent_branch);
    };

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
//                WSService.send_r_data("rawdata", $scope.recent_branch);
                console.log("just skip this");
            }
        }, 100);
    };
	
//    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	
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

app.controller('mvController', function($scope, WSService) {
    WSService.register_ws_callback('mv', function(msg) {
        ggvis.getPlot("ggvis_multivariate").
            parseSpec(JSON.parse(msg.value));
        $scope.object_summary = msg.summary[0];
        $scope.$apply();
    });

    $scope.target = {x : "Not Set",
                     y : "Not Set"};

    $scope.select = function(event, object) {
        console.log("this is the event:" + event);
        console.log(object);
        $scope.target[event] = object;
    };
    
    $scope.$watchCollection('target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.target.x, $scope.target.y);
        }
    });

    $scope.mv = function(xvar_target, yvar_target) {
        console.log("Calling the mv function with" + xvar_target + "and" + yvar_target);
        var mv_object = {xvar_target : xvar_target.data.object_index, 
                         yvar_target: yvar_target.data.object_index};

        console.log(mv_object);

        WSService.send_r_data("mv", mv_object);
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

app.controller('evalController', function($scope, WSService) {
    WSService.register_ws_callback('eval_string', function(msg) {
        console.log("Console logged: " + msg);
    });

    $scope.eval_me = function() {
        WSService.send_r_data("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
    };
});

app.controller('iconController',  function($scope) {
    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            WSService.send_r_data("CLOSE", {});
            $scope.isConnected = false;
        } else {
            $scope.connect();
        }
    };
});

app.controller('MainController', function($scope, WSService) {

    WSService.register_ws_callback('open', function() {
        WSService.register_ws_callback('objects', function(msg) {
            console.log("Object of Objects:");
            console.log(msg);
            
            $scope.objects = msg;
            $scope.objects_tree = msg;
            
            $scope.$apply();
        });


        WSService.register_ws_callback('actions', function(msg) {
            console.log("Actions received:");
            console.log(msg);
            
            $scope.actions = msg;
            $scope.$apply();
        });

        WSService.register_ws_callback('environments', function(msg) {
            console.log("Environments received:");
            console.log(msg);
            
            $scope.envs = msg;
            $scope.$apply();
        });
    });


    $scope.selected = function(env) {
        WSService.send_r_data("set_selected_env", env);
        console.log(env + "is selected");
        $scope.selected_env = env;
    };

    // really need the app/app.controller stuff.
    $scope.isConnected = false;
    // so tree does not complain about no data
    $scope.objects_tree = [];

    $scope.object_display_level = 1;

    $scope.object_level_down = function(object) {
        console.log(object.children);
        $scope.objects_tree = object.children;
        $scope.selected_data = object.label;
        $scope.data_is_selected = true;
    };

    $scope.object_level_up = function() {
        $scope.data_is_selected = false;
    };

    $scope.connect = function() {

        WSService.register_ws_callback('uv', function(msg) {
            ggvis.getPlot("ggvis_univariate").
                parseSpec(JSON.parse(msg.value));
            
            $scope.object_summary = msg.summary[0];
            console.log($scope.object_summary);

            $scope.$apply();
        });

        $scope.isConnected = true;

    };

    $scope.tree_control = {};

    $scope.send_object = function(event, object_name) {
        WSService.send_r_data(event, object_name);
        return(0);
    };

    $scope.selected_env = ".GlobalEnv";

});
