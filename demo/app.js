var app = angular.module( "demo", [ "gaDatePickerRange" ] );

app.controller( 'test' , [ '$scope' , function( $scope ) {
    moment.locale('fr');
    var now = moment();
    $scope.range1={ start:now.format( 'YYYY-MM-DD' ) , end:now.format( 'YYYY-MM-DD' ) };
}]);