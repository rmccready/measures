function () {
  var patient = this;
  var measure = patient.measures["0041"];
  if (measure===null){
    measure={};
  }

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 50*year;
  var earliest_encounter = effective_date - 1*year;
  var start_flu_encounter = effective_date - 122*day;
  var end_flu_encounter = effective_date - 58*day;
  
  var population = function() { 
    var num_outpatient_encounters = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    var other_encounters = _.flatten(_.compact(new Array(measure.encounter_prev_med_40_and_older_encounter,                      
                                                     measure.encounter_prev_med_individual_counseling_encounter,   
                                                     measure.encounter_prev_med_other_services_encounter, 
                                                     measure.encounter_nursing_facility_encounter, 
                                                     measure.encounter_nursing_discharge_encounter)));
    var num_other_encounters = inRange(other_encounters, earliest_encounter, effective_date);
    return (patient.birthdate<=earliest_birthdate && (num_outpatient_encounters>1 || num_other_encounters>0));
  }
  
  var denominator = function() {
   var flu_encounters = _.flatten(_.compact(new Array(measure.encounter_outpatient_encounter,
                                                  measure.encounter_prev_med_40_and_older_encounter,                      
                                                     measure.encounter_prev_med_individual_counseling_encounter,   
                                                     measure.encounter_prev_med_other_services_encounter, 
                                                     measure.encounter_nursing_facility_encounter, 
                                                     measure.encounter_nursing_discharge_encounter)));
     var num_flu_encounters = inRange(flu_encounters, start_flu_encounter, end_flu_encounter) ;
    return (num_flu_encounters>0);
  }
  
  var numerator = function() {
   var flu_encounters = _.flatten(_.compact(new Array(measure.encounter_outpatient_encounter,
                                                  measure.encounter_prev_med_40_and_older_encounter,                      
                                                     measure.encounter_prev_med_individual_counseling_encounter,   
                                                     measure.encounter_prev_med_other_services_encounter, 
                                                     measure.encounter_nursing_facility_encounter, 
                                                     measure.encounter_nursing_discharge_encounter)));
    return (eventDuringEncounter(measure.influenza_vaccine_medication_administered, flu_encounters) + 
            eventDuringEncounter(measure.influenza_vaccination_procedure_performed, flu_encounters));
  }
  
  var exclusion = function() {
     many_exclusions = _.flatten(_.compact(new Array(measure.allergy_to_eggs_substance_allergy,
                                                     measure.influenza_vaccine_medication_allergy,
                                                     measure.influenza_vaccine_medication_adverse_event,
                                                     measure.influenza_vaccine_medication_intolerance,
                                                     measure.influenza_vaccine_contraindicated_medication_not_done,
                                                     measure.influenza_vaccine_declined_medication_not_done,
      							measure.patient_reason_medication_not_done,
      							measure.medical_reason_medication_not_done,
      							measure.system_reason_medication_not_done)));
   return (many_exclusions.length > 0);
  }
   // Returns count of number of diagnoses that occured within 1 day of an encounter
var eventDuringEncounter = function(event, encounter, startTimeRange, endTimeRange){
   if(!event || !encounter) return(0);

   var result = 0;
   if (!_.isArray(event))
      event = [event];
    if (!_.isArray(encounter))
      encounter = [encounter];
    // for each event, see if there is an encounter within 1 day
    for(var i = 0; i<event.length;i++){
        if(!event[i] || event[i]>endTimeRange || event[i]<startTimeRange) continue;
        window_start = event[i] - day;
	window_end = event[i] + day;
      for (var j=0; j<encounter.length;j++) {
        if(!encounter[i] || encounter[i]>endTimeRange || encounter[i]<startTimeRange) continue;
        if (encounter[j]>=window_start && encounter[j]<= window_end )
          result++;
      }
    }
    return result;
}

  map(patient, population, denominator, numerator, exclusion);
};


