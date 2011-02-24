function () {
  var patient = this;
  var measure = patient.measures["0041"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 50*year;
  var earliest_encounter = effective_date - 1*year;
  var start_flu_encounter = effective_date - 122*day;
  var end_flu_encounter = effective_date - 58*day;
  
  var population = function() {
    outpatient_encounters = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    other_encounters = 
      inRange(measure.encounter_prev_med_40_and_older_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_prev_med_group_counseling_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_prev_med_individual_counseling_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_prev_med_other_services_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_nursing_facility_encounter, earliest_encounter, effective_date) +
      inRange(measure.encounter_nursing_discharge_encounter, earliest_encounter, effective_date);
    return (patient.birthdate<=earliest_birthdate && (outpatient_encounters>1 || other_encounters>0));
  }
  
  var denominator = function() {
    flu_encounters = 
      inRange(measure.encounter_outpatient_encounter, start_flu_encounter, end_flu_encounter) + 
      inRange(measure.encounter_prev_med_40_and_older_encounter, start_flu_encounter, end_flu_encounter) + 
      inRange(measure.encounter_prev_med_group_counseling_encounter, start_flu_encounter, end_flu_encounter) + 
      inRange(measure.encounter_prev_med_individual_counseling_encounter, start_flu_encounter, end_flu_encounter) + 
      inRange(measure.encounter_prev_med_other_services_encounter, start_flu_encounter, end_flu_encounter) + 
      inRange(measure.encounter_nursing_facility_encounter, start_flu_encounter, end_flu_encounter) + 
      inRange(measure.encounter_nursing_discharge_encounter, start_flu_encounter, end_flu_encounter); 
    return (flu_encounters>0);
  }
  
  var numerator = function() {
    // should this be start_flu -> end_flu instead ?
    return inRange(measure.influenza_vaccine_medication_administered, earliest_encounter, effective_date);
  }
  
  var exclusion = function() {
    return measure.allergy_to_eggs_substance_allergy ||
      measure.influenza_vaccine_medication_allergy ||
      measure.influenza_vaccine_medication_adverse_event ||
      measure.influenza_vaccine_medication_intolerance ||
      measure.influenza_vaccine_contraindicated_medication_not_done ||
      measure.influenza_vaccine_declined_medication_not_done ||
      measure.patient_reason_medication_not_done ||
      measure.medical_reason_medication_not_done ||
      measure.system_reason_medication_not_done;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
