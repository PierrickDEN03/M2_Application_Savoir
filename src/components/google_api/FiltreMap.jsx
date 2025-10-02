// FILE: src/components/FiltreMap.jsx
import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, TextField, FormControl, Select, MenuItem, Chip, IconButton, Collapse } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchCategoriesFromDB } from '../../services/categoriesService'
export default function FiltreMap({ onFilterChange }) {
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState([])
    const [filters, setFilters] = useState({
        location: '',
        timeSlot: '',
        categories: [],
    })

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await fetchCategoriesFromDB()
                setCategories(cats)
            } catch (error) {
                console.error('Erreur chargement des catégories:', error)
            }
        }
        loadCategories()
    }, [])

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters)
        }
    }, [filters, onFilterChange])

    const handleLocationChange = (e) => {
        setFilters((prev) => ({ ...prev, location: e.target.value }))
    }

    const handleTimeSlotChange = (e) => {
        setFilters((prev) => ({ ...prev, timeSlot: e.target.value }))
    }

    const handleCategoryToggle = (categoryId) => {
        setFilters((prev) => {
            const categories = prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)
                : [...prev.categories, categoryId]
            return { ...prev, categories }
        })
    }

    const handleReset = () => {
        setFilters({
            location: '',
            timeSlot: '',
            categories: [],
        })
    }

    const getIconComponent = (iconName) => {
        const IconComponent = MuiIcons[iconName] || MuiIcons.ShoppingCart
        return IconComponent
    }

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 80,
                right: 20,
                zIndex: 1000,
                maxWidth: 400,
            }}
        >
            {/* Bouton d'ouverture/fermeture */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mb: 1,
                }}
            >
                <IconButton
                    onClick={() => setOpen(!open)}
                    sx={{
                        bgcolor: 'white',
                        boxShadow: 2,
                        '&:hover': {
                            bgcolor: 'white',
                        },
                    }}
                >
                    <MuiIcons.FilterList sx={{ color: '#3454D1' }} />
                </IconButton>
            </Box>

            {/* Panel de filtres */}
            <Collapse in={open}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#3454D1', fontWeight: 600 }}>
                            Filtres
                        </Typography>
                        <IconButton size="small" onClick={() => setOpen(false)}>
                            <MuiIcons.Close />
                        </IconButton>
                    </Box>

                    {/* Localisation */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                            Localisation
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={filters.location}
                            onChange={handleLocationChange}
                            placeholder="Lyon, Villeurbanne"
                            InputProps={{
                                startAdornment: <MuiIcons.LocationOn sx={{ color: '#666', mr: 1 }} />,
                            }}
                        />
                    </Box>

                    {/* Horaire */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                            Horaire
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={filters.timeSlot}
                                onChange={handleTimeSlotChange}
                                displayEmpty
                                startAdornment={<MuiIcons.Schedule sx={{ color: '#666', mr: 1 }} />}
                            >
                                <MenuItem value="">Tous les horaires</MenuItem>
                                <MenuItem value="morning">Matin (6h-12h)</MenuItem>
                                <MenuItem value="afternoon">Après-midi (12h-18h)</MenuItem>
                                <MenuItem value="evening">Soir (18h-23h)</MenuItem>
                                <MenuItem value="night">Nuit (23h-6h)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Thématique */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                            Thématique
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categories.map((category) => {
                                const IconComponent = getIconComponent(category.iconName)
                                const isSelected = filters.categories.includes(category.id)

                                return (
                                    <Chip
                                        key={category.id}
                                        icon={<IconComponent sx={{ fontSize: 18 }} />}
                                        label={category.description}
                                        onClick={() => handleCategoryToggle(category.id)}
                                        sx={{
                                            bgcolor: isSelected ? category.color : '#f5f5f5',
                                            color: isSelected ? 'white' : '#666',
                                            fontWeight: isSelected ? 600 : 400,
                                            '&:hover': {
                                                bgcolor: isSelected ? category.color : '#e0e0e0',
                                            },
                                            '& .MuiChip-icon': {
                                                color: isSelected ? 'white' : category.color,
                                            },
                                        }}
                                    />
                                )
                            })}
                        </Box>
                    </Box>

                    {/* Bouton réinitialiser */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Chip
                            label="Réinitialiser les filtres"
                            onClick={handleReset}
                            onDelete={handleReset}
                            deleteIcon={<MuiIcons.Refresh />}
                            sx={{
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#e0e0e0',
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </Collapse>
        </Box>
    )
}
