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
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

export default function Profile({ user, setUser }) {
  return (
    <>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu user={user} />

        {/* Main content */}
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

            <UserInfoCard user={user} setUser={setUser} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <RecordCard
                  title="Medical Records"
                  value="12 Files"
                  icon={<MedicalServicesIcon />}
                  lastUpdated="2 days ago"
                  color="error.main"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RecordCard
                  title="Police Records"
                  value="Clear"
                  icon={<LocalPoliceIcon />}
                  lastUpdated="Jan 15, 2026"
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RecordCard
                  title="Family Records"
                  value="4 Members"
                  icon={<FamilyRestroomIcon />}
                  lastUpdated="Feb 20, 2026"
                  color="success.main"
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
