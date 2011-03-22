function () {
  var patient = this;
  var measure = patient.measures["0033"];
  if (measure==null)
    measure={};
  
  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 19*year;
  var latest_birthdate = effective_date - 14*year;
  var earliest_encounter = effective_date - 1*year;
  var pregnancy_tests = normalize(measure.pregnancy_test_laboratory_test_performed,
    measure.pregnancy_test_laboratory_test_result);
  
  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    return chlamydiaDenominator(measure, pregnancy_tests, earliest_encounter, effective_date);
  }
  
  var numerator = function() {
    return inRange(measure.chlamydia_screening_laboratory_test_performed, earliest_encounter, effective_date);
  }
  
  var exclusion = function() {
    return chlamydiaExclusion(measure, pregnancy_tests, earliest_encounter, effective_date);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};