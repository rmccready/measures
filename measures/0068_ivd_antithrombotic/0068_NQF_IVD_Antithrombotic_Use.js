function () {
  var patient = this;
  var measure = patient.measures["0068"];
  if (measure===null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var dates_14_to_24_month_start = effective_date - 2*year;
  var dates_14_to_24_month_end = effective_date - 1*year - 61*day;
  var latest_birthdate = effective_date - 18*year; // patients who will reach the age of 18 during the “measurement period”

  var earliest_encounter_0_24 = dates_14_to_24_month_start;
  var latest_encounter_14_24 = dates_14_to_24_month_end;
  var latest_encounter_0_24 = effective_date;
  var earliest_procedure = dates_14_to_24_month_start;
  var latest_procedure_14_24 = dates_14_to_24_month_end; 
  /*
  The percentage of patients 18 years of age and older who were discharged alive for acute myocardial infarction (AMI), coronary artery bypass graft (CABG) or percutaneous transluminal coronary angioplasty (PTCA) from January 1–November 1 of the year prior to the measurement year, or who had a diagnosis of ischemic vascular disease (IVD) during the measurement year and the year prior to the measurement year and who had documentation of use of aspirin or another antithrombotic during the measurement year.
  */
  
  var population = function() {
    return (patient.birthdate<=latest_birthdate);
  }
  
  var denominator = function() {
    ptca = inRange(measure.ptca_procedure_performed, earliest_procedure, latest_procedure_14_24);
    cabg = inRange(measure.cabg_procedure_performed, earliest_procedure, latest_procedure_14_24);
// Measure stewards changed definition, so that simply an active diagnosis is all that is necessary
    ami = inRange(measure.acute_myocardial_infarction_diagnosis_active, latest_encounter_14_24);
    ivd  = inRange(measure.ischemic_vascular_disease_diagnosis_active, earliest_procedure, latest_encounter_0_24);

    return ( (ptca > 0) ||
             (cabg>0) ||
             (ami >0 ) ||
             (ivd >0))

 }
  
  var numerator = function() {
    meds = inRange(measure.oral_anti_platelet_therapy_medication_active, earliest_encounter_0_24, effective_date) +
      inRange(measure.oral_anti_platelet_therapy_medication_order, earliest_encounter_0_24, effective_date) +
      inRange(measure.oral_anti_platelet_therapy_medication_dispensed, earliest_encounter_0_24, effective_date);
    return meds;
  }

  var exclusion = function() {
    false;
  }
  
  // Returns the number of actions that occur after
  // something. The first two arguments are arrays or single-valued time stamps in
  // seconds-since-the-epoch.
  var actionFollowingSomething = function(something, action) {
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
