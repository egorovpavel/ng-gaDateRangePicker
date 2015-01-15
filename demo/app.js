var app = angular.module( "demo", [ "gaDatePickerRange" ] );

app.controller( 'test' , [ '$scope' , function( $scope ) {
    moment.locale('fr');
    var now = moment();
    $scope.test = function( range1 ) {
        console.log( range1 );
    }
    $scope.myDates={ start:now.format( 'YYYY-MM-DD' ) , end:now.format( 'YYYY-MM-DD' ) };
}]);