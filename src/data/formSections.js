export const initialFields = {
  patientName: "", ipNo: "", age: "", sex: "", admissionDate: "",
  assessmentDate: new Date().toISOString().slice(0, 10), ward: "", bedNo: "",
  height: "", weight: "", bmi: "", consultant: "", chiefComplaints: "",
  presentIllness: "", pastMedical: "", pastMedication: "", allergies: "",
  familyHistory: "", socialHistory: "", generalCondition: "", consciousness: "",
  pallor: "Not assessed", icterus: "Not assessed", cyanosis: "Not assessed",
  clubbing: "Not assessed", lymphadenopathy: "Not assessed", edema: "Not assessed",
  dehydration: "Not assessed", bp: "", pr: "", spo2: "", rr: "",
  temperature: "", painScore: "", gcs: "", cbgVital: "", cvs: "",
  respiratory: "", abdomen: "", cns: "", provisionalDiagnosis: "",
  differentialDiagnosis: "", relevantFindings: "", supportive: "", procedures: "",
  monitoring: "", followupDate: "", patientStatus: "Not assessed",
  progressNotes: "", repeatInvestigations: "", medChanges: "",
  updatedDiagnosis: "", remarks: "",
};

export const sections = [
  {
    title: "1. Patient Identification",
    columns: 4,
    fields: [
      ["patientName", "Patient Name *", "text", true], ["ipNo", "IP No. / UHID *", "text", true],
      ["age", "Age", "number"], ["sex", "Sex", "select", false, ["", "Male", "Female", "Other"]],
      ["admissionDate", "Date of Admission", "date"], ["assessmentDate", "Date of Assessment", "date"],
      ["ward", "Ward / Department"], ["bedNo", "Bed No."], ["height", "Height (cm)", "number"],
      ["weight", "Weight (kg)", "number"], ["bmi", "BMI", "number", false, [], true],
      ["consultant", "Consultant / Unit"],
    ],
  },
  {
    title: "2. History", columns: 2, multiline: true,
    fields: [["chiefComplaints","Chief Complaints"],["presentIllness","History of Present Illness"],
      ["pastMedical","Past Medical History"],["pastMedication","Past Medication History"],
      ["allergies","Drug Allergies"],["familyHistory","Family History"],
      ["socialHistory","Social History", "text", false, [], false, true]],
  },
  {
    title: "3. General Examination", columns: 4,
    fields: [["generalCondition","General Condition"],["consciousness","Consciousness / Orientation"],
      ...["pallor","icterus","cyanosis","clubbing","lymphadenopathy","edema","dehydration"].map(k => [k, k[0].toUpperCase()+k.slice(1), "select", false, ["Not assessed","Present","Absent"]])],
  },
  {
    title: "4. Vitals", columns: 4,
    fields: [["bp","BP (mmHg)"],["pr","Pulse Rate (beats/min)","number"],["spo2","SpO₂ (%)","number"],
      ["rr","Respiratory Rate (/min)","number"],["temperature","Temperature (°C)","number"],
      ["painScore","Pain Score (0–10)","number"],["gcs","GCS (/15)","number"],["cbgVital","CBG (mg/dL)","number"]],
  },
  {
    title: "5. Systemic Examination", columns: 2, multiline: true,
    fields: [["cvs","CVS"],["respiratory","Respiratory System"],["abdomen","Abdomen"],["cns","CNS"]],
  },
  {
    title: "7. Provisional Diagnosis", columns: 2, multiline: true,
    fields: [["provisionalDiagnosis","Primary Provisional Diagnosis"],["differentialDiagnosis","Differential Diagnosis"],
      ["relevantFindings","Relevant Clinical Findings / Abnormal Investigations","text",false,[],false,true]],
  },
];
