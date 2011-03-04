// Adds misc utility functions to the root JS object. These are then
// available for use by the supporting map-reduce functions for any measure
// that needs common definitions of diabetes-specific algorithms.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
(function() {
    var root = this;

    // Returns count of number of diagnoses that occured within 1 day of an encounter
    root.eventDuringEncounter = function (event, encounter, startTimeRange, endTimeRange) {
        if (!event || !encounter) { return (0); }

        var result = 0;
        var i,j;
        var day = 24 * 60 * 60;

        if (!_.isArray(event)) { event = [event];}
        if (!_.isArray(encounter)) { encounter = [encounter]; }
        // for each event, see if there is an encounter within 1 day
        for (i = 0; i < event.length; i++) {
            if (!event[i] || event[i] > endTimeRange || event[i] < startTimeRange) {
                continue;
            }
            window_start = event[i] - day;
            window_end = event[i] + day;
            for (j = 0; j < encounter.length; j++) {
                if (!encounter[i] || encounter[i] > endTimeRange || encounter[i] < startTimeRange){
                     continue;
                }
                if (encounter[j] >= window_start && encounter[j] <= window_end){
                     result++;
                }
            }
        }
        return result;

      };


 // Returns count of number of diagnoses that occured within 1 day of an encounter
root.diagnosisDuringEncounter =  function(diagnosis, encounter, startTimeRange, endTimeRange){
   var day = 24 * 60 * 60;
   if(!diagnosis || !encounter) return(0);

   var result = 0;
   if (!_.isArray(diagnosis))
      diagnosis = [diagnosis];
    if (!_.isArray(encounter))
      encounter = [encounter];
    // for each diagnosis, see if there is an encounter within 1 day
    for(var i = 0; i<diagnosis.length;i++){
        if(!diagnosis[i] || diagnosis[i]>endTimeRange || diagnosis[i]<startTimeRange) continue;
        window_start = diagnosis[i] - day;
	window_end = diagnosis[i] + day;
      for (var j=0; j<encounter.length;j++) {
        if(!encounter[i] || encounter[i]>endTimeRange || encounter[i]<startTimeRange) continue;
        if (encounter[j]>=window_start && encounter[j]<= window_end )
          result++;
      }
    }
    return result;
}

 // Returns count of number of somethings that are followed by at least one action
root.actionAfterSomething = function(something, action) {
    if (!_.isArray(something))
      something = [something];
    if (!_.isArray(action))
      action = [action];
    
    var result = 0;
    for (var i=0; i<something.length; i++) {
      var timeStamp = something[i];
      for (var j=0; j<action.length;j++) {
        if (action[j]>=timeStamp )
          result++;
      }
    }
    return result;
  }

 // Returns count of number of readings that are followed by at least one action
  root.actionAfterReading = function(readings, action) {
    if (!_.isArray(readings))
      readings = [readings];
    if (!_.isArray(action))
      action = [action];
  
    var results = 0; // number of readings that are followed by an action
    for (var i=0; i<readings.length; i++) {
      if(!readings[i]) continue;
      var timeStamp = readings[i].date;
      var result = 0; // number of actions that follow a particular reading
      for (var j=0; j<action.length;j++) {
        if(!action[j]) continue;
        if (action[j]>=timeStamp )
          result++;
      }
      if(result>0)results++;  // if there are any actions that follow this reading, increment results
    }
    return results;

  };

  // Returns the min readings[i].value where readings[i].date is in
  // the supplied startDate and endDate. If no reading meet this criteria,
  // returns defaultValue.
  root.minValueInDateRange = function(readings, startDate, endDate, defaultValue) {
    var readingInDateRange = function(reading) {
      var result = inRange(reading.date, startDate, endDate);
      return result;
    };
    
    if (!readings || readings.length<1)
      return defaultValue;
  
    var allInDateRange = _.select(readings, readingInDateRange);
    var lowest = _.min(allInDateRange, function(reading) {return reading.value;});
    if (lowest)
      return lowest.value;
    else
      return defaultValue;
  };



 })();
