import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

export default function FormSection({ section, values, onChange }) {
  return (
    <Card
      className="print-card"
      variant="outlined"
      sx={{ mb: 2, borderRadius: 2.5 }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            pb: 1,
            mb: 2,
            borderBottom: "2px solid #e5e7eb",
            fontWeight: 700,
          }}
        >
          {section.title}
        </Typography>
        <Grid container spacing={1.5}>
          {section.fields.map(
            ([
              name,
              label,
              type = "text",
              required = false,
              options = [],
              readOnly = false,
              full = false,
            ]) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <TextField
                  fullWidth
                  required={required}
                  label={label}
                  name={name}
                  type={type === "select" ? "text" : type}
                  select={type === "select"}
                  value={values[name] ?? ""}
                  onChange={onChange}
                  multiline={section.multiline}
                  minRows={section.multiline ? 3 : undefined}
                  slotProps={{
                    input: { readOnly },
                    inputLabel: { shrink: type === "date" || undefined },
                  }}
                >
                  {options.map((option) => (
                    <MenuItem key={option || "empty"} value={option}>
                      {option || "Select"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ),
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
