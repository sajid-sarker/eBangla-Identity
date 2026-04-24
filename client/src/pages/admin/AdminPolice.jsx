import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import SideMenu from "../../components/dashboard/SideMenu";
import { API_BASE_URL } from "../../config/env";
import { useAdmin } from "../../context/AdminContext";

export default function AdminPolice({ user }) {
  const { selectedCitizen } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification Modal State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nidFile, setNidFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [verStatus, setVerStatus] = useState("Pending");
  const [notes, setNotes] = useState("");

  const fetchUsers = async () => {
    if (!selectedCitizen) {
      setUsers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/police/citizen/${selectedCitizen._id}`,
      );
      setUsers([
        {
          citizen: res.data.citizen,
          policeRecord: res.data,
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedCitizen]);

  // --- Handlers for Verification Modal ---
  const handleOpenVerify = (row) => {
    setSelectedUser(row);
    setOcrText(row.policeRecord?.nidOcrText || "");
    setVerStatus(row.policeRecord?.verificationStatus || "Pending");
    setNotes(row.policeRecord?.notes || "");
    setNidFile(null);
    setVerifyModalOpen(true);
  };

  const handleNidUpload = async () => {
    if (!nidFile) return alert("Select an image first.");
    const formData = new FormData();
    formData.append("nid", nidFile);

    setOcrLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/police/upload-nid/${selectedUser.citizen._id}`,
        formData,
      );
      setOcrText(res.data.extractedText);
      alert("NID Extracted Successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to extract NID");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser.policeRecord?._id)
      return alert("Upload NID first to create record");
    try {
      await axios.put(
        `${API_BASE_URL}/police/update/${selectedUser.policeRecord._id}`,
        {
          verificationStatus: verStatus,
          notes,
        },
      );
      alert("Updated successfully");
      setVerifyModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <SideMenu user={user} />
      <Box
        sx={{
          flexGrow: 1,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1D237A" }}>
          Police Verification Hub
        </Typography>

        <Paper sx={{ p: 2, borderRadius: 2, flexGrow: 1 }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexGrow={1}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>NID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Please search and select a specific citizen from the
                          Home Dashboard first.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((row) => (
                      <TableRow key={row.citizen._id}>
                        <TableCell>{row.citizen.name}</TableCell>
                        <TableCell>{row.citizen.nid || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              row.policeRecord?.verificationStatus || "Pending"
                            }
                            color={
                              row.policeRecord?.verificationStatus ===
                              "Verified"
                                ? "success"
                                : row.policeRecord?.verificationStatus ===
                                    "Rejected"
                                  ? "error"
                                  : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenVerify(row)}
                            >
                              Verify NID
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Verify Modal */}
      <Dialog
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Verify NID - {selectedUser?.citizen.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Upload NID Image for OCR
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNidFile(e.target.files[0])}
              />
              <Button
                variant="contained"
                onClick={handleNidUpload}
                disabled={ocrLoading || !nidFile}
              >
                {ocrLoading ? <CircularProgress size={24} /> : "Run OCR"}
              </Button>
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="OCR Extraction Result"
            value={ocrText}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Verification Status"
            value={verStatus}
            onChange={(e) => setVerStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Verified">Verified</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Admin Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
