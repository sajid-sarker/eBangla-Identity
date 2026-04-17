import React, { useEffect, useState } from "react";
import { Box, Stack, Grid, Typography, CircularProgress, Alert, Paper, Divider } from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../config/env";
import SideMenu from "../components/SideMenu";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import HealingIcon from "@mui/icons-material/Healing";
import VaccinationIcon from "@mui/icons-material/Vaccines";

export default function MedicalRecords({ user }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/medical/my-records`);
        setRecord(res.data);
      } catch (err) { console.error("Fetch Error:", err); }
      finally { setLoading(false); }
    };
    fetchRecords();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideMenu user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#f8fafd' }}>
        <Stack spacing={4} sx={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#05339C" }}>Medical Records</Typography>

          {!record ? (
            <Alert severity="info">No medical records found for this account.</Alert>
          ) : (
            <>
              {/* Summary Stats Card */}
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <Box textAlign="center">
                  <BloodtypeIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ fontWeight: 700 }}>BLOOD GROUP</Typography>
                  <Typography variant="h5" fontWeight={800}>{record.bloodGroup}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center">
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ fontWeight: 700 }}>HEIGHT</Typography>
                  <Typography variant="h5" fontWeight={800}>{record.height} cm</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center">
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ fontWeight: 700 }}>WEIGHT</Typography>
                  <Typography variant="h5" fontWeight={800}>{record.weight} kg</Typography>
                </Box>
              </Paper>

              {/* Diagnoses Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HealingIcon color="primary" /> Diagnoses & Conditions
                </Typography>
                <Stack spacing={2}>
                  {record.diagnoses?.length > 0 ? record.diagnoses.map((diag, i) => (
                    <Paper key={i} sx={{ p: 2, borderLeft: '5px solid #05339C' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{diag.condition}</Typography>
                      <Typography variant="body2" color="textSecondary">{diag.hospital} — {diag.doctor} (ICD: {diag.icdCode})</Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'primary.main', fontWeight: 700 }}>{diag.status}</Typography>
                    </Paper>
                  )) : <Typography color="textSecondary">No conditions reported.</Typography>}
                </Stack>
              </Box>

              {/* Vaccinations Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VaccinationIcon color="secondary" /> Vaccinations
                </Typography>
                <Stack spacing={2}>
                  {record.vaccinations?.length > 0 ? record.vaccinations.map((vac, i) => (
                    <Paper key={i} sx={{ p: 2, borderLeft: '5px solid #9c27b0' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{vac.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{vac.hospital} — Dose: {vac.doseNumber}</Typography>
                    </Paper>
                  )) : <Typography color="textSecondary">No vaccinations reported.</Typography>}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}