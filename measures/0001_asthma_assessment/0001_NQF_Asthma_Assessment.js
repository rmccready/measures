function() {
    var patient = this;
    var measure = patient.measures["0001"];
    if (measure == null)
    measure = {};

    <%=init_js_frameworks %>

    var year = 365 * 24 * 60 * 60;
    var effective_date = <%=effective_date %>;
    /*
    o AND:“Patientcharacteristic:birthdate” (age)>=5years   (before the beginning of the “measurement period”;); 
    o AND:“Patient characteristic:birthdate ”(age)<=40years (before the beginning of the “measurement period”;); 
    */
    var measurement_period_start = effective_date - 1 * year;
    var earliest_birthdate = measurement_period_start - 40 * year;
    var latest_birthdate = measurement_period_start - 5 * year;


    var population = function() {
        // the number of counts of office encounters and outpatient consults
        // to determine the physician has a relationship with the patient
        /*
        "Patient characteristic: birth date” using the “birth date code list” before the beginning
         of the “measurement period”;
        “Diagnosis active: asthma” using the “asthma code list grouping” before or
        simultaneously to “Encounter: encounter office & outpatient consult”;
        */
        var encounter_after_asthma_diagnosis = actionFollowingSomething(measure.asthma_diagnosis_active, measure.encounter_office_outpatient_consult_encounter);
        // **should this be constrained to measurement period**???
        /*
        “Encounter: encounter office & outpatient consult” using the “encounter office &
         outpatient consult code list” during the “measurement period”;
        */
        var encounters = inRange(measure.encounter_office_outpatient_consult_encounter,
        measurement_period_start,
        effective_date);

        return (inRange(patient.birthdate, earliest_birthdate, latest_birthdate)
        && encounter_after_asthma_diagnosis
        && encounters >= 2);
    }

    var denominator = function() {
        return population();
    }

    var numerator = function() {
        /*
         “Symptom assessed: asthma daytime symptoms quantified” using the “asthma daytime
         symptoms quantified code list” before or simultaneously to “Encounter: encounter
         office & outpatient consult”;
        */
        var daytime_symptoms_assessed_before_encounter = actionFollowingSomething(
        measure.asthma_daytime_symptoms_quantified_symptom_assessed,
        measure.encounter_office_outpatient_consult_encounter);
        /*
         “Symptom assessed: asthma nighttime symptoms quantified” using the “asthma
         nighttime symptoms quantified code list” before or simultaneously to “Encounter:
         encounter office & outpatient consult”;
        */
        var nighttime_symptoms_assessed_before_encounter = actionFollowingSomething(
        measure.asthma_nighttime_symptoms_quantified_symptom_assessed,
        measure.encounter_office_outpatient_consult_encounter);
        /*
         “Symptom active: asthma daytime symptoms” using the “asthma daytime symptoms
         code list” before or simultaneously to “Encounter: encounter office & outpatient
         consult”;
        */
        var daytime_symptoms_diagnosed_before_encounter = actionFollowingSomething(
        measure.asthma_daytime_symptoms_diagnosis_active,
        measure.encounter_office_outpatient_consult_encounter);
        /*
         “Symptom active: asthma nighttime symptoms” using the “asthma nighttime symptoms
         code list” before or simultaneously to “Encounter: encounter office & outpatient
         consult”;
        */
        var nighttime_symptoms_diagnosed_before_encounter = actionFollowingSomething(
        measure.asthma_nighttime_symptoms_symptom_active,
        measure.encounter_office_outpatient_consult_encounter);

        /*
         “Risk category /assessment: asthma symptom assessment tool” using the “asthma
         symptom assessment tool code list” before or simultaneously to “Encounter: encounter
         office & outpatient consult”;
        */
        var asthma_assessment_before_encounter = actionFollowingSomething(
        measure.asthma_symptom_assessment_tool_risk_category_assessment,
        measure.encounter_office_outpatient_consult_encounter);

        return ((daytime_symptoms_assessed_before_encounter && nighttime_symptoms_assessed_before_encounter) ||
        (daytime_symptoms_diagnosed_before_encounter && nighttime_symptoms_diagnosed_before_encounter) ||
        asthma_assessment_before_encounter);
    }

    var exclusion = function() {
        return false;
    }

    map(patient, population, denominator, numerator, exclusion);
};
