import { AddRounded } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { investigations } from "../data/investigations";

const labels = { hematology: "Hematology", lft: "Liver Function Tests (LFT)", rft: "Renal Function Tests (RFT)", electrolytes: "Electrolytes / Minerals", glucose: "Glucose / Diabetes Profile", lipid: "Lipid Profile", urine: "Urine Examination", other: "Other Investigations" };

function calculateFlag(value, low, high) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || Number(high) <= 0) return "—";
  if (n < Number(low)) return "LOW";
  if (n > Number(high)) return "HIGH";
  return "NORMAL";
}

export function createInitialLabs() {
  return Object.fromEntries(Object.entries(investigations).map(([section, rows]) => [section, rows.map(([name, unit, reference, low, high]) => ({ name, result: "", unit, reference, low, high, flag: "—", custom: false }))]));
}

export default function LaboratorySection({ labs, setLabs }) {
  const update = (section, index, key, value) => setLabs((current) => ({ ...current, [section]: current[section].map((row, i) => i === index ? { ...row, [key]: value, ...(key === "result" ? { flag: calculateFlag(value, row.low, row.high) } : {}) } : row) }));
  const addCustom = () => setLabs((current) => ({ ...current, other: [...current.other, { name: "", result: "", unit: "", reference: "", flag: "—", low: 0, high: 0, custom: true }] }));

  return <Card className="print-card" variant="outlined" sx={{ mb: 2, borderRadius: 2.5 }}><CardContent>
    <Typography variant="h6" sx={{ pb: 1, mb: 1, borderBottom: "2px solid #e5e7eb", fontWeight: 700 }}>6. Laboratory Investigations</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Reference ranges are general guides. Use the reporting laboratory’s interval for clinical decisions.</Typography>
    {Object.entries(labs).map(([section, rows]) => <Box key={section} sx={{ mb: 3 }}>
      <Typography fontWeight={700} sx={{ mb: 1 }}>{labels[section]}</Typography>
      <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Investigation</TableCell><TableCell>Result</TableCell><TableCell>Unit</TableCell><TableCell>Reference Range</TableCell><TableCell>Flag</TableCell></TableRow></TableHead>
      <TableBody>{rows.map((row, index) => <TableRow key={`${section}-${index}`}>
        <TableCell>{row.custom ? <TextField size="small" value={row.name} onChange={(e)=>update(section,index,"name",e.target.value)} placeholder="Investigation name"/> : row.name}</TableCell>
        <TableCell><TextField size="small" value={row.result} onChange={(e)=>update(section,index,"result",e.target.value)} /></TableCell>
        <TableCell>{row.custom ? <TextField size="small" value={row.unit} onChange={(e)=>update(section,index,"unit",e.target.value)} /> : row.unit}</TableCell>
        <TableCell>{row.custom ? <TextField size="small" value={row.reference} onChange={(e)=>update(section,index,"reference",e.target.value)} /> : row.reference}</TableCell>
        <TableCell><Chip size="small" label={row.flag || "—"} color={row.flag === "HIGH" ? "error" : row.flag === "LOW" ? "warning" : row.flag === "NORMAL" ? "success" : "default"} /></TableCell>
      </TableRow>)}</TableBody></Table></TableContainer>
      {section === "other" && <Button sx={{ mt: 1 }} startIcon={<AddRounded />} onClick={addCustom}>Add Custom Investigation</Button>}
    </Box>)}
  </CardContent></Card>;
}
