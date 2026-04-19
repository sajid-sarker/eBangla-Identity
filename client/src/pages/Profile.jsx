import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import UserInfoCard from "../components/dashboard/UserInfoCard";
import RecordCard from "../components/dashboard/RecordCard";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import PaymentsIcon from "@mui/icons-material/Payments";

export default function Profile({ user, setUser, setAvatarTimestamp }) {
  const [stats, setStats] = useState(null);
  const [latestTax, setLatestTax] = useState(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await axios.get(`${API_BASE_URL}/stats/dashboard`);
        setStats(statsRes.data);

        const taxRes = await axios.get(`${API_BASE_URL}/tax?year=2026`);
        if (taxRes.data && taxRes.data.length > 0) {
          setLatestTax(taxRes.data[0]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          {/* Completion Warning Banner */}
          {user && !user.isProfileComplete && (
            <Box
              sx={{
                bgcolor: "warning.light",
                p: 2,
                mb: 2,
                borderRadius: 1,
                color: "warning.contrastText",
              }}
            >
              <Typography variant="body1" fontWeight="bold">
                Action Required: Please complete your profile to access all
                features.
              </Typography>
            </Box>
          )}

          <Stack
            spacing={3}
            sx={{
              maxWidth: "1200px",
              margin: "0 auto",
              mt: { xs: 8, md: 2 },
            }}
          >
            <Typography
              variant="h4"
              sx={{ mb: 1, fontWeight: 700, color: "primary.main" }}
            >
              My Profile
            </Typography>

            <UserInfoCard
              user={user}
              setUser={setUser}
              setAvatarTimestamp={setAvatarTimestamp}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <RecordCard
                  title="Medical Records"
                  value={
                    stats?.medical
                      ? `${stats.medical.bloodGroup} | ${stats.medical.count} Records`
                      : "Not set | 0 Records"
                  }
                  icon={<MedicalServicesIcon />}
                  lastUpdated={formatDate(stats?.medical?.lastUpdated)}
                  color="error.main"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RecordCard
                  title="Police Records"
                  value={stats?.police ? stats.police.status : "Clear"}
                  icon={<LocalPoliceIcon />}
                  lastUpdated={formatDate(stats?.police?.lastUpdated)}
                  color="primary.main"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RecordCard
                  title="Tax Summary"
                  value={
                    latestTax
                      ? `${latestTax.taxAmount.toLocaleString()} Tax`
                      : "0 Calculated"
                  }
                  icon={<PaymentsIcon />}
                  lastUpdated={
                    latestTax
                      ? `${new Date(latestTax.updatedAt).getFullYear()}`
                      : "No submissions"
                  }
                  color="warning.main"
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
