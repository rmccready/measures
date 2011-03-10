function () {
  var patient = this;
  var measure = patient.measures["0013"];
  if (measure===null){
    measure={};
  };

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var period_start = effective_date - year;
  var latest_birthdate = effective_date - 18*year;
  var ancient_times = effective_date - 200*year;

  var encounters = _.flatten(_.compact([measure.encounter_outpatient_encounter,  measure.encounter_nursing_facility_encounter]));
  
  var population = function() {
    var correct_age = patient.birthdate <= latest_birthdate;
    var hypertension = inRange(measure.hypertension_diagnosis_active, ancient_times, effective_date); // hypertension diagnosis is not bounded in time
    var num_encounters = inRange(encounters, period_start, effective_date);
    return (correct_age && hypertension && (num_encounters>=2));
  };
  
  var denominator = function() {
    return true;
  };
  
  var numerator = function() {
    var systolic = eventDuringEncounter(measure.systolic_blood_pressure_physical_exam_finding, encounters, period_start, effective_date);
    var diastolic = eventDuringEncounter(measure.diastolic_blood_pressure_physical_exam_finding, encounters, period_start, effective_date);
    return (systolic && diastolic);
  };
  
  var exclusion = function() {
    return false;
  };

  map(patient, population, denominator, numerator, exclusion);
}
