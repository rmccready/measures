// Adds misc utility functions to the root JS object. These are then
// available for use by the supporting map-reduce functions for any measure
// that needs common definitions of diabetes-specific algorithms.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
(function () {
  var root = this;
  
  var between = function(value, start, end) {
    return (value>=start && value<=end);
  }
  
  // Returns count of something that occured within 1 day of an encounter
  root.somethingDuringEncounter = function (somethings, encounters, startTimeRange, endTimeRange) {
    var result = 0;
    var i, j;
    var day = 24 * 60 * 60;
    
    if (startTimeRange===undefined)
      startTimeRange=-Infinity;
    if (endTimeRange===undefined)
      endTimeRange=Infinity;

    somethings = normalize(somethings);
    encounters = normalize(encounters);
    
    somethings_in_range = _.select(somethings, function(val) {return between(val, startTimeRange, endTimeRange);});
    encounters_in_range = _.select(encounters, function(val) {return between(val, startTimeRange, endTimeRange);});

    matching = _.select(somethings_in_range, function(something) {
      window_start = something - day;
      window_end = something + day;
      // true if any encounters are within 24hrs of the something
      return _.any(encounters_in_range, function(enc) {
        return between(enc, window_start, window_end);
      });
    });
    
    return matching.length;
  };

  // Returns count of diagnoses that occured within 1 day of an encounter
  root.eventDuringEncounter = function (event, encounter, startTimeRange, endTimeRange) {
    return somethingDuringEncounter(event, encounter, startTimeRange, endTimeRange);
  };

  // Returns count of diagnoses that occured within 1 day of an encounter
  root.diagnosisDuringEncounter = function (diagnosis, encounter, startTimeRange, endTimeRange) {
    return somethingDuringEncounter(diagnosis, encounter, startTimeRange, endTimeRange);
  }

  // Returns count of number of readings that are followed by at least one action
  root.actionAfterReading = function (readings, action) {
    readings = normalize(readings);
    action = normalize(action);
    reading_dates = _.pluck(readings, 'date');
    return actionFollowingSomething(reading_dates, action);
  };

  //  unique_dates:  list of unique dates in a list of times
  root.unique_dates = function (times) {
    if (!_.isArray(times)) { // a single date is unique
      return times;
    }
    var dates = _.map(times, function (time) {
      return parseInt((time / (24 * 60 * 60)).toFixed(0)) * (24 * 60 * 60);
    });
    return (_.uniq(dates));
  };


})();
