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


 })();
