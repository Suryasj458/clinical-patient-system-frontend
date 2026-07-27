import { AddRounded, DeleteOutlineRounded } from "@mui/icons-material";
import { Button, Card, CardContent, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

export const emptyTreatment = () => ({ med: "", dose: "", route: "", freq: "", duration: "", notes: "" });
const columns = [["med","Medicine / Treatment"],["dose","Dose"],["route","Route"],["freq","Frequency"],["duration","Duration"],["notes","Indication / Notes"]];

export default function TreatmentSection({ treatments, setTreatments }) {
  const update = (index, key, value) => setTreatments((rows) => rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
  return <Card className="print-card" variant="outlined" sx={{ mb: 2, borderRadius: 2.5 }}><CardContent>
    <Typography variant="h6" sx={{ pb: 1, mb: 2, borderBottom: "2px solid #e5e7eb", fontWeight: 700 }}>8. Treatment Plan</Typography>
    <TableContainer><Table size="small"><TableHead><TableRow>{columns.map(([,label])=><TableCell key={label}>{label}</TableCell>)}<TableCell /></TableRow></TableHead>
    <TableBody>{treatments.map((row,index)=><TableRow key={index}>{columns.map(([key])=><TableCell key={key}><TextField size="small" value={row[key]} onChange={(e)=>update(index,key,e.target.value)} /></TableCell>)}<TableCell><IconButton color="error" onClick={()=>setTreatments((rows)=>rows.filter((_,i)=>i!==index))}><DeleteOutlineRounded /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    <Button sx={{ mt: 1 }} startIcon={<AddRounded />} onClick={()=>setTreatments((rows)=>[...rows,emptyTreatment()])}>Add Medicine</Button>
  </CardContent></Card>;
}
