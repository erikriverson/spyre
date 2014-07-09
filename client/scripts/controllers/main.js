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
