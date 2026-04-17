import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import axios from "axios";
import { API_BASE_URL } from "../config/env";

import SideMenu from "../components/SideMenu";
import DetailedRecordCard from "../components/dashboard/DetailedRecordCard";

import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";

export default function PoliceRecords({ user }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/police/me`);
        setRecord(res.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError("Failed to load police records. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/police/report/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Police_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download Police Report");
    }
  };

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
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
                  Police Records
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Official criminal history and active legal cases linked to your NID.
                </Typography>
              </Box>
              <Button variant="contained" color="primary" onClick={handleDownload}>
                Download Report
              </Button>
            </Box>

            {!record && !error && (
              <Alert severity="success" icon={<SecurityIcon fontSize="inherit" />}>
                No criminal records or active cases found. Your record is clear.
              </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {record && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon color="primary" /> Legal Cases
                </Typography>
                <Grid container spacing={3}>
                  {record.cases.map((caseItem, index) => {
                    const statusColors = {
                      pending: "warning",
                      under_investigation: "info",
                      under_trial: "secondary",
                      dismissed: "default",
                      closed: "success",
                      acquitted: "success",
                      convicted: "error"
                    };
                    const color = statusColors[caseItem.status] || "primary";
                    const formattedStatus = caseItem.status.replace("_", " ").toUpperCase();

                    return (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <DetailedRecordCard
                          title={caseItem.crimeType}
                          subtitle={`Case #: ${caseItem.caseNumber}`}
                          status={formattedStatus}
                          date={caseItem.filedAt}
                          icon={<LocalPoliceIcon />}
                          color={color}
                          details={[
                            { label: "Station", value: caseItem.station },
                            { label: "Verdict", value: caseItem.verdict || "Pending" }
                          ]}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </>
  );
}
