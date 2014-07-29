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
