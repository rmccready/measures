function () {
  var patient = this;
  var measure = patient.measures["0028"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter = effective_date - 2*year;
  var latest_encounter = effective_date - 1*year;
  
  var population = function() {
    other_encounters = 
      inRange(measure.encounter_health_and_behavior_assessment_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_occupational_therapy_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_office_visit_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_psychiatric_psychologic_encounter, earliest_encounter, effective_date);
    preventive_encounters = 
      inRange(measure.encounter_prev_med_services_18_and_older_encounter, latest_encounter, effective_date) +
      inRange(measure.encounter_prev_med_other_services_encounter, latest_encounter, effective_date) +
      inRange(measure.encounter_prev_med_individual_counseling_encounter, latest_encounter, effective_date) +
      inRange(measure.encounter_prev_med_group_counseling_encounter, latest_encounter, effective_date);
    return (patient.birthdate<=latest_birthdate && (other_encounters>1 || preventive_encounters>0));
  }
  
  var denominator = function() {
    return inRange(measure.tobacco_user_patient_characteristic, earliest_encounter, effective_date);
  }
  
  var numerator = function() {
    cessation_procedure = inRange(measure.tobacco_use_cessation_counseling_procedure_performed, earliest_encounter, effective_date);
    cessation_medication_active = inRange(measure.smoking_cessation_agents_medication_active, earliest_encounter, effective_date);
    cessation_medication_order = inRange(measure.smoking_cessation_agents_medication_order, earliest_encounter, effective_date);
    return (cessation_procedure || cessation_medication_active || cessation_medication_order);
  }
  
  var exclusion = function() {
    return false;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};