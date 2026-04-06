import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ProfileImageCropper from "./ProfileImageCropper";
import { API_BASE_URL } from "../../config/env.js";

export default function UserInfoCard({ user, setUser, setAvatarTimestamp }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nid: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    phone: "",
    yearlyIncome: 0,
    address: {
      division: "",
      district: "",
      upazilla: "",
      village: "",
    },
  });

  // Profile picture state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [pendingPicture, setPendingPicture] = useState(null); // { blob, previewUrl }
  const [avatarTimestamp, setAvatarTimestamp_local] = useState(Date.now());
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        nid: user.nid || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        maritalStatus: user.maritalStatus || "",
        phone: user.phone || "",
        yearlyIncome: user.yearlyIncome || 0,
        address: {
          division: user.address?.division || "",
          district: user.address?.district || "",
          upazilla: user.address?.upazilla || "",
          village: user.address?.village || "",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      // Upload pending picture first (if user selected one)
      if (pendingPicture) {
        const formDataImg = new FormData();
        formDataImg.append("profilePicture", pendingPicture.blob, "profile.jpg");
        await axios.post(`${API_BASE_URL}/user/profile-picture`, formDataImg, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Revoke the local preview URL to free memory
        URL.revokeObjectURL(pendingPicture.previewUrl);
        setPendingPicture(null);
        // Bust cache for Navbar and local Avatar
        const newTimestamp = Date.now();
        setAvatarTimestamp(newTimestamp);
        setAvatarTimestamp_local(newTimestamp);
      }

      // Save profile data
      const res = await axios.put(`${API_BASE_URL}/auth/profile`, formData);
      if (setUser) setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert(err.response?.data?.message || "Failed to save profile");
    }
  };

  const handleCancel = () => {
    // Discard any pending picture without uploading
    if (pendingPicture) {
      URL.revokeObjectURL(pendingPicture.previewUrl);
      setPendingPicture(null);
    }
    setIsEditing(false);
  };

  // --- Profile Picture Handlers ---
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      alert("Image must be smaller than 512kB. Please choose a smaller file or compress it first.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob) => {
    setCropperOpen(false);
    setRawImageSrc(null);

    if (croppedBlob.size > 512 * 1024) {
      alert("The cropped image exceeds 512kB. Please choose a smaller or lower-resolution image.");
      return;
    }

    // Store the blob locally and create a preview URL — no upload yet
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPendingPicture({ blob: croppedBlob, previewUrl });
  };

  const displayUser = user || {
    name: "Unknown User",
    email: "unknown@example.com",
    nid: "Not set",
    dateOfBirth: "Not set",
    gender: "Not set",
    phone: "Not set",
    yearlyIncome: 0,
  };

  // Show local preview if user picked a new picture but hasn't saved yet;
  // otherwise show the server-stored picture with cache-busting timestamp
  const avatarSrc = pendingPicture?.previewUrl
    ?? (user?._id ? `${API_BASE_URL}/user/profile-picture/${user._id}?t=${avatarTimestamp}` : undefined);

  return (
    <Card variant="outlined" sx={{ width: "100%", mb: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Avatar with edit overlay (only visible in edit mode) */}
            <Tooltip title={isEditing ? "Change Profile Picture" : ""} placement="bottom">
              <Box
                onClick={handleAvatarClick}
                sx={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  cursor: isEditing ? "pointer" : "default",
                  borderRadius: "50%",
                  "&:hover .avatar-overlay": {
                    opacity: isEditing ? 1 : 0,
                  },
                }}
              >
                <Avatar
                  alt={displayUser.name}
                  src={avatarSrc}
                  sx={{ width: 80, height: 80 }}
                />
                {/* Edit overlay — only meaningful in edit mode */}
                {isEditing && (
                  <Box
                    className="avatar-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.50)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <CameraAltIcon sx={{ color: "#fff", fontSize: 26 }} />
                  </Box>
                )}
              </Box>
            </Tooltip>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <Box>
              {isEditing ? (
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {displayUser.name}{" "}
                  <VerifiedUserIcon
                    color="primary"
                    sx={{ verticalAlign: "middle", ml: 1 }}
                  />
                </Typography>
              )}
              <Typography color="text.secondary">
                {displayUser.email}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={
                    user?.isProfileComplete
                      ? "Verified Citizen"
                      : "Incomplete Profile"
                  }
                  color={user?.isProfileComplete ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Box>
            {isEditing ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  onClick={handleSave}
                  size="small"
                >
                  Save
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  variant="outlined"
                  onClick={handleCancel}
                  size="small"
                  color="inherit"
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setIsEditing(true)}
                size="small"
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography variant="caption" color="text.secondary">
              National ID (NID)
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="nid"
                value={formData.nid}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.nid || "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography variant="caption" color="text.secondary">
              Date of Birth
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.dateOfBirth
                  ? new Date(displayUser.dateOfBirth).toLocaleDateString()
                  : "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography variant="caption" color="text.secondary">
              Gender
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.gender || "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography variant="caption" color="text.secondary">
              Phone Number
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.phone || "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography variant="caption" color="text.secondary">
              Marital Status
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="married">Married</MenuItem>
                <MenuItem value="widowed">Widowed</MenuItem>
              </TextField>
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.maritalStatus
                  ? displayUser.maritalStatus.charAt(0).toUpperCase() +
                    displayUser.maritalStatus.slice(1)
                  : "Not set"}
              </Typography>
            )}
          </Grid>

          {/* Address Fields Row */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 1 }}>
              Address
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Division
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="address.division"
                value={formData.address.division}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.address?.division || "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              District
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="address.district"
                value={formData.address.district}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.address?.district || "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Upazilla
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="address.upazilla"
                value={formData.address.upazilla}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.address?.upazilla || "Not set"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Village
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="address.village"
                value={formData.address.village}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {displayUser.address?.village || "Not set"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>

      {/* Image cropper modal */}
      {rawImageSrc && (
        <ProfileImageCropper
          open={cropperOpen}
          imageSrc={rawImageSrc}
          onClose={() => {
            setCropperOpen(false);
            setRawImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </Card>
  );
}
