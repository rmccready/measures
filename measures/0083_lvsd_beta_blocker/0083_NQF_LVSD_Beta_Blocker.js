function () {
  var patient = this;
  var measure = patient.measures["0083"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter = effective_date - 1*year;
  var all_encounters = _.flatten(_.compact([
    measure.encounter_nursing_facility_encounter,
    measure.encounter_outpatient_encounter]));
  var encounters_in_range = selectWithinRange(all_encounters, earliest_encounter, effective_date);
  
  var population = function() {
    var hf_before_encounter = actionAfterSomething(
      measure.heart_failure_diagnosis_active, all_encounters);
    var encounters_in_range = inRange(all_encounters, earliest_encounter, effective_date);
      
    return (patient.birthdate<=latest_birthdate) && hf_before_encounter &&
      (encounters_in_range>=2);
  }
  
  var denominator = function() {
    var final_encounter = _.max(encounters_in_range);
    var lvf = minValueInDateRange(measure.lvf_assmt_diagnostic_study_result,
      patient.birthdate, final_encounter, 100);
    var eject = minValueInDateRange(measure.ejection_fraction_diagnostic_study_result,
      patient.birthdate, final_encounter, 100);
    return (lvf<40) || (eject<40);
  }
  
  var numerator = function() {
    var active = inRange(measure.beta_blocker_therapy_medication_active, 
      earliest_encounter, effective_date);
    var order = inRange(measure.beta_blocker_therapy_medication_order, 
      earliest_encounter, effective_date);
    return (active || order);
  }
  
  var exclusion = function() {
    var allergy = actionAfterSomething(
      measure.beta_blocker_therapy_medication_allergy, all_encounters);
    var adverse = actionAfterSomething(
      measure.beta_blocker_therapy_medication_adverse_event, all_encounters);
    var intollerence = actionAfterSomething(
      measure.beta_blocker_therapy_medication_intolerance, all_encounters);
    var patient = inRange(measure.patient_reason_medication_not_done, 
      earliest_encounter, effective_date);
    var medical = inRange(measure.medical_reason_medication_not_done, 
      earliest_encounter, effective_date);
    var system = inRange(measure.system_reason_medication_not_done, 
      earliest_encounter, effective_date);
      
    var arrhythmia = actionAfterSomething(
      measure.arrhythmia_diagnosis_active, all_encounters);
    var hypotension = actionAfterSomething(
      measure.hypotension_diagnosis_active, all_encounters);
    var asthma = actionAfterSomething(
      measure.asthma_diagnosis_active, all_encounters);
    var block = actionAfterSomething(
      measure.atrioventricular_block_diagnosis_active, all_encounters);
    var cardiac_pacer_in_situ = actionAfterSomething(
      measure.cardiac_pacer_in_situ_diagnosis_active, all_encounters);
    var cardiac_pacer = actionAfterSomething(
      measure.cardiac_pacer_device_applied, all_encounters);
    var bradycardia = actionAfterSomething(
      measure.bradycardia_diagnosis_active, all_encounters);
    var heart_rate = actionAfterSomething(
      measure.heart_rate_physical_exam_finding, all_encounters);
      
    return (allergy || adverse || intollerence || patient || medical || system || 
      arrhythmia || hypotension || asthma || 
      (block && !(cardiac_pacer_in_situ || cardiac_pacer)) || 
      bradycardia || heart_rate);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};