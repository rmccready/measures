function () {
  var patient = this;
  var measure = patient.measures["0014"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365 * day;
  var effective_date =  <%= effective_date %>;
  var earliest_encounter = effective_date - year;

  var population = function() {
    live_birth_diagnosis = inRange(measure.delivery_live_births_diagnosis_diagnosis_active, earliest_encounter, effective_date);
    live_birth_procedure = inRange(measure.delivery_live_births_procedure_procedure_performed, earliest_encounter, effective_date);
    return live_birth_diagnosis && live_birth_procedure;
  }
  
  var denominator = function() {
    if (!measure.estimated_date_of_conception_patient_characteristic)
      return false;
    estimated_conception = _.max(measure.estimated_date_of_conception_patient_characteristic);
    prenatal_encounter = inRange(measure.prenatal_visit_encounter, estimated_conception, effective_date);
    drh_neg_diagnosis = inRange(measure.d_rh_negative_diagnosis_active, earliest_encounter, effective_date);
    primigravida = inRange(measure.primigravida_diagnosis_active, earliest_encounter, effective_date);
    multigravida = inRange(measure.multigravida_diagnosis_active, earliest_encounter, effective_date);
    rh_status_mother = minValueInDateRange(measure.rh_status_mother_laboratory_test_result, earliest_encounter, effective_date, false)
    rh_status_baby = minValueInDateRange(measure.rh_status_baby_laboratory_test_result, earliest_encounter, effective_date, false)
    return prenatal_encounter && drh_neg_diagnosis && (
      (primigravida && !rh_status_mother) || 
      (multigravida && !rh_status_mother && !rh_status_baby));
  }

  var numerator = function() {
    estimated_conception = _.max(measure.estimated_date_of_conception_patient_characteristic);
    estimated_conception_within_ten_months = actionFollowingSomething(estimated_conception, measure.delivery_live_births_procedure_procedure_performed, 304*day);
    
    antid_admin_within_30_weeks = actionFollowingSomething(estimated_conception, measure.anti_d_immune_globulin_medication_administered, 30*7*day);
    antid_admin_within_26_weeks = actionFollowingSomething(estimated_conception, measure.anti_d_immune_globulin_medication_administered, 26*7*day);
    
    return estimated_conception_within_ten_months && antid_admin_within_30_weeks && !antid_admin_within_26_weeks;
  }

  var exclusion = function() {
    medical_reason = inRange(measure.medical_reason_medication_not_done, earliest_encounter, effective_date);
    patient_reason = inRange(measure.patient_reason_medication_not_done, earliest_encounter, effective_date);
    system_reason = inRange(measure.system_reason_medication_not_done, earliest_encounter, effective_date);
    return system_reason || medical_reason || patient_reason;
  }

  map(patient, population, denominator, numerator, exclusion);
};