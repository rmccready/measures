function () {
  var patient = this;
  var measure = patient.measures["0421"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 65*year;
  var earliest_encounter = effective_date - year;
  
  var population = function() {
    var correct_age = patient.birthdate <= latest_birthdate;
    return (correct_age);
  }
  
  var denominator = function() {
    return inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
  }
  
  var numerator = function() {
    return weight_numerator(measure, 22, 30);
  }
  
  var exclusion = function() {
    var terminal_illness = actionFollowingSomething(measure.terminal_illness_patient_characteristic, measure.encounter_outpatient_encounter, year/2);
    var pregnant = inRange(measure.pregnancy_diagnosis_active, earliest_encounter, effective_date);
    var not_done = inRange(measure.physical_exam_not_done_physical_exam_not_done, earliest_encounter, effective_date);
    return pregnant || not_done || terminal_illness;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};