import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Box, Typography, Paper, Button, CircularProgress, Alert, 
  Snackbar, Chip, Table, TableBody, TableCell, TableHead, TableRow, 
  Stack, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem 
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";
import { useAdmin } from "../../context/AdminContext";
import SideMenu from "../../components/SideMenu";

export default function AdminTax({ user }) {
  const adminContext = useAdmin();
  const selectedCitizen = adminContext?.selectedCitizen || null;

  // States
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [financials, setFinancials] = useState({ 
    year: "2026", 
    annualIncome: "" 
  });

  // Generate Year List (2000 - 2026)
  const years = Array.from({ length: 27 }, (_, i) => (2026 - i).toString());

  // Note: Cumulative stats are still calculated in useMemo for your logic
  const stats = useMemo(() => {
    const totalInc = records.reduce((sum, rec) => sum + (rec.totalIncome || 0), 0);
    const totalProp = selectedCitizen?.propertyValue || 0; 
    return { totalInc, totalProp };
  }, [records, selectedCitizen]);

  const fetchRecords = useCallback(async () => {
    if (!selectedCitizen?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/tax/admin/citizen/${selectedCitizen._id}`);
      const sortedData = Array.isArray(res.data) 
        ? res.data.sort((a, b) => b.fiscalYear - a.fiscalYear || new Date(b.createdAt) - new Date(a.createdAt)) 
        : [];
      setRecords(sortedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tax records");
    } finally {
      setLoading(false);
    }
  }, [selectedCitizen?._id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      await axios.patch(`${API_BASE_URL}/tax/admin/status/${id}`, { status });
      setRecords((prev) =>
        prev.map((rec) => (rec._id === id ? { ...rec, status } : rec))
      );
      setSnackbar({ open: true, message: `Record marked as ${status}`, severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveFinancials = async () => {
    if (!financials.annualIncome || financials.annualIncome < 0) {
        setSnackbar({ open: true, message: "Please enter a valid income", severity: "error" });
        return;
    }

    setActionLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/tax/admin/update-citizen/${selectedCitizen._id}`, financials);
      setSnackbar({ open: true, message: "Annual income set and tax calculated!", severity: "success" });
      setOpenModal(false);
      setFinancials({ ...financials, annualIncome: "" }); 
      fetchRecords(); 
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to update income", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <SideMenu user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "background.default", minHeight: "100vh" }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "primary.main" }}>
          Tax Management
        </Typography>

        {!selectedCitizen ? (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">No citizen selected.</Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 4, bgcolor: "primary.main", color: "white", borderRadius: 2 }}>
              <Grid container spacing={0} justifyContent="space-between" alignItems="center">
                
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Managing Tax for</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{selectedCitizen.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>NID: {selectedCitizen.nid}</Typography>
                </Grid>
                
                {/* Column 2: Modified Annual Income Section */}
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 1.5 }}>ANNUAL INCOME MANAGEMENT</Typography>
                  <Button 
                    variant="outlined" 
                    size="medium"
                    onClick={() => setOpenModal(true)}
                    sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)", textTransform: 'none', px: 4, fontWeight: 600, "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                  >
                    Set Income
                  </Button>
                </Grid>

                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 1.5 }}>PROPERTY VALUE MANAGEMENT</Typography>
                  <Button 
                    variant="outlined" 
                    size="medium"
                    sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)", textTransform: 'none', px: 4, fontWeight: 600, "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                  >
                    View Properties
                  </Button>
                </Grid>

              </Grid>
            </Paper>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
            ) : (
              <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f8ff" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Reference ID</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Income</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Tax</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{record.fiscalYear}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{record._id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell>৳ {record.totalIncome?.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>৳ {record.taxAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status === "Paid" ? "Paid" : "Unpaid"} 
                            size="small"
                            color={record.status === "Paid" ? "success" : "warning"} 
                            sx={{ fontWeight: "bold", minWidth: '80px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button size="small" variant="contained" color="inherit" disabled={record.status === "Paid" || actionLoading === record._id} onClick={() => handleStatusUpdate(record._id, "Paid")} sx={{ bgcolor: record.status === "Paid" ? "#e0e0e0" : "#eeeeee", textTransform: 'none' }}>Approve</Button>
                            <Button size="small" variant="outlined" color="error" disabled={record.status === "Rejected" || actionLoading === record._id} onClick={() => handleStatusUpdate(record._id, "Rejected")} sx={{ textTransform: 'none' }}>Reject</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* MODAL: Update Annual Income */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>Update Annual Income</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: '350px' }}>
            <TextField
              select
              label="Select Year"
              fullWidth
              value={financials.year}
              onChange={(e) => setFinancials({...financials, year: e.target.value})}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Set Annual Income"
              type="number"
              fullWidth
              value={financials.annualIncome}
              onChange={(e) => setFinancials({...financials, annualIncome: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveFinancials} disabled={actionLoading}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}