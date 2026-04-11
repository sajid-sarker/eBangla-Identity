import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import SideMenu from "../../components/SideMenu";

const AdminPageTemplate = ({ title, user }) => (
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
        {title}
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="body1">
          This is a placeholder for the <strong>{title}</strong> management page.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Functionality for this module will be implemented in future updates.
        </Typography>
      </Paper>
    </Box>
  </Box>
);

export const AdminMedical = ({ user }) => <AdminPageTemplate title="Medical Records Management" user={user} />;
export const AdminPolice = ({ user }) => <AdminPageTemplate title="Police Records Management" user={user} />;
export const AdminTax = ({ user }) => <AdminPageTemplate title="Tax Records Management" user={user} />;
