function () {
  var patient = this;
  var measure = patient.measures["0001"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365 * 24 * 60 * 60;
  var effective_date =  <%= effective_date %>;
  var earliest_birthdate =  effective_date - 40 * year;
  var latest_birthdate =    effective_date - 5 * year;
  var earliest_diagnosis =  effective_date - 2 * year;

  var population = function() {
    // the number of counts of office encounters and outpatient consults 
    // to determine the physician has a relationship with the patient
    two_office_encounters_and_outpatient_consults = inRange(
      measure.encounter_office_outpatient_consult_encounter, 
      earliest_diagnosis,
      effective_date);

    return (inRange(patient.birthdate, earliest_birthdate, latest_birthdate) 
            && inRange(measure.asthma_diagnosis_active, earliest_diagnosis, effective_date)
            && two_office_encounters_and_outpatient_consults == 2);
  }
  
  var denominator = function() {
    return population();
  }

  var numerator = function() {
    return ((inRange(measure.asthma_daytime_symptoms_diagnosis_active, earliest_diagnosis, effective_date) 
             && 
             inRange(measure.asthma_daytime_symptoms_quantified_symptom_assessed, earliest_diagnosis, effective_date))
            ||
            (inRange(measure.asthma_nighttime_symptoms_symptom_active, earliest_diagnosis, effective_date) 
             && 
             inRange(measure.asthma_nighttime_symptoms_quantified_symptom_assessed, earliest_diagnosis, effective_date))
            ||
            inRange(measure.asthma_symptom_assessment_tool_risk_category_assessment, earliest_diagnosis, effective_date));
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};