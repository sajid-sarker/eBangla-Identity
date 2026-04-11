import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Avatar } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const CitizenResultsTable = ({ citizens, onSelectCitizen }) => {
  if (!citizens || citizens.length === 0) return null;

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, mt: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: '#f5f8ff' }}>
          <TableRow>
            <TableCell>Citizen</TableCell>
            <TableCell>NID</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {citizens.map((citizen) => (
            <TableRow key={citizen._id} hover>
              <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>{citizen.name.charAt(0)}</Avatar>
                {citizen.name}
              </TableCell>
              <TableCell>{citizen.nid}</TableCell>
              <TableCell align="center">
                <Button 
                  startIcon={<ManageAccountsIcon />}
                  variant="outlined" 
                  size="small"
                  onClick={() => onSelectCitizen(citizen)}
                >
                  Manage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CitizenResultsTable;