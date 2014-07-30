var app = angular.module('spyre', ['ui.bootstrap', 
                                   'ngGrid', 
                                   'colorpicker.module', 
                                   'angularFileUpload',
                                   'vr.directives.slider']);

app.controller('evalController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('eval_string', function(msg) {
            console.log("Console logged: " + msg);
        });
    });

    $scope.eval_me = function() {
        WSService.r("eval_string", $scope.eval_string);
        $scope.eval_string = ""; 
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
        WSService.r('rawdata', $scope.selected_data);
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
//                WSService.r("rawdata", $scope.recent_branch);
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
            console.log('reply from mv');
            ggvis.getPlot("ggvis_multivariate").
                parseSpec(JSON.parse(msg.value));
            $scope.object_summary = msg.summary[0];
        });
    });

    $scope.target = {xvar : "Not Set",
                     yvar : "Not Set",
                     fill : "#000000",
                     stroke : "#000000",
                     size   : 50
                     };

    $scope.select = function(event, object) {
        console.log("this is the event:" + event);
        console.log(object);
        $scope.target[event] = object;
    };
    
    $scope.$watchCollection('target', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.target);
        }
    });

    $scope.mv = function(plot_spec) {
        console.log(plot_spec);
        var fill, stroke, size;
        if(typeof(plot_spec.fill) !== "string") {
            console.log('think fill is not a string');
            fill = plot_spec.fill.data.object_index;
        } else {
            fill = plot_spec.fill;
        }                       

        // strings are hex color codes in this case
        if(typeof(plot_spec.stroke) !== "string") {
            stroke = plot_spec.stroke.data.object_index;
        } else {
            stroke = plot_spec.stroke;
        }
        
        var mv_object = {xvar : plot_spec.xvar.data.object_index, 
                         yvar: plot_spec.yvar.data.object_index,
                         fill: fill,
                         stroke : stroke,
                         size   : plot_spec.size};

        console.log("going to call mv with:");
        console.log(mv_object);

        WSService.r("ggvis_explorer", mv_object);
        return(0);
    };

    $scope.fill_scaled = 'false';
    $scope.stroke_scaled = 'false';
    
});

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
        WSService.r('import_http_url_break', $scope.http_url);
    };

    $scope.onFileSelect = function($files) {
        var fileReader = new FileReader();
        fileReader.readAsBinaryString($files[0]);
        fileReader.onload = function(e) {
            WSService.r('import_rdata', fileReader.result);

        };
    };

});

app.controller('MainController', function($scope, $sce, WSService, WSConnect, $timeout) {

//    $scope.selected_object = [];
    $scope.options = {};
    $scope.options.uv_plot_type = 'density';



    $scope.selected_env = ".GlobalEnv";

    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            WSService.r("CLOSE", {});
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
        WSService.r("set_selected_env", env);
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

        WSService.r(event, data_arg);
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


    //connect on start, should be an option
    $timeout(function() { $scope.toggle_connect(); }, 1000);

});

app.controller('rmdController', function($scope, WSService, $sce) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('rmd', function(msg) {
            console.log("[rmd] message received");
            console.log(msg.summary);
            $scope.rmd_content = msg.summary[0];
            $scope.$apply();
            $scope.injectHTML();
        });
    });

    $scope.injectHTML = function(){

        var html_string = $scope.rmd_content;
	var iframe = $('iframe#test_iframe').get(0);

	var iframedoc = iframe.document;
		if (iframe.contentDocument)
			iframedoc = iframe.contentDocument;
		else if (iframe.contentWindow)
			iframedoc = iframe.contentWindow.document;

	 if (iframedoc){
		 iframedoc.open();
		 iframedoc.writeln(html_string);
		 iframedoc.close();
	 } else {
		alert('Cannot inject dynamic contents into iframe.');
	 }

    };


    $scope.renderHtml = function(html_code)
    {
        console.log('[rmd] renderHTML called');
        console.log(html_code);
        return $sce.trustAsHtml(html_code);
    };

    $scope.rmd_file_path = "test.rmd";

    $scope.submit_rmd_file_path = function() {
        WSService.r("rmd_explorer", $scope.rmd_file_path);
    };

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

app.controller('SessionController', function ($scope, $modal, WSService) {
    $scope.get_session_info = function() {
        WSService.r('session', null);
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
        r: function(fun, data) {
	    return WSConnect.ws.send(fun, data);
        },
        register_ws_callback: function(event, callback) {
            return WSConnect.ws.bind(event, callback);
        }
    };
});
