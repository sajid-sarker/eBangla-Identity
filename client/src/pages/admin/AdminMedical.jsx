import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Divider, IconButton, MenuItem, Stack } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';
import SideMenu from "../../components/SideMenu";
import { API_BASE_URL } from '../../config/env';
import { useAdmin } from "../../context/AdminContext";

const AdminMedical = ({ user }) => {
  const { selectedCitizen } = useAdmin();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bloodGroup: "", 
    height: "", 
    weight: "",
    diagnoses: [{ condition: "", hospital: "", doctor: "", icdCode: "", status: "Active" }],
    vaccinations: [{ name: "", hospital: "", doseNumber: 1 }]
  });

  // FETCH DATA ON LOAD/CITIZEN CHANGE
  useEffect(() => {
    const fetchCitizenData = async () => {
      if (!selectedCitizen) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/medical/admin/citizen/${selectedCitizen.nid}`);
        if (res.data) {
          setFormData({
            bloodGroup: res.data.bloodGroup || "",
            height: res.data.height || "",
            weight: res.data.weight || "",
            diagnoses: res.data.diagnoses?.length > 0 ? res.data.diagnoses : [{ condition: "", hospital: "", doctor: "", icdCode: "", status: "Active" }],
            vaccinations: res.data.vaccinations?.length > 0 ? res.data.vaccinations : [{ name: "", hospital: "", doseNumber: 1 }]
          });
        } else {
          setFormData({
            bloodGroup: "", height: "", weight: "",
            diagnoses: [{ condition: "", hospital: "", doctor: "", icdCode: "", status: "Active" }],
            vaccinations: [{ name: "", hospital: "", doseNumber: 1 }]
          });
        }
      } catch (err) {
        console.error("Error fetching citizen medical data", err);
      }
    };
    fetchCitizenData();
  }, [selectedCitizen]);

  const handleAddField = (sec) => {
    const templates = {
      diagnoses: { condition: "", hospital: "", doctor: "", icdCode: "", status: "Active" },
      vaccinations: { name: "", hospital: "", doseNumber: 1 }
    };
    setFormData({...formData, [sec]: [...formData[sec], templates[sec]]});
  };

  const removeRow = (sec, index) => {
    const list = [...formData[sec]];
    list.splice(index, 1);
    setFormData({ ...formData, [sec]: list });
  };

  const handleFieldChange = (sec, index, field, value) => {
    const list = [...formData[sec]];
    list[index][field] = value;
    setFormData({ ...formData, [sec]: list });
  };

  const handleSubmit = async () => {
    if (!selectedCitizen) return alert("Select a citizen first!");
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/medical/update`, { 
        ...formData, 
        nid: selectedCitizen.nid 
      });
      alert("Medical History Updated Successfully!");
    } catch (err) {
      alert("Error saving data");
    } finally { setLoading(false); }
  };

  if (!selectedCitizen) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <SideMenu user={user} />
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Paper sx={{ p: 4 }}>Please select a citizen on the Home tab to manage medical records.</Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <SideMenu user={user} />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#05339C' }}>Manage Records: {selectedCitizen.name}</Typography>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSubmit} disabled={loading} sx={{ borderRadius: 2, px: 4 }}>
          {loading ? "SAVING..." : "SAVE OFFICIAL RECORD"}
        </Button>
      </Stack>

      {/* Vitals Summary */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>Physical Summary</Typography>
        <Grid container spacing={3}>
          <Grid item xs={4}><TextField label="Blood Group" fullWidth value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} /></Grid>
          <Grid item xs={4}><TextField label="Height (cm)" fullWidth value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} /></Grid>
          <Grid item xs={4}><TextField label="Weight (kg)" fullWidth value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} /></Grid>
        </Grid>
      </Paper>

      {/* Diagnoses */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Diagnoses & Conditions</Typography>
          <Button startIcon={<AddIcon />} onClick={() => handleAddField('diagnoses')} sx={{ fontWeight: 700 }}>ADD</Button>
        </Box>
        {formData.diagnoses.map((row, i) => (
          <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs={3}><TextField label="Condition" fullWidth size="small" value={row.condition} onChange={(e) => handleFieldChange('diagnoses', i, 'condition', e.target.value)} /></Grid>
            <Grid item xs={2}><TextField label="Hospital" fullWidth size="small" value={row.hospital} onChange={(e) => handleFieldChange('diagnoses', i, 'hospital', e.target.value)} /></Grid>
            <Grid item xs={2}><TextField label="Doctor" fullWidth size="small" value={row.doctor} onChange={(e) => handleFieldChange('diagnoses', i, 'doctor', e.target.value)} /></Grid>
            <Grid item xs={2}><TextField label="ICD Code" fullWidth size="small" value={row.icdCode} onChange={(e) => handleFieldChange('diagnoses', i, 'icdCode', e.target.value)} /></Grid>
            <Grid item xs={2}>
              <TextField select fullWidth label="Status" size="small" value={row.status} onChange={(e) => handleFieldChange('diagnoses', i, 'status', e.target.value)}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={1}><IconButton color="error" onClick={() => removeRow('diagnoses', i)}><DeleteIcon /></IconButton></Grid>
          </Grid>
        ))}
      </Paper>

      {/* Vaccinations Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Vaccinations</Typography>
          <Button startIcon={<AddIcon />} onClick={() => handleAddField('vaccinations')} sx={{ fontWeight: 700 }}>ADD</Button>
        </Box>
        {formData.vaccinations.map((row, i) => (
          <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs={4}><TextField label="Vaccine" fullWidth size="small" value={row.name} onChange={(e) => handleFieldChange('vaccinations', i, 'name', e.target.value)} /></Grid>
            <Grid item xs={4}><TextField label="Hospital" fullWidth size="small" value={row.hospital} onChange={(e) => handleFieldChange('vaccinations', i, 'hospital', e.target.value)} /></Grid>
            <Grid item xs={3}><TextField label="Dose" type="number" fullWidth size="small" value={row.doseNumber} onChange={(e) => handleFieldChange('vaccinations', i, 'doseNumber', e.target.value)} /></Grid>
            <Grid item xs={1}><IconButton color="error" onClick={() => removeRow('vaccinations', i)}><DeleteIcon /></IconButton></Grid>
          </Grid>
        ))}
      </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminMedical;