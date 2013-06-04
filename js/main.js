var app = angular.module('app', []);

function SearchCtrl($scope, $http){
	$scope.loading = false;
    $scope.categories = [],
    $scope.results = [];
    $scope.currentCategory = "";


	$scope.returnCats = function (data) {
	    for (var i = 0; i < data.length; i++) {

		    $scope.categories.push(data[i].split('-').join(' '));


		    if(i === 0){
		    	$http.jsonp('http://ec2-79-125-30-86.eu-west-1.compute.amazonaws.com/api/rest/group/' + data[i] + '?callback=JSON_CALLBACK').success(loadCategory);		    	
			}
		}

    }

    $scope.changeCat = function(data){
    	$scope.loading = true;
    	$scope.results = [];    	
		$http.jsonp('http://ec2-79-125-30-86.eu-west-1.compute.amazonaws.com/api/rest/group/' + data.split(' ').join('-') + '?callback=JSON_CALLBACK').success(loadCategory);
    }

    $http.jsonp('http://ec2-79-125-30-86.eu-west-1.compute.amazonaws.com/api/rest/group?callback=JSON_CALLBACK').success($scope.returnCats);

    function loadCategory(category) {
    	$scope.currentCategory = category.name.split('-').join(' ');

    	for(var i=0; i< category.packages.length; i++){
        	$http.get('/api/dataset/' + category.packages[i]).success(setResult);
    	}

	    if(!category.packages.length){
	    	$scope.loading = false;
	    }
    }

	function setResult(data) {

        var types = [];
	          
	    for (var i = 0; i < data.Resources.length; i++) {
	        for (var j = 0; j < data.Resources[i].AvailableTypes.length; j++) {
	            if (types.indexOf(data.Resources[i].AvailableTypes[j]) > -1) {
	                data.Resources[i].AvailableTypes[j] = '';
	            }
	            else {
	                types.push(data.Resources[i].AvailableTypes[j]);
                }   
	        }
	    }

	    data.UniqueTypes = types;       
        $scope.loading = false;
        $scope.results.push(data);
    }

}
function DetailsCtrl($scope, $http){
	$http.get('/api/dataset/'+getParameterByName('sourcename')).success(returnInfo);

	function returnInfo(data){
		$scope.title = data.Title;
		$scope.desc = data.Notes;
		$scope.author = data.Author;
		//categories
		$scope.usage = data.License;
		$scope.dateAdded = data.MetadataCreated.split('T')[0];
		$scope.dateModified = data.MetadataModified.split('T')[0];
		$scope.resources = data.Resources;
		$scope.urlName = data.Name;

		for(var i=0; i<data.Resources.length; i++){
			for(var k=0; k<data.Resources[i].AvailableTypes.length; k++){
				if(data.Resources[i].AvailableTypes[i] == 'kmz'){
					$scope.kml = data.Resources[i].Url;
				}
			}
		}
	}
}

function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}