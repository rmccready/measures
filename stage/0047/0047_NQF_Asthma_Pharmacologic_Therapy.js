function () {
  var patient = this;
  var measure = patient.measures["0047"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 40*year;
  var latest_birthdate = effective_date - 5*year;
  var earliest_encounter = effective_date - year;
  
  var population = function() {
    correct_age = inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
    encounters = inRange(measure.encounter, earliest_encounter, effective_date);
    asthma = inRange(measure.asthma, earliest_encounter, effective_date);
    persistent_asthma = inRange(measure.persistent_asthma, earliest_encounter, effective_date);
    return correct_age && (asthma || persistent_asthma) && encounters>=2;
  }
  
  var denominator = function() {
    persistent_asthma = inRange(measure.persistent_asthma, earliest_encounter, effective_date);
    return persistent_asthma;
  }
  
  var numerator = function() {
    medication = inRange(measure.asthma_medication, earliest_encounter, effective_date);
    return medication;
  }
  
  var exclusion = function() {
    return inRange(measure.patient_negation_rationale, earliest_encounter, effective_date);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};