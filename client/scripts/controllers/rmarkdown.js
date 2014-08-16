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
