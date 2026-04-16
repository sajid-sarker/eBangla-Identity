import React, { useEffect, useState } from "react";
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, Paper, TextField, CircularProgress, Divider, Alert, Snackbar, Chip, Grid, Stack
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../config/env";
import DownloadIcon from "@mui/icons-material/Download";
import CalculateIcon from "@mui/icons-material/Calculate";
import PaymentIcon from "@mui/icons-material/Payment"; 
import SideMenu from "../components/SideMenu";
import { useLocation, useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const TaxRecords = ({ user }) => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [inputIncome, setInputIncome] = useState(""); 
  const [simulatedTax, setSimulatedTax] = useState(null); 
  const [records, setRecords] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, text: "", severity: "success" });
  
  const location = useLocation();
  const navigate = useNavigate();

  const years = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2026 - i);

  const fetchTaxData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/tax?year=${selectedYear}&t=${new Date().getTime()}`
      );
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching tax data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxData();
    setSimulatedTax(null); 
  }, [selectedYear]);

  // Handle Success Redirect Logic
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("status") === "success") {
      setMessage({ open: true, text: "Payment Successful! Record Updated.", severity: "success" });
      fetchTaxData();
      // Clean the URL so the message doesn't keep popping up
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const handlePayment = async (record) => {
    try {
      setMessage({ open: true, text: "Initializing secure payment...", severity: "info" });
      const res = await axios.get(`${API_BASE_URL}/payment/initiate/${record._id}`);
      
      if (res.data && res.data.url) {
        window.location.replace(res.data.url);
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setMessage({ 
        open: true, 
        text: err.response?.data?.message || "Failed to initialize payment gateway.", 
        severity: "error" 
      });
    }
  };

  const handleCalculateSimulation = (e) => {
    e.preventDefault();
    const incomeValue = parseFloat(inputIncome); 
    if (isNaN(incomeValue) || incomeValue <= 0) {
      setMessage({ open: true, text: "Enter a valid income.", severity: "error" });
      return;
    }
    const freeLimit = 350000;
    const tax = incomeValue > freeLimit ? (incomeValue - freeLimit) * 0.05 : 0;
    setSimulatedTax({ income: incomeValue, tax: tax });
  };

  // Helper to determine Chip color
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === "paid") return "success";
    if (s === "rejected") return "error";
    if (s === "pending" || s === "unpaid") return "warning";
    return "default";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideMenu user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, backgroundColor: "#f9fafb" }}>
        <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", borderRadius: 4, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          
          <Box sx={{ backgroundColor: "#05339C", p: 3, textAlign: "center" }}>
            <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>Tax Records & Simulation</Typography>
            <Typography variant="body2" sx={{ color: "white", opacity: 0.8 }}>View official government records or simulate your own tax</Typography>
          </Box>

          <Box component="form" onSubmit={handleCalculateSimulation} sx={{ p: 4, display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f4ff" }}>
            <Typography variant="subtitle2" sx={{ width: '100%', textAlign: 'center', mb: 1, fontWeight: 'bold', color: '#05339C' }}>
              TAX CALCULATION TOOL (PRIVATE SIMULATION)
            </Typography>
            <TextField label="Expected Annual Income" type="number" size="small" value={inputIncome} onChange={(e) => setInputIncome(e.target.value)} sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: "20px", bgcolor: 'white' } }} />
            <Button type="submit" variant="contained" startIcon={<CalculateIcon />} sx={{ backgroundColor: "#05339C", borderRadius: "20px", textTransform: "none", px: 4 }}>Run Simulation</Button>
          </Box>

          <Divider />

          <Box sx={{ p: 4, backgroundColor: "#fff" }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: "#05339C", fontWeight: "bold" }}>Official Record: {selectedYear}</Typography>
                <FormControl sx={{ minWidth: 120 }} size="small">
                    <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} sx={{ borderRadius: "10px" }}>
                        {years.map((year) => <MenuItem key={year} value={year.toString()}>{year}</MenuItem>)}
                    </Select>
                </FormControl>
             </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress sx={{ color: "#05339C" }} /></Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ border: "2px solid #05339C", borderRadius: 3, p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>OFFICIAL DATA</Typography>
                        {records.length > 0 ? (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: "bold" }}>৳ {records[0].totalIncome.toLocaleString()}</Typography>
                                <Typography variant="h6" sx={{ color: "#d32f2f", mt: 1 }}>Tax: ৳ {records[0].taxAmount.toLocaleString()}</Typography>
                                
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                                    <Chip 
                                        label={records[0].status} 
                                        color={getStatusColor(records[0].status)} 
                                        size="small" 
                                        sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                                    />
                                    
                                    {/* MODIFIED CONDITION: Show button for any unpaid/rejected status if tax > 0 */}
                                    {records[0].status.toLowerCase() !== "paid" && (
                                      records[0].taxAmount > 0 ? (
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            startIcon={<PaymentIcon />}
                                            onClick={() => handlePayment(records[0])}
                                            sx={{ backgroundColor: "#05339C", textTransform: 'none', borderRadius: '10px' }}
                                        >
                                            Pay Tax
                                        </Button>
                                      ) : (
                                        <Typography variant="caption" sx={{ color: "green", fontWeight: "bold" }}>
                                          No Tax Due
                                        </Typography>
                                      )
                                    )}
                                </Stack>
                            </Box>
                        ) : (
                            <Typography sx={{ fontStyle: "italic", color: "gray", mt: 1 }}>No verified record for this year.</Typography>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ border: "2px dashed #9c27b0", borderRadius: 3, p: 3, height: '100%', bgcolor: '#fdfaff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: "#9c27b0", fontWeight: 'bold', letterSpacing: 1 }}>PRIVATE SIMULATION</Typography>
                        {simulatedTax ? (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: "bold", opacity: 0.8 }}>৳ {simulatedTax.income.toLocaleString()}</Typography>
                                <Typography variant="h6" sx={{ color: "text.secondary", mt: 1 }}>Estimated Tax: ৳ {simulatedTax.tax.toLocaleString()}</Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'gray' }}>* Based on 5% over 350k threshold.</Typography>
                            </Box>
                        ) : (
                            <Typography sx={{ fontStyle: "italic", color: "gray", mt: 1 }}>Enter income above to see simulation.</Typography>
                        )}
                    </Box>
                </Grid>
              </Grid>
            )}
          </Box>

          <Box sx={{ p: 4, textAlign: "center", borderTop: "1px solid #eee" }}>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              disabled={records.length === 0 || records[0].status.toLowerCase() !== "paid"}
              sx={{ backgroundColor: "#05339C", borderRadius: "25px", px: 5, py: 1.5, textTransform: "none", fontSize: "1.1rem" }}
            >
              Download Official Receipt
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={message.open} autoHideDuration={4000} onClose={() => setMessage({ ...message, open: false })}>
        <Alert severity={message.severity} sx={{ width: "100%" }}>{message.text}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TaxRecords;