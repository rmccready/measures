function () {
  var patient = this;
  var measure = patient.measures["0033"];
  if (measure==null)
    measure={};

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 23*year;
  var latest_birthdate = effective_date - 15*year;
  var earliest_encounter = effective_date - 1*year;
 
/*
The percentage of women 15‐24 years of age who were identified as sexually active and who had at least one test for chlamydia during the measurement year.

*/
  
/* Population
oAND: All patients in the initial patient population;
•AND: “Encounter: encounter outpatient”;
oAND:
•OR: “Procedure performed: procedures indicative of sexually active women”;
•OR: “Laboratory test result: pregnancy test”;
•OR: “Laboratory test performed: pregnancy test”;
•OR: “Device applied: IUD use”;
•OR: “Device allergy: IUD use”;   --- this one is impossible to code for in a c32
•OR: “Communication to patient: contraceptive use education”;  -- this is a procedure
•OR: ”Medication active: contraceptives”;
•OR: ”Medication order: contraceptives”;
•OR: ”Medication dispensed: contraceptives”;
•OR: “Encounter: pregnancy”;
•OR: “Laboratory test performed: lab tests indicative of sexually active woman”;
•OR: “Diagnosis active: sexually active woman”;
*/
  var population = function() {
     
    return (patient.birthdate<=latest_birthdate) && (patient.birthdate>=earliest_birthdate) ;
  }
  
  var denominator = function() {
    encounter_pregnancy = inRange(measure.encounter_pregnancy, earliest_encounter, effective_date);
    encounter_outpatient = inRange(measure.encounter_outpatient, earliest_encounter, effective_date);
    encounters = encounter_pregnancy + encounter_outpatient
    
     contraceptive_use_education = inRange(measure.contraceptive_use_education, earliest_encounter, effective_date);
    contraceptives = inRange(measure.contraceptives, earliest_encounter, effective_date);

     iud_use = inRange(measure.iud_use, earliest_encounter, effective_date);
    contraceptive_use_education  = inRange(measure.contraceptive_use_education, earliest_encounter, effective_date);
    lab_tests_indicative_of_sexually_active_woman = inRange(measure.lab_tests_indicative_of_sexually_active_woman, earliest_encounter, effective_date);
    sexually_active_woman = inRange(measure.sexually_active_woman, earliest_encounter, effective_date);

    return (encounter_pregnancy || encounter_outpatient || contraceptive_use_education || contraceptives || iud_use ||
            lab_tests_indicative_of_sexually_active_woman || sexually_active_woman);
  }
  
  var numerator = function() {
  
    chlamydia_screening = inRange(measure.chlamydia_screening, earliest_encounter, effective_date);
    return chlamydia_screening;
  }
  
  var exclusion = function() {
       retinoid = inRange(measure.retinoid, earliest_encounter, effective_date);
	x_ray_study = inRange(measure.x_ray_study, earliest_encounter, effective_date);

     return(retinoid||x_ray_study)

  }
  
  map(patient, population, denominator, numerator, exclusion);
};
