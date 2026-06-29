import api from "./api";

// ======================================
// Get My Reports
// ======================================

export const getMyReports = async () => {

  const response = await api.get("/reports");

  return response.data.data;

};

// ======================================
// Get Team Reports
// ======================================

export const getTeamReports = async () => {

  const response = await api.get("/reports/team");

  return response.data.data;

};

// ======================================
// Download Report
// ======================================

export const downloadReport = async (reportId) => {

  const response = await api.get(

    `/reports/${reportId}/download`,

    {
      responseType: "blob",
    }

  );

  return response.data;

};