import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";

import {
  AddRounded,
  DeleteOutlineRounded,
  DescriptionOutlined,
  LocalHospitalRounded,
  PersonSearchRounded,
  PrintRounded,
  RefreshRounded,
  SaveRounded,
  SearchRounded,
} from "@mui/icons-material";

import FormSection from "../components/FormSection";
import LaboratorySection, {
  createInitialLabs,
} from "../components/LaboratorySection";
import TreatmentSection, {
  emptyTreatment,
} from "../components/TreatmentSection";

import { initialFields, sections } from "../data/formSections";

import {
  createPatient,
  deletePatient,
  searchPatients,
  updatePatient,
} from "../api/patients";

const PRIMARY = "#2563EB";
const PRIMARY_DARK = "#1E3A5F";
const PAGE_BG = "#F4F7FB";
const BORDER = "#E3E8EF";
const TEXT = "#172033";
const MUTED = "#697386";

const treatmentExtraSection = {
  title: "Treatment Support and Monitoring",
  columns: 2,
  multiline: true,
  fields: [
    ["supportive", "IV Fluids / Oxygen Therapy"],
    ["procedures", "Procedures / Non-pharmacological Treatment"],
    ["monitoring", "Monitoring Plan", "text", false, [], false, true],
  ],
};

const followupSection = {
  title: "9. Follow-up",
  columns: 2,
  multiline: true,
  fields: [
    ["followupDate", "Follow-up Date", "date"],
    [
      "patientStatus",
      "Patient Status",
      "select",
      false,
      ["Not assessed", "Improved", "Stable", "Worsened", "Discharged"],
    ],
    ["progressNotes", "New Symptoms / Progress Notes"],
    ["repeatInvestigations", "Repeat Investigations"],
    ["medChanges", "Medication Changes"],
    ["updatedDiagnosis", "Final / Updated Diagnosis"],
    [
      "remarks",
      "Further Plan / Clinician Remarks",
      "text",
      false,
      [],
      false,
      true,
    ],
  ],
};

function getPatientInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "PT";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPatientStatusColor(status) {
  switch (status) {
    case "Improved":
      return "success";

    case "Stable":
      return "info";

    case "Worsened":
      return "error";

    case "Discharged":
      return "secondary";

    default:
      return "default";
  }
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

export default function PatientEntryPage() {
  const [recordId, setRecordId] = useState(null);
  const [fields, setFields] = useState({
    ...initialFields,
    assessmentDate: new Date().toISOString().slice(0, 10),
  });

  const [labs, setLabs] = useState(createInitialLabs);
  const [treatments, setTreatments] = useState([emptyTreatment()]);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [notice, setNotice] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showNotice = (message, type = "success") => {
    setNotice({
      open: true,
      message,
      type,
    });
  };

  useEffect(() => {
    const height = Number(fields.height);
    const weight = Number(fields.weight);

    const bmi =
      height > 0 && weight > 0
        ? (weight / (height / 100) ** 2).toFixed(1)
        : "";

    setFields((current) =>
      current.bmi === bmi
        ? current
        : {
            ...current,
            bmi,
          },
    );
  }, [fields.height, fields.weight]);

  const payload = useMemo(
    () => ({
      fields,
      labs,
      treatments,
    }),
    [fields, labs, treatments],
  );

  const completedBasicFields = useMemo(() => {
    const importantFields = [
      fields.patientName,
      fields.ipNo,
      fields.age,
      fields.sex,
      fields.assessmentDate,
      fields.ward,
      fields.consultant,
    ];

    return importantFields.filter(
      (value) => String(value || "").trim() !== "",
    ).length;
  }, [fields]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFields((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setRecordId(null);

    setFields({
      ...initialFields,
      assessmentDate: new Date().toISOString().slice(0, 10),
    });

    setLabs(createInitialLabs());
    setTreatments([emptyTreatment()]);
    setConfirmDelete(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const loadRecord = (record) => {
    setRecordId(record.id);

    setFields({
      ...initialFields,
      ...(record.fields || {}),
    });

    setLabs(
      record.labs && Object.keys(record.labs).length
        ? record.labs
        : createInitialLabs(),
    );

    setTreatments(
      record.treatments?.length
        ? record.treatments
        : [emptyTreatment()],
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const runSearch = async (query = search) => {
    setSearching(true);
    setHasSearched(true);

    try {
      const response = await searchPatients(query.trim());
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showNotice(
        error?.response?.data?.message ||
          error.message ||
          "Unable to search patient records.",
        "error",
      );
    } finally {
      setSearching(false);
    }
  };

  const showAllPatients = async () => {
    setSearch("");
    await runSearch("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const isUpdate = Boolean(recordId);

      const saved = isUpdate
        ? await updatePatient(recordId, payload)
        : await createPatient(payload);

      setRecordId(saved.id);

      setFields((current) => ({
        ...current,
        ...(saved.fields || {}),
      }));

      showNotice(
        isUpdate
          ? "Patient record updated successfully."
          : "Patient record created successfully.",
      );

      await runSearch(search);
    } catch (error) {
      showNotice(
        error?.response?.data?.message ||
          error.message ||
          "Unable to save patient record.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async () => {
    if (!recordId) {
      return;
    }

    setDeleting(true);

    try {
      await deletePatient(recordId);

      setConfirmDelete(false);
      resetForm();
      await runSearch(search);

      showNotice("Patient record deleted successfully.");
    } catch (error) {
      showNotice(
        error?.response?.data?.message ||
          error.message ||
          "Unable to delete patient record.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: PAGE_BG,
        color: TEXT,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        className="no-print"
        sx={{
          bgcolor: PRIMARY_DARK,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 68, md: 76 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.6}
            sx={{ width: "100%" }}
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#FFFFFF",
              }}
            >
              <LocalHospitalRounded />
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: { xs: 17, sm: 20 },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                Clinical Patient Entry System
              </Typography>

              <Typography
                sx={{
                  color: "#C7D7EA",
                  fontSize: 12,
                  mt: 0.25,
                }}
              >
                Secure patient assessment and clinical record management
              </Typography>
            </Box>

            <Chip
              className="no-print"
              label={recordId ? "Editing patient" : "New patient"}
              size="small"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                bgcolor: recordId
                  ? "rgba(245,158,11,0.18)"
                  : "rgba(34,197,94,0.18)",
                color: recordId ? "#FDE68A" : "#BBF7D0",
                border: `1px solid ${
                  recordId
                    ? "rgba(245,158,11,0.3)"
                    : "rgba(34,197,94,0.3)"
                }`,
                fontWeight: 700,
              }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        className="no-print"
        sx={{
          background: `
            radial-gradient(circle at 10% 0%, rgba(37,99,235,0.13), transparent 32%),
            radial-gradient(circle at 90% 20%, rgba(14,165,233,0.10), transparent 28%)
          `,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 2.5, md: 3.5 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 22, md: 28 },
                  fontWeight: 800,
                  color: TEXT,
                  letterSpacing: "-0.5px",
                }}
              >
                {recordId
                  ? `Editing ${fields.patientName || "patient record"}`
                  : "Create a new patient record"}
              </Typography>

              <Typography
                sx={{
                  color: MUTED,
                  fontSize: 14,
                  mt: 0.7,
                  maxWidth: 680,
                }}
              >
                Enter patient identification, examination findings,
                investigations, treatment details and follow-up information.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={<DescriptionOutlined />}
                label={`${completedBasicFields}/7 basic details`}
                sx={{
                  bgcolor: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  fontWeight: 650,
                }}
              />

              {fields.bmi && (
                <Chip
                  label={`BMI ${fields.bmi}`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    bgcolor: alpha(PRIMARY, 0.04),
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
        }}
      >
        <Paper
          className="no-print"
          elevation={0}
          sx={{
            mb: 2.5,
            border: `1px solid ${BORDER}`,
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 2.5 },
              py: 2,
              borderBottom: `1px solid ${BORDER}`,
              background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={1.3}>
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: alpha(PRIMARY, 0.1),
                    color: PRIMARY,
                  }}
                >
                  <PersonSearchRounded fontSize="small" />
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 750,
                    }}
                  >
                    Patient record search
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: MUTED,
                      mt: 0.2,
                    }}
                  >
                    Search using patient name or IP No. / UHID
                  </Typography>
                </Box>
              </Stack>

              {!!results.length && (
                <Chip
                  label={`${results.length} record${
                    results.length === 1 ? "" : "s"
                  }`}
                  size="small"
                  sx={{
                    bgcolor: alpha(PRIMARY, 0.08),
                    color: PRIMARY,
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.2}
            >
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    runSearch();
                  }
                }}
                placeholder="Enter patient name or IP number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "#FAFBFD",

                    "& fieldset": {
                      borderColor: BORDER,
                    },

                    "&:hover fieldset": {
                      borderColor: "#B7C2D0",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor: PRIMARY,
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                disableElevation
                disabled={searching}
                startIcon={
                  searching ? (
                    <CircularProgress size={17} color="inherit" />
                  ) : (
                    <SearchRounded />
                  )
                }
                onClick={() => runSearch()}
                sx={{
                  height: 48,
                  minWidth: { md: 130 },
                  borderRadius: 2,
                  bgcolor: PRIMARY,
                  textTransform: "none",
                  fontWeight: 700,

                  "&:hover": {
                    bgcolor: "#1D4ED8",
                  },
                }}
              >
                Search
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshRounded />}
                onClick={showAllPatients}
                sx={{
                  height: 48,
                  minWidth: { md: 130 },
                  borderRadius: 2,
                  borderColor: BORDER,
                  color: TEXT,
                  textTransform: "none",
                  fontWeight: 700,

                  "&:hover": {
                    borderColor: "#B7C2D0",
                    bgcolor: "#F8FAFC",
                  },
                }}
              >
                Show all
              </Button>
            </Stack>

            {searching && (
              <Box
                sx={{
                  py: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.2,
                }}
              >
                <CircularProgress size={22} />

                <Typography color="text.secondary">
                  Searching patient records...
                </Typography>
              </Box>
            )}

            {!searching && hasSearched && results.length === 0 && (
              <Box
                sx={{
                  mt: 2,
                  py: 4,
                  px: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  border: `1px dashed ${BORDER}`,
                  bgcolor: "#FAFBFC",
                }}
              >
                <PersonSearchRounded
                  sx={{
                    fontSize: 38,
                    color: "#A8B3C2",
                    mb: 1,
                  }}
                />

                <Typography fontWeight={700}>
                  No patient records found
                </Typography>

                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: 13,
                    mt: 0.5,
                  }}
                >
                  Check the patient name or IP number and search again.
                </Typography>
              </Box>
            )}

            {!searching && results.length > 0 && (
              <List
                disablePadding
                sx={{
                  mt: 2,
                  maxHeight: 310,
                  overflowY: "auto",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 2,
                  bgcolor: "#FFFFFF",
                }}
              >
                {results.map((record, index) => {
                  const isSelected = record.id === recordId;
                  const patientFields = record.fields || {};

                  return (
                    <Box key={record.id}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => loadRecord(record)}
                        sx={{
                          px: 2,
                          py: 1.5,
                          alignItems: "flex-start",

                          "&.Mui-selected": {
                            bgcolor: alpha(PRIMARY, 0.08),
                            borderLeft: `4px solid ${PRIMARY}`,
                          },

                          "&.Mui-selected:hover": {
                            bgcolor: alpha(PRIMARY, 0.11),
                          },

                          "&:hover": {
                            bgcolor: "#F8FAFC",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: isSelected
                                ? PRIMARY
                                : alpha(PRIMARY, 0.1),
                              color: isSelected ? "#FFFFFF" : PRIMARY,
                              fontSize: 14,
                              fontWeight: 800,
                            }}
                          >
                            {getPatientInitials(patientFields.patientName)}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              spacing={1}
                            >
                              <Typography
                                sx={{
                                  fontSize: 14.5,
                                  fontWeight: 750,
                                  color: TEXT,
                                }}
                              >
                                {patientFields.patientName ||
                                  "Unnamed patient"}
                              </Typography>

                              <Chip
                                label={
                                  patientFields.ipNo
                                    ? `IP: ${patientFields.ipNo}`
                                    : "IP not available"
                                }
                                size="small"
                                sx={{
                                  height: 23,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  bgcolor: "#F1F5F9",
                                }}
                              />

                              {patientFields.patientStatus && (
                                <Chip
                                  label={patientFields.patientStatus}
                                  color={getPatientStatusColor(
                                    patientFields.patientStatus,
                                  )}
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    height: 23,
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={{ xs: 0.4, sm: 2 }}
                              sx={{ mt: 0.8 }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  color: MUTED,
                                  fontSize: 12.5,
                                }}
                              >
                                Assessment:{" "}
                                {patientFields.assessmentDate || "N/A"}
                              </Typography>

                              <Typography
                                component="span"
                                sx={{
                                  color: MUTED,
                                  fontSize: 12.5,
                                }}
                              >
                                Updated: {formatDateTime(record.updatedAt)}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItemButton>

                      {index < results.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>

        <form onSubmit={submit}>
          <Box
            sx={{
              "& > .MuiPaper-root": {
                border: `1px solid ${BORDER}`,
                borderRadius: "14px",
                boxShadow: "0 5px 20px rgba(23,32,51,0.045)",
                mb: 2.2,
                overflow: "hidden",
              },

              "& .MuiTextField-root .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#FFFFFF",

                "& fieldset": {
                  borderColor: "#DCE3EA",
                },

                "&:hover fieldset": {
                  borderColor: "#AEBAC8",
                },

                "&.Mui-focused fieldset": {
                  borderColor: PRIMARY,
                  borderWidth: "1.4px",
                },
              },

              "& .MuiInputLabel-root": {
                color: "#5F6B7A",
              },

              "& .MuiInputLabel-root.Mui-focused": {
                color: PRIMARY,
              },
            }}
          >
            {sections.slice(0, 5).map((section) => (
              <FormSection
                key={section.title}
                section={section}
                values={fields}
                onChange={handleChange}
              />
            ))}

            <LaboratorySection labs={labs} setLabs={setLabs} />

            <FormSection
              section={sections[5]}
              values={fields}
              onChange={handleChange}
            />

            <TreatmentSection
              treatments={treatments}
              setTreatments={setTreatments}
            />

            <FormSection
              section={treatmentExtraSection}
              values={fields}
              onChange={handleChange}
            />

            <FormSection
              section={followupSection}
              values={fields}
              onChange={handleChange}
            />
          </Box>

          <Paper
            className="no-print"
            elevation={0}
            sx={{
              position: "sticky",
              bottom: 12,
              zIndex: 20,
              mt: 2,
              p: { xs: 1.5, md: 1.8 },
              borderRadius: 3,
              border: `1px solid ${BORDER}`,
              bgcolor: alpha("#FFFFFF", 0.96),
              backdropFilter: "blur(12px)",
              boxShadow: "0 12px 35px rgba(15,23,42,0.12)",
            }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              alignItems={{ xs: "stretch", lg: "center" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Box sx={{ display: { xs: "none", lg: "block" } }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 750,
                  }}
                >
                  {recordId
                    ? "Update the selected patient record"
                    : "Save this patient as a new record"}
                </Typography>

                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: 12,
                    mt: 0.25,
                  }}
                >
                  Patient name and IP No. / UHID are required.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  width: { xs: "100%", lg: "auto" },
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  disabled={saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveRounded />
                    )
                  }
                  sx={{
                    minHeight: 46,
                    minWidth: 210,
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: PRIMARY,
                    textTransform: "none",
                    fontWeight: 750,

                    "&:hover": {
                      bgcolor: "#1D4ED8",
                    },
                  }}
                >
                  {recordId
                    ? "Update Patient Record"
                    : "Save Patient Record"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  color="success"
                  startIcon={<AddRounded />}
                  onClick={resetForm}
                  sx={{
                    minHeight: 46,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  New Patient
                </Button>

                <Tooltip title="Print or save as PDF">
                  <IconButton
                    type="button"
                    onClick={() => window.print()}
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      width: 46,
                      height: 46,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 2,
                      color: TEXT,
                    }}
                  >
                    <PrintRounded />
                  </IconButton>
                </Tooltip>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<PrintRounded />}
                  onClick={() => window.print()}
                  sx={{
                    display: { xs: "inline-flex", sm: "none" },
                    minHeight: 46,
                    borderRadius: 2,
                    color: TEXT,
                    borderColor: BORDER,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Print / Save PDF
                </Button>

                <Tooltip
                  title={
                    recordId
                      ? "Delete selected patient"
                      : "Select a patient before deleting"
                  }
                >
                  <span>
                    <IconButton
                      type="button"
                      disabled={!recordId}
                      onClick={() => setConfirmDelete(true)}
                      sx={{
                        display: { xs: "none", sm: "inline-flex" },
                        width: 46,
                        height: 46,
                        border: "1px solid #FECACA",
                        borderRadius: 2,
                        color: "#DC2626",

                        "&:hover": {
                          bgcolor: "#FEF2F2",
                        },
                      }}
                    >
                      <DeleteOutlineRounded />
                    </IconButton>
                  </span>
                </Tooltip>

                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  disabled={!recordId}
                  startIcon={<DeleteOutlineRounded />}
                  onClick={() => setConfirmDelete(true)}
                  sx={{
                    display: { xs: "inline-flex", sm: "none" },
                    minHeight: 46,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Delete Record
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </form>
      </Container>

      <Dialog
        open={confirmDelete}
        onClose={() => {
          if (!deleting) {
            setConfirmDelete(false);
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 1,
          }}
        >
          Delete patient record?
        </DialogTitle>

        <DialogContent>
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            This action cannot be undone.
          </Alert>

          <Typography
            sx={{
              color: MUTED,
              fontSize: 14,
              lineHeight: 1.65,
            }}
          >
            The selected patient record for{" "}
            <Box component="span" sx={{ color: TEXT, fontWeight: 750 }}>
              {fields.patientName || "this patient"}
            </Box>{" "}
            will be permanently removed from PostgreSQL.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            disabled={deleting}
            onClick={() => setConfirmDelete(false)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disableElevation
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <DeleteOutlineRounded />
              )
            }
            onClick={removeRecord}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Delete record
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={() =>
          setNotice((current) => ({
            ...current,
            open: false,
          }))
        }
      >
        <Alert
          severity={notice.type}
          variant="filled"
          onClose={() =>
            setNotice((current) => ({
              ...current,
              open: false,
            }))
          }
          sx={{
            minWidth: { xs: "auto", sm: 340 },
            borderRadius: 2,
            boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
          }}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
