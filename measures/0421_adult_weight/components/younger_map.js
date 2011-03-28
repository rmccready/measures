function () {
  var patient = this;
  var measure = patient.measures["0421"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_birthdate = effective_date - 65*year;
  var earliest_encounter = effective_date - year;
  
  var population = function() {
    var correct_age = inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
    return (correct_age);
  }
  
  var denominator = function() {
    return inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
  }
  
  var numerator = function() {
    return weight_numerator(measure, 18.5, 25);
  }
  
  var exclusion = function() {
    return weight_exclusion(measure, earliest_encounter, effective_date);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};