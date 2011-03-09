function () {
  var patient = this;
  var measure = patient.measures["0002"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365 * day;
  var effective_date =  <%= effective_date %>;
  var earliest_encounter = effective_date - year;
  var earliest_birthdate =  effective_date - 18 * year;
  var latest_birthdate =    effective_date - 2 * year;

  var meds_prescribed_after_encounter = [];  // computed by denominator, used by numerator

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {

    var encounters = measure.encounter_ambulatory_including_pediatrics_encounter
    if (!inRange(encounters, earliest_encounter, effective_date))
      return false;

    if(!diagnosisDuringEncounter(measure.pharyngitis_diagnosis_active, encounters, earliest_encounter, effective_date) ){
      return false;
    }
      
    if (!_.isArray(encounters))
      encounters = [encounters];
    var meds = _.flatten(_.compact( [ measure.pharyngitis_antibiotics_medication_dispensed, 
                                      measure.pharyngitis_antibiotics_medication_order, 
                                      measure.pharyngitis_antibiotics_medication_active ]));
    var result = 0;
    var threeDays = 3 * day;
    var thirtyDays = 30 * day;
    
    var medsThreeAfterAndNotThirtyBefore = function(timeStamp) {
      var match=false;
      for (var i=0; i<meds.length;i++) {
        if (meds[i]>=timeStamp){
            if (meds[i] <= (timeStamp+threeDays)) { // meds within three days of timestamp
                match=true;  // keep on looking for prior meds
                // if meds[i] is ever matched as true, mark it as a match for use in the numerator
                meds_prescribed_after_encounter.push(meds[i]);
            }
        } else if(meds[i] >= (timeStamp-thirtyDays)) { // meds are before timestamp, are they within 30 days prior to timestamp?
                match=false;
                break;    // if you find one of these, the search is over
        }
      }
      return match;
    };

    
    var matchingEncounters = _.select(encounters, medsThreeAfterAndNotThirtyBefore);
       
    return matchingEncounters.length > 0;
  };

  var numerator = function() {
    /* “Laboratory test performed: group A streptococcus test” using “group A streptococcus     
    test code list grouping” before or simultaneously to <medications> */

    return (actionFollowingSomething(  // test precedes medication by less than 3 days
      measure.group_a_streptococcus_test_laboratory_test_performed, meds_prescribed_after_encounter, 3*day));
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
