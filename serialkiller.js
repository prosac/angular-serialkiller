'use strict';
angular.module('serial', []).directive('serial', ['$compile', '$timeout', function($compile, $timeout) {
  return {
    restrict: 'E',
    scope: {
      serialVar:          '=',
      pattern:            '=',
      numberOfChars:      '=',
      numberOfParts:      '=',
      growingWithContent: '='
    },
    template: '<div class="serial"></div>',
    replace: true,
    link: function(scope, elem, attr, ctrl) {
      var numberOfParts = scope.numberOfParts || 4;
      var numberOfChars = scope.numberOfChars || 4;
      var varsToWatch;
      var currentPart = 0;
      var pattern = scope.pattern || '[0-9]{4}'; // fetching pattern fro attr leads to an error
      var fields = [];
      var savedValues = [];
      var allowedPattern = /^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/;

      scope.parts = [];
      scope.serialVar = '';

      scope.setCurrentPart = function(i) {
        currentPart = i;
      }

      function setup() {
        for (var i = 0 ; i <= numberOfParts - 1; i++) {
          addField(i);
          fields[i] = elem.find('input')[i];
          scope.parts[i] = '';
          if(i == 0) {
            varsToWatch = 'parts[' + i + ']';
          } else {
            varsToWatch += '+ parts[' + i + ']';
          }
        };
      }

      function addField(i) {
        elem.append($compile(
          "<input " +
          "ng-change='onInputChange()'" +
          "ng-click='setCurrentPart(" + i + ")' " + 
          "type='text' " +
          "pattern='" + pattern + "' " +
          "maxlength='" + numberOfChars + "' " +
          "id='serial-input-" + i + "' " +
          "ng-model='parts[" + i + "]' " +
          "class='serial string required form-control'>" + 
          "<span class='delimiter'></span>"
          )(scope));
      }

      function jump(i) {
        i++;
        currentPart = i;
        if (fields[i]) {
          $timeout(function() {
            fields[i].focus();
          }, 100);
        }
      }

      function isValueAllowed(value) {
        if (value) {
          var res = value.match(allowedPattern);
          return (res === null) ? false : true;
        } else {
          return true;
        }
      }

      function valueTransformations(value) {
        return value.toUpperCase();
      }

      function updateAndJump() {
        var combinedPartValues = '';
        for (var i = 0 ; i <= numberOfParts - 1; i++) {
          var delimiter;
          if (isValueAllowed(scope.parts[i])) {
            savedValues[i] = scope.parts[i];
          } else {
            scope.parts[i] = savedValues[i];
          }
          scope.parts[i] = valueTransformations(scope.parts[i]);
          i === 0 ? delimiter = '' : delimiter = '-';
          combinedPartValues += delimiter + scope.parts[i];
          savedValues[i] = scope.parts[i];
          if (scope.parts[currentPart] && scope.parts[currentPart].length >= numberOfChars) {
            jump(currentPart);
          };
        }
        scope.serialVar = combinedPartValues;
      }

      setup();

      scope.$watch(varsToWatch, function() {
        updateAndJump();
      });

    }
  };
}]);