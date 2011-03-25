function () {
  var patient = this;
  var measure = patient.measures["0387"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter = effective_date - 1*year;
  var latest_encounter = inRange(measure.encounter_office_visit_encounter, earliest_encounter, effective_date);
  
  var population = function() {
    var age_match = patient.birthdate <= latest_birthdate;
    if (!latest_encounter)
      return false;
// The measure spec says that the breast_cancer/breast_cancer_history should happen before
// an encounter...clearly it must also happen before the latest_encounter.  Since latest_encounter will be null if there
// are no relevant encounters, we return if it is null.
    var breast_cancer = lessThan(measure.breast_cancer_diagnosis_active, latest_encounter); 
    var breast_cancer_history = lessThan(measure.breast_cancer_history_diagnosis_inactive, latest_encounter);
    return (age_match && (breast_cancer || breast_cancer_history) ;
  }
  
  var denominator = function() {
    var breast_cancer_stage_ic_iiic = lessThan(measure.breast_cancer_stage_ic_iiic_procedure_result, latest_encounter); 
    var breast_cancer_er_or_pr_positive = lessThan(breast_cancer_er_or_pr_positive_procedure_result, latest_encounter); 
    return (patient.gender == "F"  && breast_cancer_stage_ic_iiic && breast_cancer_er_or_pr_positive);
  }
  
  var numerator = function() {
    var med_order =
    var meds = _.flatten([measure.tamoxifen_or_aromatase_inhibitor_therapy_medication_order, measure.tamoxifen_or_aromatase_inhibitor_therapy_medication_active]);
    var meds = inRange(meds, earliest_encounter, effective_date);
    return (meds)
  }
  
  var exclusion = function() {
    var meds_issues = _.flatten([measure.tamoxifen_or_aromatase_inhibitor_therapy_medication_intolerance, measure.tamoxifen_or_aromatase_inhibitor_therapy_medication_adverse_event, measure.tamoxifen_or_aromatase_inhibitor_therapy_medication_allergy]);

    var meds_issues_happened = inRange(meds_issues, earliest_encounter, effective_date);
    var metastatic_sites = lessThan(measure.metastatic_sites_common_to_breast_cancer_diagnosis_active, latest_encounter);
    var bilateral_oophorectomy = lessThan(measure.bilateral_oophorectomy_procedure_performed, latest_encounter);
    var radiation_therapy = lessThan(measure.radiation_therapy_procedure_performed, latest_encounter);
    var chemotherapy = lessThan(measure.chemotherapy_procedure_performed, latest_encounter);
    var medical = lessThan(measure.medical_reason_medication_not_done, effective_date);
    var patient = lessThan(measure.patient_reason_medication_not_done, effective_date);
    var system = lessThan(measure.system_reason_medication_not_done, effective_date);
    return meds_issues_happened || metastatic_sites || bilateral_oophorectomy || radiation_therapy || chemotherapy || medical || patient || system;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
