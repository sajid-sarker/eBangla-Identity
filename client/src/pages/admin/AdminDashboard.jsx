import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SideMenu from "../../components/SideMenu";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";
import { useAdmin } from "../../context/AdminContext";

export default function AdminDashboard({ user }) {
  const { selectedCitizen, setSelectedCitizenData, clearSelectedCitizen } =
    useAdmin();
  const [nid, setNid] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nid.trim()) return;

    setLoading(true);
    setError("");
    setSearchResult(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/user/admin/citizen/${nid}`);
      setSearchResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Citizen not found");
    } finally {
      setLoading(false);
    }
  };

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
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: 700, color: "primary.main" }}
        >
          Admin Dashboard
        </Typography>

        {/* Active Selection Banner */}
        {selectedCitizen && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#e3f2fd",
              border: "1px solid #90caf9",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={`${API_BASE_URL}/user/profile-picture/${selectedCitizen._id}`}
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Actively Managing: {selectedCitizen.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  NID: {selectedCitizen.nid}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={clearSelectedCitizen}
            >
              Clear Selection
            </Button>
          </Paper>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welcome, {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You are logged in as a <strong>{user?.role}</strong>. Search for
                a citizen by NID to manage their profile.
              </Typography>
            </Paper>

            {/* Search Section */}
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Find Citizen by NID
              </Typography>
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{ display: "flex", gap: 2, mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Enter NID Number"
                  variant="outlined"
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  placeholder="e.g. 1990123456789"
                />
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ px: 4, fontWeight: 600 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {searchResult && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Search Result:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Avatar
                      src={`${API_BASE_URL}/user/profile-picture/${searchResult._id}`}
                      sx={{ width: 100, height: 100, border: "2px solid #eee" }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {searchResult.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        NID: <strong>{searchResult.nid}</strong>
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Email: <strong>{searchResult.email}</strong>
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedCitizenData(searchResult)}
                        disabled={selectedCitizen?._id === searchResult._id}
                      >
                        {selectedCitizen?._id === searchResult._id
                          ? "Selected"
                          : "Select Citizen"}
                      </Button>
                      {user?.role === "police" &&
                        selectedCitizen?._id === searchResult._id && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              (window.location.href = `/admin/police/citizen/${searchResult._id}`)
                            }
                          >
                            Manage Police Record
                          </Button>
                        )}
                    </Box>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
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
