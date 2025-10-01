import React from 'react'
import { Box, TextField, InputAdornment, IconButton } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

function SearchBar({ value, onChange, placeholder = 'Cuisine dans le 7e' }) {
    return (
        <Box sx={{ px: 3, mb: 3 }}>
            <TextField
                fullWidth
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                sx={{
                    bgcolor: '#FFD166',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            border: 'none',
                        },
                        '&:hover fieldset': {
                            border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                            border: 'none',
                        },
                    },
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton>
                                <MuiIcons.Search />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}

export default SearchBar
