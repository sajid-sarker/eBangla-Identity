import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function RecordCard({
  title,
  value,
  icon,
  color = "primary.main",
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 230,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mt: 1, color: "text.primary" }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
