import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Box, Typography, Button, Paper, Stack, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ScorePage = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/score")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#B9CDE2">
        <CircularProgress />
      </Box>
    );
  }

  // Parse breakdown to chart layout
  const chartData = [];
  data.breakdown.forEach((item) => {
    // Expected format: "Name: +X" or "Name: 0/X" or "Name"
    let val = 0;
    let label = item;
    
    if (item.includes(": +")) {
      const parts = item.split(": +");
      label = parts[0];
      val = parseInt(parts[1], 10);
    } else if (item.includes(": 0/")) {
      const parts = item.split(": 0/");
      label = parts[0];
      val = parseInt(parts[1], 10); // Show max points as gray area? Actually, pie charts show proportions.
      // If it's 0, it won't show in standard pie. Let's force a small visual or skip.
      val = parseInt(parts[1], 10); // user mockup pie shows 25% for unpaid tax, which means they base pie on TOTAL possible points!
    } else if (item === "Tax not applicable") {
       label = "Tax Status";
       val = 0;
    }

    if (val > 0 || item.includes("Tax")) {
      // If val is 0 but we want it in pie, give it val or handle it
      // Based on the mockup, pie chart shows proportions of the total (e.g. 80 or 100).
      if (val === 0 && item.includes('0/')) val = parseInt(item.split('0/')[1]);
      if (val === 0 && label === "Tax Status") val = 0; // skip if totally N/A

      chartData.push({ name: label, value: val });
    }
  });

  // Safe fallback if empty
  if (chartData.length === 0) chartData.push({ name: "No data", value: 1 });

  // Custom colors matching mockup: 
  // Police (Blue), Verified (Red), Medical (Green), Tax (Dark Grey/Brownish)
  // Mockup shows slices in a reddish/brown hue, but legends are distinct squares.
  const getFillColor = (name) => {
    const lName = name.toLowerCase();
    if (lName.includes("police")) return "#3A4595"; // Dark Blue
    if (lName.includes("profile") || lName.includes("verifi")) return "#D64242"; // Red
    if (lName.includes("medical")) return "#2E8056"; // Green
    if (lName.includes("tax")) return "#3B3B3B"; // Dark grey
    return "#D0A9A9"; // fallback pinkish brown
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#BBD3E7", p: { xs: 2, md: 5 } }}>
      
      {/* Back Button */}
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          backgroundColor: "#849ABC",
          color: "white",
          mb: 3,
          textTransform: "none",
          "&:hover": { backgroundColor: "#6f85a6" },
        }}
      >
        Back
      </Button>

      {/* Main Container */}
      <Box sx={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Title Banner */}
        <Paper sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: "#1D237A", fontWeight: 700 }}>
            Citizen Score Dashboard
          </Typography>
        </Paper>

        {/* Content Rest */}
        <Grid container spacing={4}>
          
          {/* Left Side: Score Breakdown Pie and Score */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                Score Breakdown
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mt: 2 }}>
                {/* Pie Chart Section */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "50%" }}>
                  <Box sx={{ width: 200, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getFillColor(entry.name)} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  {/* Legend inside left card */}
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {[
                      { label: "Police Record", color: "#3A4595" },
                      { label: "Verified Profile", color: "#D64242" },
                      { label: "Medical Active", color: "#2E8056" },
                      { label: "Tax Status", color: "#3B3B3B" },
                    ].map((idx) => (
                      <Box key={idx.label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: idx.color }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#1E1E1E" }}>{idx.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Score Section */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "45%" }}>
                  <Typography sx={{ fontSize: "100px", fontWeight: 800, color: "#1D237A", lineHeight: 1 }}>
                    {data.score}
                  </Typography>
                  
                  <Box sx={{ backgroundColor: "#479b69", color: "black", px: 2, py: 1, mt: 1, mb: 3, fontWeight: 700, width: "130px", textAlign: "center", borderRadius: "2px" }}>
                    {data.status === "Excellent" ? "Good Citizen" : data.status}
                  </Box>

                  {/* Progress Bar Container */}
                  <Box sx={{ width: "130px", height: 40, backgroundColor: "#D9D9D9", display: "flex" }}>
                    <Box 
                      sx={{ 
                        width: `${data.score}%`, 
                        backgroundColor: "#3A4595", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "16px"
                      }}
                    >
                      {data.score}%
                    </Box>
                  </Box>
                </Box>
              </Stack>

            </Paper>
          </Grid>

          {/* Right Side: Score Breakdown List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, height: "100%", backgroundColor: "#FFF7F7" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>
                Score Breakdown
              </Typography>
              
              <Stack spacing={3}>
                {data.breakdown.map((item, index) => (
                  <Typography key={index} sx={{ fontSize: "16px", color: "black", fontWeight: 500 }}>
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default ScorePage;