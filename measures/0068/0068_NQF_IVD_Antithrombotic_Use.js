function () {
  var patient = this;
  var measure = patient.measures["0068"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter = effective_date - 1*year;
  var earliest_procedure = effective_date - 1*year;
  var latest_procedure = effective_date - 61*day;  // December+November = 31+30 days
  var earliest_diagnosis = effective_date - 1*year;

/*
The percentage of patients 18 years of age and older who were discharged alive for acute myocardial infarction (AMI), coronary artery bypass graft (CABG) or percutaneous transluminal coronary angioplasty (PTCA) from January 1–November 1 of the year prior to the measurement year, or who had a diagnosis of ischemic vascular disease (IVD) during the measurement year and the year prior to the measurement year and who had documentation of use of aspirin or another antithrombotic during the measurement year.

*/
  
  var population = function() {
    encounters = inRange(measure.encounter_acute_inpt_and_outpt, earliest_encounter, effective_date);
    ami = inRange(measure.acute_myocardial_infarction, earliest_procedure, latest_procedure);
    cabg = inRange(measure.cabg, earliest_procedure, latest_procedure);
    ptca = inRange(measure.ptca, earliest_procedure, latest_procedure);
    ivd = inRange(measure.ischemic_vascular_disease, earliest_diagnosis, effective_date);
     
    
    return (patient.birthdate<=latest_birthdate) && (encounters>1) && (ami || cabg || ptca || ivd);
  }
  
  var denominator = function() {
    return true;
  }
  
  var numerator = function() {
   meds = inRange(measure.oral_anti-platelet_therapy, earlist_encounter, effective_date);
    return meds;
  }
  
  var exclusion = function() {
    false;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
