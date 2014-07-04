var app = angular.module('spyre', ['angularBootstrapNavTree', 'ui.bootstrap',
                                   'ngDragDrop', 'ngGrid', 'omr.angularFileDnD']);


app.factory('WSConnect', function() {
    var WSConnect = {};

    WSConnect.connect = function(ws_url) {
        WSConnect.ws = new FancyWebSocket(ws_url);
        if(ws_url === undefined) {
            WSConnect.ws.send = {};
            WSConnect.ws.bind = {};
        }
    };

    return WSConnect;
    
});

app.factory('WSService', function(WSConnect) {
    return {
        send_r_data: function(event, data) {
	    return WSConnect.ws.send(event, data);
        },
        register_ws_callback: function(event, callback) {
            return WSConnect.ws.bind(event, callback);
        }
    };
});

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

app.controller('rawController', function($scope, WSService) {

    $scope.$on('connected', function() {
        WSService.register_ws_callback('rawdata', function(msg) {
            console.log("got rawdata message:");
            console.log(msg.value);
            $scope.rawdata = msg.value;
            $scope.setPagingData(msg.value ,1, 10);
            $scope.$apply();
        });
    });

    $scope.request_raw_data = function() {
        WSService.send_r_data('rawdata', $scope.selected_data);
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

    $scope.$watch('selected_data', function(newVal, oldVal) {
        if(newVal !== oldVal) {
            $scope.request_raw_data();
        }
    });
        

});

app.controller('mvController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('mv', function(msg) {
            ggvis.getPlot("ggvis_multivariate").
                parseSpec(JSON.parse(msg.value));
            $scope.object_summary = msg.summary[0];
        });
    });

    $scope.target = {x : "Not Set",
                     y : "Not Set",
                     fill : "Not Set"};

    $scope.select = function(event, object) {
        console.log("this is the event:" + event);
        console.log(object);
        $scope.target[event] = object;
    };
    
    $scope.$watchCollection('target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.target.x, $scope.target.y, $scope.target.fill);
        }
    });

    $scope.mv = function(xvar_target, yvar_target, fill_target) {
        console.log("Calling the mv function with" + xvar_target + "and" + yvar_target + "and" + fill_target);
        var mv_object = {xvar_target : xvar_target.data.object_index, 
                         yvar_target: yvar_target.data.object_index,
                         fill_target: fill_target.data.object_index};

        console.log(mv_object);

        WSService.send_r_data("ggvis_explorer", mv_object);
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
    $scope.$on('connected', function() {
        WSService.register_ws_callback('eval_string', function(msg) {
            console.log("Console logged: " + msg);
        });
    });

    $scope.eval_me = function() {
        WSService.send_r_data("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
    };
});

app.controller('MainController', function($scope, $sce, WSService, WSConnect, $rootScope) {

//    $scope.selected_object = [];
    $scope.options = {};
    $scope.options.uv_plot_type = 'density';



    $scope.selected_env = ".GlobalEnv";

    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            WSService.send_r_data("CLOSE", {});
            $scope.isConnected = false;
            $scope.selected_env = ".GlobalEnv";
        } else {
            $scope.connect();
        }
    };

    $scope.connect = function() {
        $scope.spyre_server = "ws://localhost:7681";
        WSConnect.connect($scope.spyre_server);

        $scope.renderHtml = function(html_code)
        {
            var phtml = jQuery.parseHTML(html_code);
            var bc = $(".breadcrumb", phtml);

            return $sce.trustAsHtml($(".documentation", phtml).
                   prop('outerHTML'));
        };

        WSService.register_ws_callback('uv', function(msg) {
            console.log(msg);
            $scope.object_ggvis = false;
            $scope.object_property = false;
            $scope.object_help = false; 
            $scope.object_controls = false; 

            if(msg.hasOwnProperty("value")) {
                $scope.object_ggvis = true;
                ggvis.getPlot("ggvis_univariate").
                    parseSpec(JSON.parse(msg.value));
            }
            
            if(msg.hasOwnProperty("summary")) {
                $scope.object_summary = msg.summary[0];
            }
            
            if(msg.hasOwnProperty("help")) {
                $scope.object_help = msg.help[0];
            }

            if(msg.hasOwnProperty("controls")) {
                $scope.object_controls = msg.controls[0];
            }

            // why is apply needed to get summary to show up each click?
            $scope.$apply();
        });

        WSService.register_ws_callback('open', function() {
            WSService.register_ws_callback('objects', function(msg) {
                console.log("Object of Objects:");
                console.log(msg);
                
                $scope.objects = msg;
                $scope.objects_tree = msg;

                // what functions should we call here? 
                $scope.send_object('object_explorer_connect', $scope.selected_object, 
                                   $scope.options);
                
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

        $scope.isConnected = true;
        $scope.$broadcast('connected');
    };

    $scope.selected = function(env) {
        WSService.send_r_data("set_selected_env", env);
        $scope.selected_env = env;
    };

    // really need the app/app.controller stuff.
    // $scope.isConnected = false;
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
        $scope.selected(".GlobalEnv");
    };

    $scope.tree_control = {};

    $scope.send_object = function(event, object_name, data) {
        if(object_name === undefined) {
            return(0);
        }
        
        var data_arg = {object: object_name.data.object_index,
                        data : data};

        WSService.send_r_data(event, data_arg);
        $scope.selected_object = object_name;
        return(0);
    };

    $scope.$watchCollection('options', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.send_object('object_explorer_connect', $scope.selected_object, $scope.options);
        }
    });



    $scope.gridOptions = { data: 'objects_tree',
                           rowTemplate: '<div ng-style="{\'cursor\': row.cursor, \'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-cell ng-click="send_object(\'object_explorer_connect\', row.entity, options)" ng-dblclick="object_level_down(row.entity)"></div>',
                           enableColumnResize : true,
                           showGroupPanel : false,
                           multiSelect : false,
                           showFilter : true,
                           enablePaging: false, 
                           selectedItems : $scope.objects_tree, 
                           showFooter: true,
                           columnDefs: [{ field: 'label', displayName: 'Object'},
                                        { field: 'class[0]', displayName: 'Class'}],
                           showColumnMenu: false};

    $scope.tt = { refresh : "Refresh object list",
                  uplevel : "Display full list of objects",
                  envlist : "Available environments",
                  actions : "Perform action on selected object"};


});


var ModalInstanceController = function ($scope, $modalInstance, items) {
    $scope.about = "test";
    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.dismiss('cancel');
    };
};

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('SessionController', function ($scope, $modal, WSService) {
    $scope.get_session_info = function() {
        WSService.send_r_data('session', null);
        return(0);
    };

    $scope.$on('connected', function () {
        WSService.register_ws_callback('session', function(msg) {
            console.log(msg);
            $scope.session_info = msg.summary[0];
        });
    });

    $scope.open = function () {
        
        var modalInstance = $modal.open({
            templateUrl: 'about.html',
            controller: ModalInstanceController,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });
    };
});



