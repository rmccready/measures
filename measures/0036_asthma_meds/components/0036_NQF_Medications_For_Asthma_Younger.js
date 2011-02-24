function () {
  var patient = this;
  var measure = patient.measures["0036"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  
  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var earliest_birthdate = effective_date - 11*year;
  var latest_birthdate = effective_date - 5*year;
  var earliest_encounter = effective_date - 1*year;

  var antiasmathic_med = inRange(measure.antiasthmatic_combinations_medication_active, earliest_encounter, effective_date);
  var antibody_med = inRange(measure.antibody_inhibitor_medication_active, earliest_encounter, effective_date);
  var corticosteroid_med = inRange(measure.inhaled_corticosteroids_medication_active, earliest_encounter, effective_date);
  var steroid_med = inRange(measure.inhaled_steroid_combinations_medication_active, earliest_encounter, effective_date);
  var leukotriene_med = inRange(measure.leukotriene_inhibitors_medication_active, earliest_encounter, effective_date);
  var mast_cell_med = inRange(measure.mast_cell_stabilizer_medication_active, earliest_encounter, effective_date);
  var methylxanthine_med = inRange(measure.methylxanthines_medication_active, earliest_encounter, effective_date);
  
  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    ed_encounter = inRange(measure.encounter_ed_encounter, earliest_encounter, effective_date);
    asthma = inRange(measure.asthma_diagnosis_active, earliest_encounter, effective_date);
    acute_inpt_encounter = inRange(measure.encounter_acute_inpt_encounter, earliest_encounter, effective_date);
    outpt_encounter = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    all_encounters = ed_encounter+acute_inpt_encounter+outpt_encounter;
    long_acting_beta_med = inRange(measure.long_acting_inhaled_beta_2_agonist_medication_active, earliest_encounter, effective_date);
    short_acting_beta_med = inRange(measure.short_acting_beta_2_agonist_medication_active, earliest_encounter, effective_date);
    
    return (ed_encounter && asthma) || 
      (acute_inpt_encounter && asthma) || 
      (all_encounters >= 4 && asthma && 
	    ((antiasmathic_med+antibody_med+corticosteroid_med+steroid_med+leukotriene_med+
	    long_acting_beta_med + mast_cell_med + methylxanthine_med + short_acting_beta_med) >= 2)) || 
	  ((antiasmathic_med + antibody_med + corticosteroid_med + steroid_med + leukotriene_med + 
		long_acting_beta_med + mast_cell_med + methylxanthine_med + short_acting_beta_med) >= 4) || 
	  (leukotriene_med >= 4 && asthma);
  }
  
  var numerator = function() {
    return (antiasmathic_med || antibody_med || corticosteroid_med || steroid_med || leukotriene_med || mast_cell_med || methylxanthine_med);
  }
  
  var exclusion = function() {
    return measure.copd_diagnosis_active ||
      measure.cystic_fibrosis_diagnosis_active ||
      measure.emphysema_diagnosis_active ||
      measure.acute_respiratory_failure_diagnosis_active;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};