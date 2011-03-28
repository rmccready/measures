function () {
  var patient = this;
  var measure = patient.measures["0036"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 50*year;
  var latest_birthdate = effective_date - 12*year;
  var earliest_encounter = effective_date - 1*year;

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    return asthmaDenominator(measure, earliest_birthdate, effective_date);
  }
  
  var numerator = function() {
    return asthmaNumerator(measure, earliest_birthdate, effective_date);
  }
  
  var exclusion = function() {
    return asthmaExclusion(measure);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
