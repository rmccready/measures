function () {
  var patient = this;
  var measure = patient.measures["0028"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365 * 24 * 60 * 60;
  var twenty_four_months = 2*year;   // interval used in numerator
  var effective_date = <%= effective_date %>;
  var latest_birthdate =   effective_date - 18 * year;
  var earliest_encounter = effective_date - 1  * year;
  var latest_encounter =   effective_date;
  var all_encounters_in_measurement_period = selectWithinRange(_.flatten(_.compact( [ measure.encounter_health_and_behavior_assessment_encounter, 
                                      measure.encounter_occupational_therapy_encounter, 
                                      measure.encounter_psychiatric_psychologic_encounter,
                                      measure.encounter_prev_med_services_18_and_older_encounter,
                                      measure.encounter_prev_med_other_services_encounter,
                                      measure.encounter_prev_med_individual_counseling_encounter,
                                      measure.encounter_prev_med_group_counseling_encounter])), earliest_encounter, latest_encounter);

  var population = function() {
    num_other_encounters = 
      inRange(measure.encounter_health_and_behavior_assessment_encounter, earliest_encounter, latest_encounter) +
      inRange(measure.encounter_occupational_therapy_encounter, earliest_encounter, latest_encounter) +
      inRange(measure.encounter_office_visit_encounter, earliest_encounter, latest_encounter) +
      inRange(measure.encounter_psychiatric_psychologic_encounter, earliest_encounter, latest_encounter);
    num_preventive_encounters = 
      inRange(measure.encounter_prev_med_services_18_and_older_encounter, earliest_encounter, latest_encounter) +
      inRange(measure.encounter_prev_med_other_services_encounter, earliest_encounter, latest_encounter) +
      inRange(measure.encounter_prev_med_individual_counseling_encounter, earliest_encounter, latest_encounter) +
      inRange(measure.encounter_prev_med_group_counseling_encounter, earliest_encounter, latest_encounter);

    return (patient.birthdate <= latest_birthdate && ((num_other_encounters >= 2) || (num_preventive_encounters >= 1)));
  }

  var denominator = function() {
    return true;
  }

  var numerator = function() {
    if (measure.tobacco_user_patient_characteristic == null && measure.tobacco_non_user_patient_characteristic == null) {
        return false;
    }
/*
         o “Patient characteristic: tobacco non-user” using the “tobacco non-user code list” within and including 24 months before or simultaneously to “Encounter: encounter psychiatric & psychologic” ......
         o “Patient characteristic: tobacco user” using the “tobacco user code list” within and including 24 months before or simultaneously to “Encounter: encounter psychiatric & psychologic” ....
*/
// Let's look for an encounter within the measurement period that follows within 24 months of tobacco use/non-use
    tobacco_user = actionAfterSomething(measure.tobacco_user_patient_characteristic, all_encounters_in_measurement_period, twenty_four_months);
    tobacco_non_user = actionAfterSomething(measure.tobacco_non_user_patient_characteristic, all_encounters_in_measurement_period, twenty_four_months);
    return (tobacco_user || tobacco_non_user);
  }
  
  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
