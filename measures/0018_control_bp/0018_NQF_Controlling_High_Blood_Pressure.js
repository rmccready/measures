function () {
  var patient = this;
  var measure = patient.measures["0018"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var period_start = effective_date - year;
  var hypertension_diagnosis_end = period_start+year/2;
  var latest_birthdate = effective_date - 18*year;
  var earliest_birthdate = effective_date - 85*year;
  
  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    var hypertension_diagnosis = inRange(measure.hypertension_diagnosis_active, period_start, hypertension_diagnosis_end);
    var encounter = inRange(measure.encounter_outpatient_encounter, period_start, effective_date);
    var esrd = inRange(measure.esrd_diagnosis_active, period_start, effective_date) +
               inRange(measure.procedures_indicative_of_esrd_procedure_performed, period_start, effective_date);
    var pregnant = inRange(measure.pregnancy_diagnosis_active, period_start, effective_date);
    return (hypertension_diagnosis && encounter && !(esrd || pregnant));
  }
  
  var numerator = function() {
    var latest_encounter = maxInRange(measure.encounter_outpatient_encounter, period_start, effective_date);
    // for measure purposes a BP reading is considered to be *during* an encounter if its timestamp
    // is between 24 hours before and 24 hours after the timestamp of the encounter
    var start_latest_encounter = latest_encounter-day;
    var end_latest_encounter = latest_encounter+day;
    
    var systolic_min = minValueInDateRange(measure.systolic_blood_pressure_physical_exam_finding, start_latest_encounter, end_latest_encounter, 200);
    var diastolic_min = minValueInDateRange(measure.diastolic_blood_pressure_physical_exam_finding, start_latest_encounter, end_latest_encounter, 200);
    return (systolic_min<140 && diastolic_min<90);
  }
  
  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
