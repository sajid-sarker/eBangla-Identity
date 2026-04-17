import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PaymentsIcon from "@mui/icons-material/Payments";
import SchoolIcon from "@mui/icons-material/School";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";

import { useNavigate } from "react-router-dom";

const mainListItems = [
  { text: "Profile", icon: <PeopleRoundedIcon />, path: "/profile" },
  { text: "Medical", icon: <MedicalServicesIcon />, path: "/medical" },
  { text: "Police", icon: <LocalPoliceIcon />, path: "/police" },
  { text: "Tax", icon: <PaymentsIcon />, path: "/tax" },
  { text: "Education", icon: <SchoolIcon />, path: "/education" },
  { text: "Report", icon: <AnalyticsRoundedIcon />, path: "/report" },
  { text: "Score", icon: <AssignmentRoundedIcon />, path: "/score" },
];

export default function MenuContent({ user }) {
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin;
  const role = user?.role;
  const isProfileComplete = user?.isProfileComplete;

  const getFilteredItems = () => {
    if (!isAdmin) return mainListItems;

    const items = [
      { text: "Home", icon: <HomeRoundedIcon />, path: "/admin/dashboard" },
    ];

    if (role === "superuser") {
      items.push(
        {
          text: "Medical",
          icon: <AssignmentRoundedIcon />,
          path: "/admin/medical",
        },
        {
          text: "Police Verification",
          icon: <LocalPoliceIcon />,
          path: "/admin/police",
        },
        {
          text: "Cases",
          icon: <AssignmentRoundedIcon />,
          path: "/admin/cases",
        },
        { text: "Tax", icon: <AssignmentRoundedIcon />, path: "/admin/tax" },
        {
          text: "Education",
          icon: <AssignmentRoundedIcon />,
          path: "/admin/education",
        },
      );
    } else if (role === "medical") {
      items.push({
        text: "Medical",
        icon: <AssignmentRoundedIcon />,
        path: "/admin/medical",
      });
    } else if (role === "police") {
      items.push(
        {
          text: "Police Verification",
          icon: <LocalPoliceIcon />,
          path: "/admin/police",
        },
        {
          text: "Cases",
          icon: <AssignmentRoundedIcon />,
          path: "/admin/cases",
        }
      );
    } else if (role === "general") {
      items.push(
        { text: "Tax", icon: <AssignmentRoundedIcon />, path: "/admin/tax" },
        {
          text: "Education",
          icon: <AssignmentRoundedIcon />,
          path: "/admin/education",
        },
      );
    }

    return items;
  };

  const menuItems = getFilteredItems();

  return (
    <Stack sx={{ flexGrow: 0, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {menuItems.map((item, index) => {
          const isDisabled =
            !isAdmin &&
            !isProfileComplete &&
            (item.text === "Medical" ||
              item.text === "Police" ||
              item.text === "Tax" ||
              item.text === "Education");
          return (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={item.path === window.location.pathname}
                onClick={() => !isDisabled && item.path && navigate(item.path)}
                disabled={isDisabled}
                sx={{
                  opacity: isDisabled ? 0.5 : 1,
                  "&.Mui-disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={isDisabled ? "Complete profile to unlock" : null}
                  secondaryTypographyProps={{
                    variant: "caption",
                    color: "error",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
