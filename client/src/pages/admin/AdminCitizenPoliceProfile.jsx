import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import SideMenu from "../../components/dashboard/SideMenu";
import DetailedRecordCard from "../../components/dashboard/DetailedRecordCard";
import { API_BASE_URL } from "../../config/env";
import { useAdmin } from "../../context/AdminContext";

export default function AdminCitizenPoliceProfile({ user }) {
  const { id } = useParams(); // Citizen ID
  const { selectedCitizen } = useAdmin();
  const citizenId = id || selectedCitizen?._id;
  const navigate = useNavigate();

  const [citizen, setCitizen] = useState(null);
  const [policeRecord, setPoliceRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Case Modal State
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [caseForm, setCaseForm] = useState({
    caseNumber: "",
    crimeType: "",
    description: "",
    filedAt: "",
    station: "",
    status: "pending",
  });

  // Update Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [updateStatusForm, setUpdateStatusForm] = useState({
    status: "",
    verdict: "",
  });

  const fetchData = async () => {
    if (!citizenId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch Police Record which now intrinsically populates the associated citizen
      const polRes = await axios.get(
        `${API_BASE_URL}/police/citizen/${citizenId}`,
      );
      setPoliceRecord(polRes.data);
      setCitizen(polRes.data.citizen);
    } catch (err) {
      console.error(err);
      setError("Failed to load citizen police profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [citizenId]);

  // --- Add Case Handlers ---
  const handleOpenCaseModal = () => {
    setCaseForm({
      caseNumber: "",
      crimeType: "",
      description: "",
      filedAt: "",
      station: "",
      status: "pending",
    });
    setCaseModalOpen(true);
  };

  const handleSubmitCase = async () => {
    if (!caseForm.caseNumber || !caseForm.crimeType || !caseForm.filedAt) {
      return alert("Required fields: Case Number, Type, Date.");
    }
    try {
      await axios.post(`${API_BASE_URL}/police/cases/${citizenId}`, caseForm);
      alert("Case added successfully");
      setCaseModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Failed to add case");
    }
  };

  // --- Update Status Handlers ---
  const handleOpenStatusModal = (caseItem) => {
    setSelectedCase(caseItem);
    setUpdateStatusForm({
      status: caseItem.status,
      verdict: caseItem.verdict || "",
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/police/cases/${citizenId}/${selectedCase.caseNumber}`,
        updateStatusForm,
      );
      alert("Case status updated!");
      setStatusModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const mapStatusToColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "under_investigation":
        return "info";
      case "under_trial":
        return "secondary";
      case "closed":
        return "success";
      case "dismissed":
        return "default";
      case "acquitted":
        return "success";
      case "convicted":
        return "error";
      default:
        return "default";
    }
  };

  const mapStatusToLabel = (status) => {
    return status.replace("_", " ").toUpperCase();
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/police/report/download/${citizenId}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Police_Report_${citizen.nid}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download Police Report");
    }
  };

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <SideMenu user={user} />
      <Box
        sx={{
          flexGrow: 1,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            {id && (
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            )}
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Citizen Cases Profile
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownload}
            disabled={!citizen}
          >
            Download Police Report
          </Button>
        </Box>

        {!citizenId ? (
          <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
            <Typography color="text.secondary">
              Please search and select a specific citizen from the Home
              Dashboard to view and log cases.
            </Typography>
          </Paper>
        ) : loading ? (
          <CircularProgress sx={{ mx: "auto", mt: 4 }} />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="700">
                Name: {citizen.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                NID: {citizen.nid}
              </Typography>
              <Box mt={2}>
                <Chip
                  label={`Verification: ${policeRecord.verificationStatus}`}
                  color={
                    policeRecord.verificationStatus === "Verified"
                      ? "success"
                      : "warning"
                  }
                />
              </Box>
            </Paper>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight="700">
                Legal Cases Overview
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<LocalPoliceIcon />}
                onClick={handleOpenCaseModal}
              >
                Log New Case
              </Button>
            </Box>

            {!policeRecord?.cases || policeRecord.cases.length === 0 ? (
              <Alert severity="info">
                No cases filed against this citizen.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {policeRecord.cases.map((caseItem, idx) => (
                  <Grid item xs={12} md={6} lg={4} key={idx}>
                    <DetailedRecordCard
                      title={caseItem.crimeType}
                      subtitle={`Case #: ${caseItem.caseNumber}`}
                      status={mapStatusToLabel(caseItem.status)}
                      date={caseItem.filedAt}
                      icon={<LocalPoliceIcon />}
                      color={mapStatusToColor(caseItem.status)}
                      details={[
                        { label: "Station", value: caseItem.station },
                        { label: "Verdict", value: caseItem.verdict || "N/A" },
                      ]}
                      // We can pass a custom action via adding to details or wrapping it
                    />
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleOpenStatusModal(caseItem)}
                    >
                      Update Case Status
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* Add Case Modal */}
      <Dialog
        open={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>File New Criminal Case - {citizen?.name}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            label="Case Number"
            fullWidth
            required
            value={caseForm.caseNumber}
            onChange={(e) =>
              setCaseForm({ ...caseForm, caseNumber: e.target.value })
            }
          />
          <TextField
            label="Crime Type (e.g. Theft, Fraud)"
            fullWidth
            required
            value={caseForm.crimeType}
            onChange={(e) =>
              setCaseForm({ ...caseForm, crimeType: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={caseForm.description}
            onChange={(e) =>
              setCaseForm({ ...caseForm, description: e.target.value })
            }
          />
          <TextField
            label="Filed At (Date)"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={caseForm.filedAt}
            onChange={(e) =>
              setCaseForm({ ...caseForm, filedAt: e.target.value })
            }
          />
          <TextField
            label="Police Station"
            fullWidth
            value={caseForm.station}
            onChange={(e) =>
              setCaseForm({ ...caseForm, station: e.target.value })
            }
          />
          <TextField
            select
            label="Initial Status"
            value={caseForm.status}
            onChange={(e) =>
              setCaseForm({ ...caseForm, status: e.target.value })
            }
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_investigation">Under Investigation</MenuItem>
            <MenuItem value="under_trial">Under Trial</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaseModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitCase} variant="contained" color="error">
            Submit Case
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Case Status Modal */}
      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Case Activity</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <Typography variant="subtitle2">
            Case Number: {selectedCase?.caseNumber}
          </Typography>
          <TextField
            select
            label="Case Status"
            fullWidth
            required
            value={updateStatusForm.status}
            onChange={(e) =>
              setUpdateStatusForm({
                ...updateStatusForm,
                status: e.target.value,
              })
            }
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_investigation">Under Investigation</MenuItem>
            <MenuItem value="under_trial">Under Trial</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="acquitted">Acquitted</MenuItem>
            <MenuItem value="convicted">Convicted</MenuItem>
          </TextField>
          <TextField
            label="Final Verdict (Optional)"
            fullWidth
            value={updateStatusForm.verdict}
            onChange={(e) =>
              setUpdateStatusForm({
                ...updateStatusForm,
                verdict: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
          >
            Update Case
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
