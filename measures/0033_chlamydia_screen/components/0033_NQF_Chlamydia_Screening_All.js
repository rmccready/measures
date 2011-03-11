function () {
  var patient = this;
  var measure = patient.measures["0033"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 23 * year;
  var latest_birthdate =   effective_date - 15 * year;
  var earliest_encounter = effective_date - 1 * year;

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }

  var denominator = function() {
    // events bounded by measurement period
    var indicative_procedure = inRange(measure.procedures_indicative_of_sexually_active_woman_procedure_performed, earliest_encounter, effective_date);
    var pregnancy_test = inRange(measure.pregnancy_test_laboratory_test_performed, earliest_encounter, effective_date) +
                         inRange(measure.pregnancy_test_laboratory_test_result, earliest_encounter, effective_date);

     // events prior to end of measurement period (could be before measurement period)
    var indicative_labs = lessThan(measure.laboratory_tests_indicative_of_sexually_active_women_laboratory_test_performed,  effective_date);
    var outpatient_encounter = lessThan(measure.encounter_outpatient_encounter, effective_date);
    var iud = lessThan(measure.iud_use_device_applied, earliest_encounter, effective_date);
    var education = lessThan(measure.contraceptive_use_education_communication_to_patient, effective_date);
    var contraceptives = lessThan(measure.contraceptives_medication_active, effective_date);
    var pregnancy_encounter = lessThan(measure.encounter_pregnancy_encounter, effective_date);
    var active = lessThan(measure.sexually_active_woman_diagnosis_active, effective_date);
    
    return (outpatient_encounter && 
           (indicative_procedure || pregnancy_test || iud || education || contraceptives || pregnancy_encounter || indicative_labs || active));
  }
  
  var numerator = function() {
    return inRange(measure.chlamydia_screening_laboratory_test_performed, earliest_encounter, effective_date);
  }
  
  var exclusion = function() {
    var pregnancy_test = inRange(measure.pregnancy_test_laboratory_test_performed, earliest_encounter, effective_date) +
                         inRange(measure.pregnancy_test_laboratory_test_result, earliest_encounter, effective_date);
    if (!pregnancy_test)
      return false;
    
    var inMeasureDateRange = function(reading) {
      var result = inRange(reading, earliest_encounter, effective_date);
      return result;
    };
    
    if (!_.isArray(measure.pregnancy_test_laboratory_test_performed))
      measure.pregnancy_test_laboratory_test_performed = [measure.pregnancy_test_laboratory_test_performed];
    if (!_.isArray(measure.pregnancy_test_laboratory_test_results))
      measure.pregnancy_test_laboratory_test_result = [measure.pregnancy_test_laboratory_test_result];

    var pregnancyTestsInMeasureRange = _.select(measure.pregnancy_test_laboratory_test_performed, inMeasureDateRange);
    var pregnancyTestResultsInMeasureRange = _.select(measure.pregnancy_test_laboratory_test_result, inMeasureDateRange);
   
    var retinoid = actionFollowingSomething(pregnancyTestResultsInMeasureRange, measure.retinoid_medication_active, 7*day) +
                   actionFollowingSomething(pregnancyTestResultsInMeasureRange, measure.retinoid_medication_order, 7*day) +
                   actionFollowingSomething(pregnancyTestResultsInMeasureRange, measure.retinoid_medication_dispensed, 7*day);
                   actionFollowingSomething(pregnancyTestsInMeasureRange, measure.retinoid_medication_active, 7*day) +
                   actionFollowingSomething(pregnancyTestsInMeasureRange, measure.retinoid_medication_order, 7*day) +
                   actionFollowingSomething(pregnancyTestsInMeasureRange, measure.retinoid_medication_dispensed, 7*day);

    var x_ray = actionFollowingSomething(pregnancyTestsInMeasureRange, measure.x_ray_study_diagnostic_study_performed, 7*day) +
                actionFollowingSomething(pregnancyTestResultsInMeasureRange, measure.retinoid_medication_dispensed, 7*day);
    return retinoid || x_ray;
  }

  map(patient, population, denominator, numerator, exclusion);
};
