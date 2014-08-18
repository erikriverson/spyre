var spyre = angular.module('spyre', ['ui.bootstrap', 
                                     'ngGrid', 
                                     'colorpicker.module', 
                                     'angularFileUpload',
                                     'vr.directives.slider']);



spyre.controller('consoleController', function($scope, WSService) {
    // 'console' automatically registered as callback event

    // use 'console' automatically as the event name with rargs,
    // or include 'console on rargs?


    $scope.rcall = { fun  : 'console', 
                     args : $scope.rargs
                   };

    // does rcall get the latest version of $scope.rargs?
    // we may need to make rcall on $scope, and use an ng-model
    // on the html tab div

    $scope.eval_text = function() {
        WSService.r($scope.rcall); 
    };

});
    

// app.controller('evalController', function($scope, WSService) {
//     $scope.$on('connected', function() {
//         WSService.register_ws_callback('eval_string', function(msg) {
//             console.log("Console logged: " + msg);
//         });
//     });

//     $scope.eval_me = function() {
//         WSService.r("eval_string", $scope.eval_string);
//         $scope.eval_string = ""; 
//     };
// });

spyre.controller('rawController', function($scope, WSService) {

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
        WSService.r({fun: 'rawdata', 
                     args : {'data' : $scope.selected_data}});
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

spyre.controller('exploreController', function($scope, WSService) {

    $scope.$on('connected', function() {

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


    });

    $scope.$watchCollection('options', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.send_object($scope.selected_object, $scope.options);
        }
    });

});

spyre.controller('mvController', function($scope, WSService) {
    $scope.$on('connected', function() {
        WSService.register_ws_callback('mv', function(msg) {
            console.log('reply from mv');
            ggvis.getPlot("ggvis_multivariate").
                parseSpec(JSON.parse(msg.value));
            $scope.object_summary = msg.summary[0];
        });
    });

    $scope.callr = function(rcall) {
        WSService.r(rcall);
    };

    $scope.ggvis = {props : { xvar : "Not Set",
                              yvar : "Not Set",
                              fill : "#000000",
                              stroke : "#000000",
                              size   : 50
                            }
                   };

    $scope.ggvis.set_prop = function(event, object) {
        console.log(object);
        $scope.ggvis.props[event] = object;
    };
    
    $scope.$watchCollection('ggvis.props', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.mv($scope.ggvis.props);
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
        
        var mv_object = { xvar : plot_spec.xvar.data.object_index, 
                          yvar: plot_spec.yvar.data.object_index,
                          fill: fill,
                          stroke : stroke,
                          size   : plot_spec.size};

        console.log("going to call mv with:");
        console.log(mv_object);

        WSService.r({fun:"ggvis_explorer", args : {mv_object : mv_object}});
        return(0);
    };

    $scope.fill_scaled = 'false';
    $scope.stroke_scaled = 'false';
    
});

// let's try re-writing this in new style

spyre.controller('importController', function($scope, WSService) {

    $scope.$on('connected', function() {
        WSService.register_ws_callback('import', function(msg) {
            console.log('reply from import');
            console.log(msg);
            $scope.add_message(msg);
        });
    });


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

spyre.controller('MainController', function($scope, $sce, WSService, WSConnect, $timeout, $location) {

    $scope.selected_env = ".GlobalEnv";
    $scope.options = {};
    $scope.options.uv_plot_type = 'density';

    $scope.toggle_connect = function() {
        if($scope.isConnected) {
            WSService.r({fun : "CLOSE", args : {}});
            $scope.isConnected = false;
            $scope.selected_env = ".GlobalEnv";
        } else {
            $scope.connect();
        }
    };

    $scope.connect = function() {
        $scope.spyre_server = "ws://" + $location.host() + ":7681";
        WSConnect.connect($scope.spyre_server);


        WSService.register_ws_callback('open', function() {


            WSService.register_ws_callback('objects', function(msg) {
                console.log("Object of Objects:");
                console.log(msg);
                
                $scope.objects = msg;
                $scope.objects_tree = msg;

                // what functions should we call here? 
                $scope.send_object($scope.selected_object, $scope.options);
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


            WSService.register_ws_callback('message', function(msg) {
                console.log("Message received:");
                console.log(msg);
                $scope.add_message(msg);
            });

            // for now, this should go with init code elsewhere though.
            // need to register callback first.
            WSService.r({fun: "fortune_cookie", args : {}});


        });

        $scope.isConnected = true;
        $scope.$broadcast('connected');
    };

    $scope.message_list = [];

    $scope.add_message = function(msg) {
        var new_msg = { 
            time : new Date(), 
            title : msg.title,
            type : "alert " + "alert-" + msg.type,
            message : msg.message };
        
        $scope.message_list.unshift(new_msg);
        $scope.$apply();
    };

    $scope.selected = function(env) {
        WSService.r({fun : "set_selected_env", args : {env : env}});
        $scope.selected_env = env;
    };

    $scope.objects_tree = [];
    $scope.object_display_level = 1;

    $scope.object_level_down = function(object) {
        console.log(object.children);

        $scope.objects_tree = object.children;
        $scope.selected_data = object.label;
        $scope.add_message({title : "Spyre", type : "info", message : object.label + " is now active dataset."});
        $scope.data_is_selected = true;
    };

    $scope.object_level_up = function() {
        $scope.data_is_selected = false;
        $scope.selected(".GlobalEnv");
    };

    $scope.send_object = function(object_name, options) {
        if(object_name === undefined) {
            return(0);
        }
        var send_call = {fun :  'object_explorer_connect',
                         args : { object: object_name.data.object_index,
                                  options : options}};
        WSService.r(send_call);
        $scope.selected_object = object_name;
        return(0);
    };

    $scope.gridOptions = { data: 'objects_tree',
                           rowTemplate: '<div ng-style="{\'cursor\': row.cursor, \'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-cell ng-click="send_object(row.entity, options)" ng-dblclick="object_level_down(row.entity)"></div>',
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

spyre.controller('rmdController', function($scope, WSService, $sce) {
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

spyre.controller('SessionController', function ($scope, $modal, WSService) {
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

spyre.factory('WSConnect', function() {
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

spyre.factory('WSService', function(WSConnect) {
    return {
        r: function(rcall) {
	    return WSConnect.ws.send(rcall);
        },
        register_ws_callback: function(event, callback) {
            return WSConnect.ws.bind(event, callback);
        }
    };
});
