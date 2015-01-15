var app = angular.module( "gaDatePickerRange", [] );

app.directive('focusOn', [ function() {
    return function(scope, elem, attr) {
        return scope.$on('focusOn', function(e, name) {
            if (name === attr.focusOn) {
                return elem[0].focus();
            }
        });
    };
} ] );

app.factory('focus', [
    '$rootScope', '$timeout', (function($rootScope, $timeout) {
        return function(name) {
            return $timeout(function() {
                return $rootScope.$broadcast('focusOn', name);
            });
        };
    })
]);

app.directive( 'gaDateRangePicker', [ function() {
    return {
        restrict: 'A',
        transclude : true,
        scope : {
            'range1' : '=',
            'nMonth' : '@',
            'nChange': '='
        },
        template:
            '<div class="btn-group" role="group">' +
            '<button type="button" class="btn btn-default" role="group" ng-click="movePeriod(-1)"><span class="glyphicon glyphicon-fast-backward" aria-hidden="true"></span></button>' +
            '<button type="button" class="btn btn-default" role="group" ng-click="switchDisplay( true )">{{range1.startLabel}} - {{range1.endLabel}}</button>' +
            '<button type="button" class="btn btn-default" role="group" ng-click="movePeriod(1)"><span class="glyphicon glyphicon-fast-forward" aria-hidden="true"></span></button>' +
            '</div>' +
            '<div class="gadpBox" ng-show="display">' +
            '<div style="float:left"><button class="btn btn-default btn-xs" ng-click="move( -1 )"><span style="font-size: 12px;">&Lt;</span></button></div>' +
            '<div style="float:left;">' +
            '<table class="gadpTable" cellpadding="0" cellspacing="0">' +
            '<thead><tr><td class="gadpHeadTd" colspan="7" ng-repeat="month in calend.months track by $index">{{month.name}} {{month.year}}</td></tr></thead>' +
            '<tbody>' +
            '<tr><td class="gadpWeekDay" ng-repeat="weekDay in calend.weekDays track by $index">{{weekDay.substr(0,1).toUpperCase()}}</td></tr>' +
            '<tr ng-repeat="week in calend.weekGroups track by $index">' +
            '<td class="gadpCell" ng-class="\'gadpCell\' + day.type" ng-click="setDate( day.date )" ng-repeat="day in week track by $index">{{day.numDay}}</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</div>' +
            '<div style="float:left"><button class="btn btn-default btn-xs" ng-click="move( 1 )"><span style="font-size: 12px;">&Gt;</span></button></div>' +
            '<div style="float:left;margin-left: 10px">' +
            '<div class="gadpText">' +
                'Période : ' +
                '<select ng-model="currentPeriod" ng-change="changePeriod()">' +
                    '<option ng-repeat="(key,period) in spePeriods" value="{{key}}" ng-selected="key==currentPeriod">' +
                    '{{period.label}}' +
                    '</option>' +
                '</select>' +
            '</div>' +
            '<div class="gadpDatesInputs">' +
            '<form role="form" class="form-inline">'+
            '<input type="text" class="form-control input-sm" focus-on="dateStart" ng-focus="focusDate(\'start\' , $event )" ng-model="dates.startLabel" ng-blur="dateBlur( \'start\' , dates.startLabel )">-' +
            '<input type="text" class="form-control input-sm" focus-on="dateEnd" ng-focus="focusDate(\'end\' , $event )" ng-model="dates.endLabel" ng-blur="dateBlur( \'end\' , dates.endLabel )">' +
            '</form>' +
            '</div>' +
            '<div class="gadpButtons">' +
            '<button class="btn btn-primary btn-xs" ng-click="valid()">Appliquer</button>&nbsp;' +
            '<button class="btn btn-default btn-xs"ng-click="switchDisplay( false )">Annuler</button>' +
            '</div>' +
            '</div>' +
            '<div style="clear: both"></div>' +
            '</div>'
        ,
        controller : [ '$scope' , 'focus' , '$element' , '$attrs' , '$transclude' , function( $scope , focus , $element , $attrs , $transclude ) {
            var now = moment().startOf( 'day' );
            $scope.spePeriods = {
                1 : { label : "Personnalisée" },
                2 : {
                      label : "Aujourd'hui" ,
                      calculate : function() {
                          updateDates(now.format('YYYY-MM-DD'), now.format('YYYY-MM-DD'));
                      }
                    },
                3 : {
                      label : "Hier",
                      calculate : function() {
                          var yesturday = angular.copy( now ).subtract( 1 , 'day');
                          updateDates( yesturday.format( 'YYYY-MM-DD' ) , yesturday.format( 'YYYY-MM-DD' ) );
                      }
                    },
                4 : {
                    label : "Semaine courante",
                    calculate : function() {
                        var firstDayWeek = angular.copy( now ).startOf( 'week' );
                        updateDates( firstDayWeek.format( 'YYYY-MM-DD' ) , now.format( 'YYYY-MM-DD' ) );
                    }
                } ,
                5 : {
                    label : "Semaine dernière",
                    calculate : function() {
                        var firstDayLastWeek = angular.copy( now ).subtract( 1 , 'week').startOf( 'week' );
                        var lastDayLastWeek = angular.copy( firstDayLastWeek).endOf( 'week' );
                        updateDates( firstDayLastWeek.format( 'YYYY-MM-DD' ) , lastDayLastWeek.format( 'YYYY-MM-DD' ) );
                    }
                },
                6 : {
                    label : "Mois courant",
                    calculate : function() {
                        var firstDayOfMonth = angular.copy( now ).startOf( 'month' );
                        updateDates( firstDayOfMonth.format( 'YYYY-MM-DD' ) , now.format( 'YYYY-MM-DD' ) );
                    }
                } ,
                7 : {
                    label : "Mois dernier",
                    calculate : function() {
                        var firstDayLastMonth = angular.copy( now ).subtract( 1 , 'month').startOf( 'month' );
                        var lastDayLastWeek = angular.copy( firstDayLastMonth ).endOf( 'month' );
                        updateDates( firstDayLastMonth.format( 'YYYY-MM-DD' ) , lastDayLastWeek.format( 'YYYY-MM-DD' ) );
                    }
                },
                8 : {
                    label : "Les 7 derniers jours",
                    calculate : function() {
                        var dateStart = angular.copy( now ).subtract( 6 , 'day');
                        updateDates( dateStart.format( 'YYYY-MM-DD' ) , now.format( 'YYYY-MM-DD' ) );
                    }
                },
                9 : {
                    label : "Les 30 derniers jours",
                    calculate : function() {
                        var dateStart = angular.copy( now ).subtract( 29 , 'day');
                        updateDates( dateStart.format( 'YYYY-MM-DD' ) , now.format( 'YYYY-MM-DD' ) );
                    }
                }
            }
            $scope.currentPeriod = 1;
            $scope.changePeriod = function() {
                if ( $scope.spePeriods[ $scope.currentPeriod ].calculate ) {
                    $scope.spePeriods[ $scope.currentPeriod ].calculate();
                }
            }
            var updateDates = function( dateStart , dateEnd ) {
                $scope.dates = {
                    start : dateStart,
                    startLabel : moment( dateStart ).format( 'll' ),
                    end : dateEnd,
                    endLabel : moment( dateEnd ).format( 'll' ),
                    select : $scope.dates.select
                }
                $scope.calend =  genMatrixMonth( current.month()  , current.year() , { dateStart : $scope.dates.start , dateEnd : $scope.dates.end } ) ;
            }
            // Range1 par default
            if ( !$scope.range1.start ) { $scope.range1.start = now.format( 'YYYY-MM-DD' ); }
            if ( !$scope.range1.end ) { $scope.range1.end = now.format( 'YYYY-MM-DD' ); }
            // Range1 Format Label
            $scope.range1.startLabel = moment($scope.range1.start).format( 'll' );
            $scope.range1.endLabel = moment($scope.range1.end).format( 'll' );
            // Set Display
            $scope.display = false;
            if ( !$scope.nMonth ) { $scope.nMonth = 3 }
            /**
             * Gen Matrix
             */
            var genMatrixMonth = function( month , year , params ) {
                if ( !params ) { params = {} };
                var now = moment().startOf( 'day' );
                var dateStart = angular.copy( now );
                var dateEnd = angular.copy( now ).endOf( 'day' );
                if ( params.dateStart && params.dateEnd ) {
                    dateStart = moment( params.dateStart ).startOf( 'day' );
                    dateEnd = moment( params.dateEnd ).endOf( 'day' );
                }
                var numMonth = $scope.nMonth;
                var matrix = {
                    weekDays : [],
                    months : []
                };
                /**
                 * Calculate Weekdays
                 */
                var weekDays = [];
                for ( var i = 0;i<7;i++ ) { weekDays.push( moment().weekday(i).format( 'ddd' ) ) }
                var current = moment({y:year, M:month, d:1 });
                var maxNumWeeks = 0;
                for ( var i = 0;i<numMonth;i++ ) {
                    var startMonth = moment({y:year, M:month, d:1 }).subtract( i , 'month' );
                    var cMonth = {
                        name : startMonth.format( 'MMMM' ),
                        year : startMonth.format( 'YYYY' ),
                        minWeekNum : 60,
                        maxWeekNum : 0,
                        numWeeks : 0,
                        weeks : []
                    }
                    var currentDate = moment({y:year, M:month, d:1 }).subtract( i , 'month' );
                    var countWeeks = 0;
                    var numWeek = 0;
                    var id = 0;
                    do {
                        if ( numWeek != currentDate.week() ) {
                            id++;
                            numWeek = currentDate.week();
                        }
                        if ( !cMonth.weeks[ id-1 ] ) {
                            cMonth.weeks[ id-1 ] = [];
                            countWeeks++;
                        }
                        // Day configuration
                        var cDay = {
                            numDay : currentDate.get( 'date' ),
                            date : currentDate.format( 'YYYY-MM-DD' ),
                            type:'nds'
                        };
                        if ( !currentDate.isAfter( now ) ) { cDay.type = 'select'; }
                        //
                        if ( currentDate.isSame( dateStart ) || ( currentDate.isAfter( dateStart ) && currentDate.isBefore( dateEnd ) ) ) {
                            cDay.type = 'inRange';
                        }
                        // Push the day
                        cMonth.weeks[ id-1 ].push( cDay );
                        currentDate.add( 1 , 'day');
                    } while( currentDate.get( 'date' ) != 1 )
                    var firstWeekSize = cMonth.weeks[ 0 ].length;
                    if( firstWeekSize<7 ) {
                        while( cMonth.weeks[ 0 ].unshift( { numDay:'' , type:'nds' } ) < 7 );
                    }
                    if( cMonth.weeks[ cMonth.weeks.length-1 ].length<7 ) {
                        while( cMonth.weeks[ cMonth.weeks.length-1 ].push( { numDay:'' , type:'nds' } ) < 7 );
                    }
                    matrix.weekDays = matrix.weekDays.concat( weekDays );
                    matrix.months.unshift( angular.copy( cMonth ) );
                    maxNumWeeks = Math.max( maxNumWeeks , countWeeks );
                }
                var weeksGroup = [];
                for ( var i = 0;i<maxNumWeeks;i++ ) {
                    if ( !weeksGroup[i] ) { weeksGroup[i] = [] }
                    for ( var j=0 ; j<numMonth ; j++ ) {
                        var cMonth = matrix.months[ j ];
                        if ( cMonth.weeks[ i ] ) {
                            weeksGroup[i] = weeksGroup[i].concat( cMonth.weeks[ i ]);
                        }
                        else {
                            var dayDefault = { numDay:'' , type:'nds' };
                            weeksGroup[i] = weeksGroup[i].concat([ dayDefault,dayDefault,dayDefault,dayDefault,dayDefault,dayDefault,dayDefault ]);
                        }
                    }
                }
                matrix.weekGroups = weeksGroup;
                return matrix;
            }
            // Display
            $scope.switchDisplay = function( show ) {
                $scope.display = show; }
            /**
             * Move Month in Calendar
             */
            $scope.move = function( step ) {
                if ( step == 1 ) { current.add( 1 , 'month' );}
                if ( step == -1 ) { current.subtract( 1 , 'month' ) }
                $scope.calend =  genMatrixMonth( current.month()  , current.year() , { dateStart : $scope.dates.start , dateEnd : $scope.dates.end } ) ;
            }
            //
            $scope.focusDate = function( type ) {
                $scope.dates[ type + 'Label' ] = moment(  $scope.dates[ type ] ).format( 'DD/MM/YYYY' );
                $scope.dates.select = type;
                $scope.currentPeriod = 1;
            }
            // Set Date Range
            $scope.setDate = function( date ) {
                var newDate = moment( date );
                if ( newDate.isBefore( $scope.dates.start ) && $scope.dates.select == "end" ) {
                    $scope.dates[ "start" ] = date;
                    $scope.dates.startLabel = moment( $scope.dates.start ).format( 'll' );
                    $scope.dates.select = 'start';
                }
                else {
                    $scope.dates[ $scope.dates.select ] = date;
                    $scope.dates[ $scope.dates.select + 'Label' ] = moment( date ).format( 'll' );
                    if ( $scope.dates.select == 'start' ) { $scope.dates.select = 'end' ; focus( "dateEnd" )}
                    else { $scope.dates.select = 'start' ; focus( 'dateStart' ) }
                }
                // Check if dateStart is not after dateEnd
                if ( moment( $scope.dates.start ).isAfter( $scope.dates.end ) ) {
                    $scope.dates.end = angular.copy( $scope.dates.start );
                    $scope.dates.endLabel = moment(  $scope.dates.end ).format( 'll' );
                }
                $scope.calend =  genMatrixMonth( current.month()  , current.year() , { dateStart : $scope.dates.start , dateEnd : $scope.dates.end } ) ;
            }
            //
            $scope.dateBlur = function( type , value ) {
                if ( !moment( value , [ 'DD-MM-YYYY' , 'DD/MM/YYYY' ] , moment.locale() , true ).isValid() ) {
                    $scope.dates[ type + 'Label' ] = moment(  $scope.dates[ type ] ).format( 'll' );
                }
                else {
                    $scope.dates[ type ] = moment( value , [ 'DD-MM-YYYY' , 'DD/MM/YYYY' ] , moment.locale() , true).format( 'YYYY-MM-DD' );
                    $scope.dates[ type + 'Label' ] = moment(  $scope.dates[ type ] ).format( 'll' );
                }
                $scope.calend =  genMatrixMonth( current.month()  , current.year() , { dateStart : $scope.dates.start , dateEnd : $scope.dates.end } ) ;
            }
            // Start Date
            $scope.dates = {
                start : angular.copy($scope.range1.start),
                startLabel : moment( $scope.range1.start).format( 'll' ),
                end : angular.copy($scope.range1.end ),
                endLabel : moment( $scope.range1.end ).format( 'll' ),
                select : 'start'
            }
            // Valid
            $scope.valid = function() {
                $scope.range1 = {
                    start: $scope.dates.start,
                    startLabel : moment( $scope.dates.start).format( 'll' ),
                    end: $scope.dates.end,
                    endLabel : moment( $scope.dates.end).format( 'll' )
                };
                if ( $scope.nChange ) { $scope.nChange( $scope.range1 ) }
                $scope.display = false;
            }
            // Move period
            $scope.movePeriod = function(sens) {
                var start = moment($scope.dates.start);
                var end = moment($scope.dates.end);
                var duration = moment.duration(start.diff(end));
                var delta = -duration.asDays() + 1;
                if ( sens == -1 ) {
                    start.subtract( delta , 'days' );
                    end.subtract( delta , 'days' );
                }
                else {
                    start.add( delta , 'days' );
                    end.add( delta , 'days' );
                }
                $scope.dates = {
                    start : start.format( 'YYYY-MM-DD' ),
                    startLabel : start.format( 'll' ),
                    end : end.format( 'YYYY-MM-DD' ),
                    endLabel : end.format( 'll' ),
                    select : 'start'
                }
                $scope.calend =  genMatrixMonth( now.month()  , now.year() , { dateStart : $scope.dates.start , dateEnd : $scope.dates.end } ) ;
                $scope.valid();
            }
            // Put Focus On Date Start
            focus('dateStart');
            // Display Calendar
            var current = moment($scope.dates.end);
            $scope.calend =  genMatrixMonth( now.month()  , now.year() , { dateStart : $scope.dates.start , dateEnd : $scope.dates.end } ) ;
        } ]
    };
} ] );