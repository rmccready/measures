function () {
  var patient = this;
  var measure = patient.measures["0068"];
  if (measure===null)
    measure={};

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var dates_14_to_24_month_start = effective_date - 2*year;
  var dates_14_to_24_month_end = effective_date - 1*year - 61*day;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter_0_24 = dates_14_to_24_month_start;
  var latest_encounter_14_24 = dates_14_to_24_month_end;
  var latest_encounter_0_24 = effective_date;
  var earliest_procedure = dates_14_to_24_month_start;
  var latest_procedure_14_24 = dates_14_to_24_month_end; 
  var earliest_diagnosis = dates_14_to_24_month_start;

/*
The percentage of patients 18 years of age and older who were discharged alive for acute myocardial infarction (AMI), coronary artery bypass graft (CABG) or percutaneous transluminal coronary angioplasty (PTCA) from January 1–November 1 of the year prior to the measurement year, or who had a diagnosis of ischemic vascular disease (IVD) during the measurement year and the year prior to the measurement year and who had documentation of use of aspirin or another antithrombotic during the measurement year.

*/
  
  var population = function() {
    return (patient.birthdate<=latest_birthdate);
  }
  
  var denominator = function() {
      encounters_24 = inRange(measure.encounter_acute_inpt_and_outpt, earliest_encounter_0_24, effective_date);
      encounters_14_24 = inRange(measure.encounter_acute_inpt_and_outpt, earliest_encounter_0_24, latest_encounter_14_24);

    ami = inRange(measure.acute_myocardial_infarction, earliest_procedure, latest_procedure_14_24);
    cabg = inRange(measure.cabg, earliest_procedure, latest_procedure_14_24);

    ptca = inRange(measure.ptca, earliest_procedure, latest_procedure_14_24);
    ivd = inRange(measure.ischemic_vascular_disease, earliest_diagnosis, effective_date);

    encounter_after_ami_diagnosis = actionAfterSomething(measure.encounter_acute_inpt_and_outpt, measure.acute_myocardial_infarction);
    encounter_after_ivd_diagnosis = actionAfterSomething(measure.encounter_acute_inpt_and_outpt, measure.ischemic_vascular_disease); 
    return ( ptca || ((encounters_14_24>0) && (ami || cabg)) || (encounter_after_ami_diagnosis>0 )|| (encounter_after_ivd_diagnosis > 0))

 }
  
  var numerator = function() {
   meds = inRange(measure.oral_anti_platelet_therapy, earliest_encounter_0_24, effective_date);
    return meds;
  }
  
  var exclusion = function() {
    false;
  }
  
  // Returns the number of actions that occur after
  // something. The first two arguments are arrays or single-valued time stamps in
  // seconds-since-the-epoch.
  var actionAfterSomething = function(something, action) {
    if (!_.isArray(something))
      something = [something];
    if (!_.isArray(action))
      action = [action];
    
    var result = 0;
    for (i=0; i<something.length; i++) {
      timeStamp = something[i];
      for (j=0; j<action.length;j++) {
        if (action[j]>=timeStamp )
          result++;
      }
    }
    return result;
  }

  map(patient, population, denominator, numerator, exclusion);
};
