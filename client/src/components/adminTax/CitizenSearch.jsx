import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';

const CitizenSearch = ({ onSearchResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/users/citizens?search=${query}`);
      onSearchResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">Find Citizen by NID or Name</Typography>
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter NID Number or Name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
        <Button variant="contained" type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
      </Box>
    </Paper>
  );
};

export default CitizenSearch;