import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { API_BASE_URL } from "../config/env";
import SideMenu from "../components/SideMenu";

const ReportPage = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [latestTax, setLatestTax] = useState(null);
  const [educationRecords, setEducationRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [statsRes, taxRes, eduRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stats/dashboard`),
          axios.get(`${API_BASE_URL}/tax?year=2026`),
          axios.get(`${API_BASE_URL}/education`).catch(() => ({ data: [] })),
        ]);

        setStats(statsRes.data);

        if (taxRes.data && taxRes.data.length > 0) {
          setLatestTax(taxRes.data[0]);
        }

        if (eduRes.data) {
          setEducationRecords(eduRes.data);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReportData();
  }, [user]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/report/download`, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.download = "Citizen_Digital_Record_Report.pdf";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Report download failed!");
    }
  };

  if (!user || loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#F2EBEB"
      >
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideMenu user={user} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#ffffff",
          p: { xs: 2, md: 5 },
          display: "flex",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 800 }}>
          {/* Download Section (Frame 2 integration) */}
          <Box
            sx={{
              backgroundColor: "#BBD3E7",
              p: 4,
              mb: 1,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#1D237A", fontSize: "18px", mb: 2 }}>
              Your report is ready to download. Click download button below to
              download
            </Typography>
            <Button
              variant="contained"
              onClick={handleDownload}
              sx={{
                backgroundColor: "#D9D9D9",
                color: "black",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#c2c2c2" },
              }}
            >
              Download
            </Button>
          </Box>

          <Box sx={{ backgroundColor: "#FAEDED", p: { xs: 3, md: 6 }, pb: 10 }}>
            <Typography
              variant="h5"
              align="center"
              sx={{ color: "#2B3C8E", mb: 4 }}
            >
              Citizen Digital Record Report
            </Typography>

            <Box sx={{ mb: 4, ml: 2, color: "#1E1E1E", lineHeight: 1.6 }}>
              <Typography>Name : {user.name || ""}</Typography>
              <Typography>SmartNID : {user.nid || ""}</Typography>
            </Box>

            <Stack spacing={3}>
              <Box>
                <Paper
                  sx={{
                    display: "inline-block",
                    backgroundColor: "#D9D9D9",
                    px: 2,
                    py: 1,
                    mb: 2,
                    boxShadow: "none",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#191919" }}>
                    Police Record
                  </Typography>
                </Paper>
                <Box sx={{ pl: 2 }}>
                  {stats?.police ? (
                    <>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          mb: 1,
                          color: "#1E1E1E",
                        }}
                      >
                        {stats.police.status}
                      </Typography>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          color: "#1E1E1E",
                        }}
                      >
                        Last Verifies : {formatDate(stats.police.lastUpdated)}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      sx={{ ml: 2, color: "#666", fontStyle: "italic" }}
                    >
                      No record uploaded yet.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Paper
                  sx={{
                    display: "inline-block",
                    backgroundColor: "#D9D9D9",
                    px: 2,
                    py: 1,
                    mb: 2,
                    boxShadow: "none",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#191919" }}>
                    Medical
                  </Typography>
                </Paper>
                <Box sx={{ pl: 2 }}>
                  {stats?.medical ? (
                    <>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          mb: 1,
                          color: "#1E1E1E",
                        }}
                      >
                        Blood Group :{" "}
                        {stats.medical.bloodGroup || "Not specified"}
                      </Typography>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          mb: 1,
                          color: "#1E1E1E",
                        }}
                      >
                        Vaccination Status :{" "}
                        {stats.medical.vaccinationStatus || "Not specified"}
                      </Typography>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          color: "#1E1E1E",
                        }}
                      >
                        Last Checkup : {formatDate(stats.medical.lastUpdated)}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      sx={{ ml: 2, color: "#666", fontStyle: "italic" }}
                    >
                      No medical status uploaded yet.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Paper
                  sx={{
                    display: "inline-block",
                    backgroundColor: "#D9D9D9",
                    px: 2,
                    py: 1,
                    mb: 2,
                    boxShadow: "none",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#191919" }}>
                    Tax
                  </Typography>
                </Paper>
                <Box sx={{ pl: 2 }}>
                  {latestTax ? (
                    <>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          mb: 1,
                          color: "#1E1E1E",
                        }}
                      >
                        Tax Amount : {latestTax.taxAmount}
                      </Typography>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          mb: 1,
                          color: "#1E1E1E",
                        }}
                      >
                        Tax Identification Number : {latestTax.tin || ""}
                      </Typography>
                      <Typography
                        sx={{
                          display: "list-item",
                          listStyleType: "disc",
                          ml: 2,
                          color: "#1E1E1E",
                        }}
                      >
                        Tax Status : {latestTax.status}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      sx={{ ml: 2, color: "#666", fontStyle: "italic" }}
                    >
                      No tax information uploaded yet.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Paper
                  sx={{
                    display: "inline-block",
                    backgroundColor: "#D9D9D9",
                    px: 2,
                    py: 1,
                    mb: 3,
                    boxShadow: "none",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#191919" }}>
                    Education
                  </Typography>
                </Paper>

                <Box sx={{ pl: { xs: 0, sm: 2 } }}>
                  {educationRecords.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxWidth: 500,
                        boxShadow: "none",
                        border: "1px solid black",
                        borderRadius: 0,
                        backgroundColor: "transparent",
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{
                              "& .MuiTableCell-root": {
                                borderBottom: "1px solid black",
                                borderRight: "1px solid black",
                                color: "#191919",
                              },
                            }}
                          >
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              Exam name
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              Year
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 600,
                                borderRight: "none !important",
                              }}
                            >
                              Result
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {educationRecords.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "& .MuiTableCell-root": {
                                  borderBottom:
                                    index === educationRecords.length - 1
                                      ? "none"
                                      : "1px solid black",
                                  borderRight: "1px solid black",
                                  color: "#191919",
                                },
                              }}
                            >
                              <TableCell align="center">
                                {row.level || row.examName}
                              </TableCell>
                              <TableCell align="center">
                                {row.passingYear || row.year}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ borderRight: "none !important" }}
                              >
                                {row.gpa || row.result}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography
                      sx={{ ml: 2, color: "#666", fontStyle: "italic" }}
                    >
                      No education records uploaded yet.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportPage;
