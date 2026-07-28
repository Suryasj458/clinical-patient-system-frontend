import api from "./client";

export async function searchPatients(search = "") {
  const { data } = await api.get("/patients", { params: { search, limit: 100 } });
  return data;
}
export async function getPatient(id) {
  const { data } = await api.get(`/patients/${id}`);
  return data;
}
export async function createPatient(payload) {
  const { data } = await api.post("/patients", payload);
  return data;
}
export async function updatePatient(id, payload) {
  const { data } = await api.put(`/patients/${id}`, payload);
  return data;
}
export async function deletePatient(id) {
  await api.delete(`/patients/${id}`);
}

export function exportPatientsExcel(search = "") {
  return api.get("/patients/export/excel", {
    params: {
      search,
    },
    responseType: "blob",
    timeout: 120000,
  });
}
