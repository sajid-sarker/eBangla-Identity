import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";

import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const AddQualificationModal = ({ open, onClose, onSuccess, editData, citizenId }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    qualification: "",
    degreeName: "",
    institution: "",
    passingYear: new Date().getFullYear(),
  });
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const resetForm = () => {
    setFormData({
      qualification: "",
      degreeName: "",
      institution: "",
      passingYear: new Date().getFullYear(),
    });
    setFile(null);
    setUploadError(null);
  };

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          qualification: editData.qualification || "",
          degreeName: editData.degreeName || "",
          institution: editData.institution || "",
          passingYear: editData.passingYear || new Date().getFullYear(),
        });
        setFile(null);
        setUploadError(null);
      } else {
        resetForm();
      }
    }
  }, [editData, open]);


  const handleInternalClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 1024 * 1024) {
      setUploadError("File size must be less than 1MB");
      setFile(null);
    } else {
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editData) {
      setUploadError("Please upload a supporting document (PDF or Image)");
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append("qualification", formData.qualification);
    data.append("degreeName", formData.degreeName);
    data.append("institution", formData.institution);
    data.append("passingYear", formData.passingYear);
    if (file) {
      data.append("document", file);
    }
    if (citizenId && !editData) {
      data.append("citizenId", citizenId);
    }

    try {
      if (editData) {
        await axios.put(`${API_BASE_URL}/education/${editData._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_BASE_URL}/education/document`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetForm();
      onClose();
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error("Error submitting qualification:", err);
      setUploadError(
        err.response?.data?.message || "Failed to submit qualification"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={handleInternalClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editData ? "Edit Qualification" : "Add New Qualification"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Qualification Type</InputLabel>
              <Select
                name="qualification"
                value={formData.qualification}
                label="Qualification Type"
                onChange={handleChange}
              >
                <MenuItem value="Primary">Primary</MenuItem>
                <MenuItem value="Secondary">Secondary</MenuItem>
                <MenuItem value="Higher Secondary">Higher Secondary</MenuItem>
                <MenuItem value="Bachelors">Bachelors</MenuItem>
                <MenuItem value="Masters">Masters</MenuItem>
                <MenuItem value="PhD">PhD</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="degreeName"
              label="Degree Name (optional)"
              placeholder="e.g. B.Sc. in Computer Science"
              fullWidth
              value={formData.degreeName}
              onChange={handleChange}
            />

            <TextField
              name="institution"
              label="Institution"
              placeholder="e.g. University of Dhaka"
              fullWidth
              required
              value={formData.institution}
              onChange={handleChange}
            />

            <TextField
              name="passingYear"
              label="Passing Year"
              type="number"
              fullWidth
              required
              value={formData.passingYear}
              onChange={handleChange}
            />

            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Supporting Document (PDF/JPG/PNG, Max 1MB) {editData ? "(Optional)" : ""}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ py: 1.5, borderStyle: "dashed" }}
              >
                {file ? file.name : editData ? "Replace Current Certificate" : "Upload Certificate"}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Button>
              {uploadError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {uploadError}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleInternalClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{ px: 4 }}
          >
            {submitting ? <CircularProgress size={24} /> : editData ? "Save Changes" : "Submit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddQualificationModal;
