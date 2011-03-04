function () {
    var patient = this;
    var measure = patient.measures["0041"];

    if (measure === null) {
        measure = {};
    } 
    <%= init_js_frameworks %>

    var day = 24 * 60 * 60;
    var year = 365 * day;
    var effective_date = <%= effective_date %> ;
    var earliest_birthdate = effective_date - 50 * year;
    var earliest_encounter = effective_date - 1 * year;
    var start_flu_encounter = effective_date - 122 * day; // Marc will change these definitions
    var end_flu_encounter = effective_date + 58 * day; // Marc will change these definitions
    var population = function () {

        var num_outpatient_encounters = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
        var other_encounters = _.flatten(_.compact(new Array(measure.encounter_prev_med_40_and_older_encounter, measure.encounter_prev_med_individual_counseling_encounter, measure.encounter_prev_med_other_services_encounter, measure.encounter_nursing_facility_encounter, measure.encounter_nursing_discharge_encounter)));
        var num_other_encounters = inRange(other_encounters, earliest_encounter, effective_date);
        return (patient.birthdate <= earliest_birthdate && (num_outpatient_encounters > 1 || num_other_encounters > 0));

    };

    var denominator = function () {


        return (inRange(measure.encounter_influenza_encounter, start_flu_encounter, end_flu_encounter) > 0);

    };

    var numerator = function () {


        return (eventDuringEncounter(measure.influenza_vaccine_medication_administered, measure.encounter_influenza_encounter) + eventDuringEncounter(measure.influenza_vaccination_procedure_performed, measure.encounter_influenza_encounter));

    };

    var exclusion = function () {

        many_exclusions = _.flatten(_.compact(new Array(measure.allergy_to_eggs_substance_allergy, measure.influenza_vaccine_medication_allergy, measure.influenza_vaccine_medication_adverse_event, measure.influenza_vaccine_medication_intolerance, measure.influenza_vaccine_contraindicated_medication_not_done, measure.influenza_vaccine_declined_medication_not_done, measure.patient_reason_medication_not_done, measure.medical_reason_medication_not_done, measure.system_reason_medication_not_done, measure.influenza_vaccination_procedure_adverse_event, measure.influenza_vaccination_procedure_intolerance)));
        return (many_exclusions.length > 0);

    };

    map(patient, population, denominator, numerator, exclusion);
}
