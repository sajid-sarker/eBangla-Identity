import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import MenuContent from "../dashboard/MenuContent";

const pages = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/login" },
  { name: "Register", path: "/register" },
];

const settings = [
  { name: "Profile", path: "/profile" },
  { name: "Logout", path: "/logout " },
];

export default function Navbar({ user, setUser, avatarTimestamp }) {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      if (setUser) setUser(null);
      // Clear admin search selection on logout
      sessionStorage.removeItem("adminSelectedCitizen");
      handleCloseUserMenu();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const filteredPages = pages.filter((page) => {
    if (user && (page.name === "Login" || page.name === "Register"))
      return false;
    return true;
  });

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#05339C" }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <CloudCircleIcon
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            eBangla Identity
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
              }}
            >
              <Box
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}
                onClick={handleCloseNavMenu}
                component={Link}
                to="/"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <CloudCircleIcon color="primary" />
                <Typography variant="h6" fontWeight="700">
                  eBangla Identity
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1 }} onClick={handleCloseNavMenu}>
                {filteredPages.map((page) => (
                  <MenuItem key={page.name} component={Link} to={page.path}>
                    <Typography sx={{ textAlign: "center" }}>
                      {page.name}
                    </Typography>
                  </MenuItem>
                ))}
                {user && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2,
                        py: 1,
                        display: "block",
                        color: "text.secondary",
                      }}
                    >
                      DASHBOARD
                    </Typography>
                    <MenuContent user={user} />
                  </>
                )}
              </Box>
            </Drawer>
          </Box>
          <CloudCircleIcon
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              letterSpacing: { xs: ".1rem", sm: ".2rem" },
              color: "inherit",
              textDecoration: "none",
            }}
          >
            eBangla Identity
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {filteredPages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          {user && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user.name}
                    src={
                      user._id
                        ? `${API_BASE_URL}/user/profile-picture/${user._id}?t=${avatarTimestamp}`
                        : undefined
                    }
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem
                  component={Link}
                  to={user.isAdmin ? "/admin/dashboard" : "/profile"}
                  onClick={handleCloseUserMenu}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {user.isAdmin ? "Dashboard" : "Profile"}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography sx={{ textAlign: "center" }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
