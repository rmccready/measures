function () {
  var patient = this;
  var measure = patient.measures["0421"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 65*year;
  var earliest_encounter = effective_date - year;
  
  var population = function() {
    var correct_age = patient.birthdate <= latest_birthdate;
    return (correct_age);
  }
  
  var denominator = function() {
    return inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
  }
  
  var numerator = function() {
    if (measure.encounter_outpatient_encounter==null)
      return false;
    for(i=0;i<measure.encounter_outpatient_encounter.length;i++) {
      // for each encounter date
      var encounter_date = measure.encounter_outpatient_encounter[i];
      var earliest_bmi = encounter_date - year/2;
      if (measure.bmi_physical_exam_finding==null)
        return false;
      for (j=0;j<measure.bmi_physical_exam_finding.length;j++) {
        // look for BMI measurements <=6 months before current encounter
        var bmi = measure.bmi_physical_exam_finding[j];
        if (inRange(bmi.date, earliest_bmi, encounter_date)) {
          if (bmi.value>=22 && bmi.value<30)
            return true;
          else if (measure.dietary_consultation_order_communication_provider_to_provider!=null && measure.dietary_consultation_order_communication_provider_to_provider.length>0)
            return true;
          else if (measure.follow_up_plan_bmi_management_care_plan!=null && measure.follow_up_plan_bmi_management_care_plan.length>0)
            return true;
        }
      }
    }
    return false;
  }
  
  var exclusion = function() {
    var terminal_illness = actionFollowingSomething(measure.terminal_illness_patient_characteristic, measure.encounter_outpatient_encounter, year/2);
    var pregnant = inRange(measure.pregnancy_diagnosis_active, earliest_encounter, effective_date);
    return pregnant || measure.physical_exam_not_done_physical_exam_not_done || terminal_illness;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};