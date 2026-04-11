import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { API_BASE_URL } from "../config/env";

import Button from "@mui/material/Button";
import SideMenu from "../components/SideMenu";
import DetailedRecordCard from "../components/dashboard/DetailedRecordCard";
import AddQualificationModal from "../components/education/AddQualificationModal";

import SchoolIcon from "@mui/icons-material/School";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

// Ensure cookies are sent for authentication
axios.defaults.withCredentials = true;

const EducationRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  // Modal state
  const [open, setOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const handleOpen = (record = null) => {
    setEditRecord(record);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const fetchEducationData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/education`);
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching education records:", err);
      setError("Failed to load education records. Please try again later.");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchEducationData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu user={user} />

        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
            p: 3,
          })}
        >
          <Stack
            spacing={4}
            sx={{
              maxWidth: "1200px",
              margin: "0 auto",
              mt: { xs: 8, md: 2 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
                >
                  Education History
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Verified academic qualifications and certifications linked to
                  your identity.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen(null)}
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Add Qualification
              </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {!records.length && !error && (
              <Alert
                severity="info"
                icon={<HistoryEduIcon fontSize="inherit" />}
              >
                No education records found for this account.
              </Alert>
            )}

            {records.length > 0 && (
              <Box>
                <Grid container spacing={3}>
                  {records.map((record) => (
                    <Grid item xs={12} key={record._id}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <DetailedRecordCard
                          title={record.qualification}
                          subtitle={record.institution}
                          status={record.status}
                          date={record.passingYear.toString()}
                          icon={<SchoolIcon />}
                          color={
                            record.status === "Verified"
                              ? "primary"
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
                            p: 1.5,
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                            bgcolor: "rgba(0,0,0,0.02)",
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDocument(record)}
                            sx={{ fontWeight: 600 }}
                          >
                            View Document
                          </Button>
                          {record.status !== "Verified" && (
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpen(record)}
                              sx={{ fontWeight: 600 }}
                              color="secondary"
                            >
                              Edit
                            </Button>
                          )}
                        </Paper>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
      <AddQualificationModal
        open={open}
        onClose={handleClose}
        onSuccess={fetchEducationData}
        editData={editRecord}
      />
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
    </>
  );
};

export default EducationRecords;
