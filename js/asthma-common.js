// Common functions for variants of 0036 asthma screening.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
(function () {

  var root = this;
  
  root.asthmaNumerator = function(measure, earliest_encounter, effective_date) {
    var antiasmathic_med = 
      inRange(measure.antiasthmatic_combinations_medication_active, earliest_encounter, effective_date) +
      inRange(measure.antiasthmatic_combinations_medication_order, earliest_encounter, effective_date) +
      inRange(measure.antiasthmatic_combinations_medication_dispensed, earliest_encounter, effective_date) ;
   
    var antibody_med = 
      inRange(measure.antibody_inhibitor_medication_active, earliest_encounter, effective_date)+
      inRange(measure.antibody_inhibitor_medication_order, earliest_encounter, effective_date)+
      inRange(measure.antibody_inhibitor_medication_dispensed, earliest_encounter, effective_date) ;
  
    var corticosteroid_med = 
      inRange(measure.inhaled_corticosteroids_medication_active, earliest_encounter, effective_date) +
      inRange(measure.inhaled_corticosteroids_medication_order, earliest_encounter, effective_date) +
      inRange(measure.inhaled_corticosteroids_medication_dispensed, earliest_encounter, effective_date);
      
    var steroid_med = 
      inRange(measure.inhaled_steroid_combinations_medication_active, earliest_encounter, effective_date) +
      inRange(measure.inhaled_steroid_combinations_medication_order, earliest_encounter, effective_date) +
      inRange(measure.inhaled_steroid_combinations_medication_dispensed, earliest_encounter, effective_date);
  
    var mast_cell_med = 
      inRange(measure.mast_cell_stabilizer_medication_active, earliest_encounter, effective_date) +
      inRange(measure.mast_cell_stabilizer_medication_order, earliest_encounter, effective_date) +
      inRange(measure.mast_cell_stabilizer_medication_dispensed, earliest_encounter, effective_date);
  
    var methylxanthine_med = 
      inRange(measure.methylxanthines_medication_active, earliest_encounter, effective_date) +
      inRange(measure.methylxanthines_medication_order, earliest_encounter, effective_date) +
      inRange(measure.methylxanthines_medication_dispensed, earliest_encounter, effective_date);
  
    return (antiasmathic_med + antibody_med + corticosteroid_med + steroid_med  +
      mast_cell_med + methylxanthine_med); 
  }
  
  root.asthmaDenominator = function(measure, earliest_encounter, effective_date) {
    var long_acting_beta_med = 
      inRange(measure.long_acting_inhaled_beta_2_agonist_medication_active, earliest_encounter, effective_date)+
      inRange(measure.long_acting_inhaled_beta_2_agonist_medication_order, earliest_encounter, effective_date)+
      inRange(measure.long_acting_inhaled_beta_2_agonist_medication_dispensed, earliest_encounter, effective_date);
  
    var short_acting_beta_med = 
      inRange(measure.short_acting_beta_2_agonist_medication_active, earliest_encounter, effective_date)+
      inRange(measure.short_acting_beta_2_agonist_medication_order, earliest_encounter, effective_date)+
      inRange(measure.short_acting_beta_2_agonist_medication_dispensed, earliest_encounter, effective_date);

    var leukotriene_med = 
      inRange(measure.leukotriene_inhibitors_medication_active, earliest_encounter, effective_date) +
      inRange(measure.leukotriene_inhibitors_medication_order, earliest_encounter, effective_date) +
      inRange(measure.leukotriene_inhibitors_medication_dispensed, earliest_encounter, effective_date);
  
    var denom_meds = long_acting_beta_med + short_acting_beta_med + asthmaNumerator(measure, earliest_encounter, effective_date);
    var ed_encounter = inRange(measure.encounter_ed_encounter, earliest_encounter, effective_date);
    var asthma = inRange(measure.asthma_diagnosis_active, earliest_encounter, effective_date);
    var acute_inpt_encounter = inRange(measure.encounter_acute_inpt_encounter, earliest_encounter, effective_date);
    var outpt_encounter = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    
    return (ed_encounter && asthma) || 
      (acute_inpt_encounter && asthma) || 
      (outpt_encounter >= 4 && asthma && ( (denom_meds + leukotriene_med) >= 2)) || 
      (denom_meds >= 4) || 
      (leukotriene_med >= 4 && asthma);
  }

  root.asthmaExclusion = function(measure) {
    var copd = normalize(measure.copd_diagnosis_active);
    var cystic = normalize(measure.cystic_fibrosis_diagnosis_active);
    var emphysema = normalize(measure.emphysema_diagnosis_active);
    var failure = normalize(measure.acute_respiratory_failure_diagnosis_active);
    return copd.length>0 || cystic.length>0 || emphysema.length>0 || failure.length>0;
  }
  
  
})();