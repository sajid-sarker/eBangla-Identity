import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { API_BASE_URL } from "../config/env";
import SideMenu from "../components/SideMenu";

const ScorePage = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/score`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching score:", err);
      setError("Failed to load score data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu user={user} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
          bgcolor="#B9CDE2"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu user={user} />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
          bgcolor="#B9CDE2"
          p={3}
        >
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchScore} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (!data) return null;

  // Parse breakdown to chart layout
  const chartData = [];
  data.breakdown.forEach((item) => {
    let val = 0;
    let label = item;

    if (item.includes(": +")) {
      const parts = item.split(": +");
      label = parts[0];
      val = parseInt(parts[1], 10);
    } else if (item.includes(": 0/")) {
      const parts = item.split(": 0/");
      label = parts[0];
      val = 0; // Explicitly map actual zero marks!
    }

    // Assign categories securely for color mapping
    if (label.toLowerCase().includes("police")) label = "Police Record";
    if (label.toLowerCase().includes("medical")) label = "Medical Status";
    if (label.toLowerCase().includes("profile")) label = "Profile Status";
    if (label.toLowerCase().includes("tax")) label = "Tax Status";

    chartData.push({ name: label, value: val });
  });

  // Safe fallback if empty
  if (chartData.length === 0) chartData.push({ name: "No data", value: 1 });

  // Custom colors matching mockup
  const getFillColor = (name) => {
    const lName = name.toLowerCase();
    if (lName.includes("police")) return "#3A4595"; // Dark Blue
    if (lName.includes("profile") || lName.includes("verifi")) return "#D64242"; // Red
    if (lName.includes("medical")) return "#2E8056"; // Green
    if (lName.includes("tax")) return "#3B3B3B"; // Dark grey
    return "#D0A9A9"; // fallback
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // Variables defined inline above in Pie component directly where they are needed

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideMenu user={user} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#BBD3E7",
          p: { xs: 2, md: 5 }, // Increased padding for better breathing room
          overflow: "auto",
          display: "flex", // Centers the max-width block inside
          justifyContent: "center"
        }}
      >
        {/* Main Container - Balanced centering and wider footprint */}
        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          {/* Title Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 0,
            }}
          >
            <Typography variant="h6" sx={{ color: "#1D237A", fontWeight: 800 }}>
              Citizen Score Dashboard
            </Typography>
          </Paper>

          {/* Content Rest */}
          <Grid container spacing={4}>
            {/* Left Side: Score Breakdown Pie and Score */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRadius: 0,
                  bgcolor: "white",
                  position: "relative",
                  border: "2px solid #6699CC" 
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: "black", position: "absolute", top: 16, left: 16 }}>
                  Score Breakdown
                </Typography>

                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  alignItems="center"
                  justifyContent="space-around" // Fix crushing! Fluid spacing
                  sx={{ mt: 6, height: "100%", width: "100%" }}
                >
                  {/* Pie Chart Section - Solid Classic */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1, // Fluid grow instead of hard crushing 60%
                      minWidth: "250px" // Ensure SVG gets at least 250px to render full circle safely
                    }}
                  >
                    <Box sx={{ width: "100%", height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={85} // Perfect sizing to guarantee no edge clipping
                            minAngle={5}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = innerRadius + (outerRadius - innerRadius) * 0.55; 
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);
                              const color = getFillColor(name);
                              
                              if (percent === 0) return null; 

                              return (
                                <g>
                                  <rect x={x - 20} y={y - 8} width={14} height={14} fill={color} />
                                  <text
                                    x={x - 2}
                                    y={y}
                                    fill="black"
                                    textAnchor="start"
                                    dominantBaseline="central"
                                    fontWeight="800"
                                    fontSize={13}
                                  >
                                    {name.includes("Tax") && percent < 0.2 ? "Tax Unpaid" : `${(percent * 100).toFixed(1)}%`}
                                  </text>
                                </g>
                              );
                            }}
                            labelLine={false}
                            isAnimationActive={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill="#D0A9A9" 
                                stroke="black" 
                                strokeWidth={1}
                                style={{ outline: "none" }}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Legend inside left card */}
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      {[
                        { label: "Police Record", color: "#3A4595" },
                        { label: "Verified Profile", color: "#D64242" },
                        { label: "Medical Active", color: "#2E8056" },
                        { label: "Tax Status", color: "#3B3B3B" },
                      ].map((idx) => (
                        <Box
                          key={idx.label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{ width: 16, height: 16, bgcolor: idx.color }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "14px",
                              color: "black",
                            }}
                          >
                            {idx.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Score Section */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      pl: { xs: 0, lg: 2 } // Prevent crowding the graph
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "90px",
                        fontWeight: 800,
                        color: "#1D237A",
                        lineHeight: 1,
                      }}
                    >
                      {data.score}
                    </Typography>

                    <Box
                      sx={{
                        backgroundColor: "#479b69",
                        color: "black",
                        px: 2,
                        py: 1,
                        mt: 2,
                        mb: 4,
                        fontWeight: 800,
                        width: "150px",
                        textAlign: "center",
                        borderRadius: 0, 
                      }}
                    >
                      {data.status}
                    </Box>

                    {/* Progress Bar Container */}
                    <Box
                      sx={{
                        width: "150px",
                        height: 48,
                        backgroundColor: "#EAE6E6", 
                        display: "flex",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${data.score}%`,
                          backgroundColor: "#3A4595", 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "20px",
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
            <Grid item xs={12} md={5} sx={{ display: "flex" }}>
              <Paper sx={{ 
                p: 4, 
                width: "100%", 
                backgroundColor: "#FCF5F5",
                display: "flex",
                flexDirection: "column",
                borderRadius: 0,
                border: "none",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.05)"
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, color: "black" }}>
                  Score Breakdown
                </Typography>

                <Stack spacing={4} sx={{ flexGrow: 1, mt: 2 }}>
                  {data.breakdown.map((item, index) => {
                     return (
                       <Typography
                         key={index}
                         sx={{ fontSize: "16px", color: "black", fontWeight: 500 }}
                       >
                         {item}
                       </Typography>
                     );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ScorePage;
