function () {
  var patient = this;
  var measure = patient.measures["0088"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter = effective_date - 1*year;
  
  var population = function() {
    var domiciliary = measure.encounter_domiciliary_encounter || [];
    var nursing = measure.encounter_nursing_facility_encounter || [];
    var outpatient = measure.encounter_office_outpatient_consult_encounter || [];
    var ophthalmological = measure.encounter_ophthalmological_services_encounter || [];
    var all_encounters = _.flatten([domiciliary, nursing, outpatient, ophthalmological]);
    var encounters = inRange(all_encounters, earliest_encounter, effective_date);
    var retinopathy = inRange(measure.diabetic_retinopathy_diagnosis_active, earliest_encounter, effective_date);
    return (patient.birthdate<=latest_birthdate) && (encounters>1) && retinopathy;
  }
  
  var denominator = function() {
    return true;
  }
  
  var numerator = function() {
    var macular_fundus = inRange(measure.macular_or_fundus_exam_procedure_performed, earliest_encounter, effective_date);
    var macular_edema = inRange(measure.macular_edema_findings_physical_exam_finding, earliest_encounter, effective_date);
    var retinopathy = inRange(measure.level_of_severity_of_retinopathy_findings_physical_exam_finding, earliest_encounter, effective_date);
    var retinopathy_and_macular = inRange(measure.severity_of_retinopathy_and_macular_edema_findings_physical_exam_finding, earliest_encounter, effective_date);
    return macular_fundus && ((macular_edema && retinopathy) || retinopathy_and_macular);
  }
  
  var exclusion = function() {
    var patient = inRange(measure.patient_reason_procedure_not_done, earliest_encounter, effective_date);
    var medical = inRange(measure.medical_reason_procedure_not_done, earliest_encounter, effective_date);
    return patient || medical;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
