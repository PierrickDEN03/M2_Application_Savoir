// FILE: src/components/activities/SearchBar.jsx
import React, { useState, useEffect } from 'react'
import { Box, TextField, InputAdornment, IconButton } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

function SearchBar({ value, onChange, placeholder = 'Cuisine dans le 7e' }) {
    const [inputValue, setInputValue] = useState(value)

    // Annule la recherche si le champ devient vide
    useEffect(() => {
        if (inputValue === '') {
            onChange('')
        }
    }, [inputValue, onChange])

    const handleSearch = () => {
        onChange(inputValue)
    }

    const handleClear = () => {
        setInputValue('')
        onChange('') // Reset immédiat
    }

    return (
        <Box sx={{ px: 3, mb: 3 }}>
            <TextField
                fullWidth
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                sx={{
                    bgcolor: '#FFD166',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                    },
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {inputValue && (
                                <IconButton onClick={handleClear} edge="end">
                                    <MuiIcons.Close />
                                </IconButton>
                            )}
                            <IconButton onClick={handleSearch} edge="end">
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
