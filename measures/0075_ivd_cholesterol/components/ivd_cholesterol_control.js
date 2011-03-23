function () {
  var patient = this;
  var measure = patient.measures["0075"];
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
    return true;
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};