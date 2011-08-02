function () {
  var patient = this;
  var measure = patient.measures["0043"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var measurement_period_start = effective_date - 1*year;
  /*
	“Patient characteristic:birthdate”(age)>=64 years before the “measurement period” to 
	capture all patients who will reach the age of 65 and older during the “measurement period”;
  */
  var earliest_birthdate = measurement_period_start - 64*year;
  var earliest_encounter = effective_date - 1*year;
  
  var population = function() {
    return (patient.birthdate <= earliest_birthdate);
  }
  
  var denominator = function() {
    outpatient_encounter = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    return (outpatient_encounter);
  }
  
  var numerator = function() {
    vaccination = lessThan(measure.pneumococcal_vaccination_all_ages_procedure_performed, effective_date);
    vaccine = lessThan(measure.pneumococcal_vaccine_all_ages_medication_administered, effective_date);
    return vaccination || vaccine;
  }
  
  var exclusion = function() {
    return false;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};