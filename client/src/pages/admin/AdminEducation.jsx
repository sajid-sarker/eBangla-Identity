import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";
import { useAdmin } from "../../context/AdminContext";
import SideMenu from "../../components/SideMenu";
import DetailedRecordCard from "../../components/dashboard/DetailedRecordCard";
import AddQualificationModal from "../../components/education/AddQualificationModal";
import AddIcon from "@mui/icons-material/Add";

export default function AdminEducation({ user }) {
  const { selectedCitizen } = useAdmin();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "warning" });
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const fetchRecords = useCallback(async () => {
    if (!selectedCitizen) return;

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/education?citizenId=${selectedCitizen._id}`);
      setRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch education records");
    } finally {
      setLoading(false);
    }
  }, [selectedCitizen]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      await axios.patch(`${API_BASE_URL}/education/admin/${id}/status`, { status });
      // Update local state
      setRecords((prev) =>
        prev.map((rec) => (rec._id === id ? { ...rec, status } : rec))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDocument = (record) => {
    if (!record.document || !record.document.originalName) {
      setSnackbar({
        open: true,
        message: "No document has been uploaded for this qualification.",
        severity: "warning",
      });
      return;
    }
    window.open(`${API_BASE_URL}/education/${record._id}/document`, "_blank");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <SideMenu user={user} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "primary.main" }}>
          Education Records Management
        </Typography>

        {!selectedCitizen ? (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No citizen selected.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please go to the <strong>Admin Dashboard</strong> and search for a citizen by NID to manage their records.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper
              sx={{
                p: 3,
                mb: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 2,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                    Managing Records for:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedCitizen.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    NID: {selectedCitizen.nid}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpen}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                Add Qualification
              </Button>
            </Paper>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : records.length === 0 ? (
              <Alert severity="info">No education records found for this citizen.</Alert>
            ) : (
              <Grid container spacing={3}>
                {records.map((record) => (
                  <Grid item xs={12} md={6} lg={4} key={record._id}>
                    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <DetailedRecordCard
                        title={record.qualification}
                        subtitle={record.institution}
                        status={record.status}
                        date={record.passingYear.toString()}
                        icon={<SchoolIcon />}
                        color={
                          record.status === "Verified"
                            ? "success"
                            : record.status === "Rejected"
                            ? "error"
                            : "warning"
                        }
                        details={[
                          {
                            label: "Degree",
                            value: record.degreeName || "Not specified",
                          },
                          {
                            label: "Passing Year",
                            value: record.passingYear,
                          },
                        ]}
                      />
                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          gap: 1,
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDocument(record)}
                          sx={{ fontWeight: 600 }}
                        >
                          View Doc
                        </Button>
                        <Stack direction="row" spacing={1}>
                          {record.status === "Pending" && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleStatusUpdate(record._id, "Verified")}
                                disabled={actionLoading === record._id}
                                sx={{ fontWeight: 600 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => handleStatusUpdate(record._id, "Rejected")}
                                disabled={actionLoading === record._id}
                                sx={{ fontWeight: 600 }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {record.status === "Verified" && (
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              onClick={() => handleStatusUpdate(record._id, "Rejected")}
                              disabled={actionLoading === record._id}
                            >
                              Revoke
                            </Button>
                          )}
                          {record.status === "Rejected" && (
                            <Button
                              size="small"
                              color="success"
                              variant="text"
                              onClick={() => handleStatusUpdate(record._id, "Verified")}
                              disabled={actionLoading === record._id}
                            >
                              Re-verify
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <AddQualificationModal
        open={open}
        onClose={handleClose}
        onSuccess={fetchRecords}
        citizenId={selectedCitizen?._id}
      />
    </Box>
  );
}
