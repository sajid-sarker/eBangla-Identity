import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import SideMenu from "../../components/SideMenu";

export default function AdminDashboard({ user }) {
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
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Welcome, {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You are logged in as a <strong>{user?.role}</strong>. Use the side menu to navigate through the administrative modules available to you.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 2, bgcolor: "primary.main", color: "white" }}>
              <Typography variant="h6" gutterBottom>
                Admin ID
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {user?.adminId}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
