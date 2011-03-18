function () {
  var patient = this;
  var measure = patient.measures["0073"];
  if (measure===null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;
  var latest_birthdate =   effective_date - (18 * year); // patients who will reach the age of 18 during the “measurement period”

  var earliest_encounter = effective_date - (2 *  year);
  var latest_encounter =   effective_date - (1 *  year) - (61 * day);
  var earliest_procedure = effective_date - (2 *  year);
  var latest_procedure =   effective_date - (1 *  year) - (61 * day);

  var population = function() {
    return (patient.birthdate <= latest_birthdate);
  }

  var denominator = function() {
     return ivd_denominator(measure, earliest_procedure, latest_procedure, earliest_encounter, latest_encounter);
  }

  var numerator = function() {
    // whenever using _.max you need to test to see if the item exists first
    if (measure.encounter_acute_inpt_and_outpt_encounter) {
      var last_inpt_and_outpt_encounter = _.max(measure.encounter_acute_inpt_and_outpt_encounter);
      var start_latest_encounter = last_inpt_and_outpt_encounter - day;
      var end_latest_encounter = last_inpt_and_outpt_encounter   + day;
      var systolic_min  = minValueInDateRange(measure.systolic_blood_pressure_physical_exam_finding,
                                              start_latest_encounter,
                                              end_latest_encounter,
                                              false);
      var diastolic_min = minValueInDateRange(measure.diastolic_blood_pressure_physical_exam_finding,
                                              start_latest_encounter,
                                              end_latest_encounter,
                                              false);
      if (systolic_min && diastolic_min) {
        return (systolic_min < 140 && diastolic_min < 90);
      }
    }
    return false;
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};