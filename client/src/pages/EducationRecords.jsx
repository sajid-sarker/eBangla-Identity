import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import axios from "axios";

import SideMenu from "../components/SideMenu";
import DetailedRecordCard from "../components/dashboard/DetailedRecordCard";

import SchoolIcon from "@mui/icons-material/School";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

// Ensure cookies are sent for authentication
axios.defaults.withCredentials = true;

const EducationRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEducationData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/education");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching education records:", err);
      setError("Failed to load education records. Please try again later.");
    } finally {
      setLoading(false);
    }
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
                      <DetailedRecordCard
                        title={record.qualification}
                        subtitle={record.institution}
                        status="Verified"
                        date={record.passingYear.toString()} // Passing year usually doesn't have a full date in this schema
                        icon={<SchoolIcon />}
                        color="primary"
                        details={[
                          {
                            label: "Degree / Variant",
                            value: record.degreeName || "Not specified",
                          },
                          {
                            label: "Passing Year",
                            value: record.passingYear,
                          },
                        ]}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default EducationRecords;
