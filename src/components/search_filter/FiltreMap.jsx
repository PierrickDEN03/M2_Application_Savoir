import React, { useState, useEffect, useCallback } from 'react'
import { Box, Paper, Typography, TextField, IconButton, Slider, Chip, Button, Slide, Fade } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchCategoriesFromDB } from '../../services/categoriesService'

export default function FiltreMap({ onFilterChange }) {
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState([])

    const [filters, setFilters] = useState({
        location: '',
        distance: null,
        startDate: null,
        endDate: null,
        categories: [],
        date: 'Toutes dates', // Pour l'affichage UI uniquement
    })

    // Charger les catégories une seule fois
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

    // ✅ Convertir l'option "date" en startDate/endDate
    const convertDateFilter = (dateString) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (dateString) {
            case 'Demain': {
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(0, 0, 0, 0)
                const tomorrowEnd = new Date(tomorrow)
                tomorrowEnd.setHours(23, 59, 59, 999)
                return { startDate: tomorrow.toISOString(), endDate: tomorrowEnd.toISOString() }
            }
            case 'Cette semaine': {
                const weekEnd = new Date(today)
                const daysUntilSunday = 6 - today.getDay()
                weekEnd.setDate(weekEnd.getDate() + (daysUntilSunday === -1 ? 0 : daysUntilSunday))
                weekEnd.setHours(23, 59, 59, 999)
                return { startDate: today.toISOString(), endDate: weekEnd.toISOString() }
            }
            case 'Ce weekend': {
                const today2 = new Date()
                const dayOfWeek = today2.getDay()
                let saturday = new Date(today2)

                if (dayOfWeek === 0) {
                    // Dimanche : pas de weekend cette semaine
                    saturday.setDate(saturday.getDate() + 6)
                } else if (dayOfWeek === 6) {
                    // Samedi : c'est maintenant
                    saturday.setHours(0, 0, 0, 0)
                } else {
                    // Jour de semaine
                    const daysUntilSaturday = 6 - dayOfWeek
                    saturday.setDate(saturday.getDate() + daysUntilSaturday)
                    saturday.setHours(0, 0, 0, 0)
                }

                const sunday = new Date(saturday)
                sunday.setDate(sunday.getDate() + 1)
                sunday.setHours(23, 59, 59, 999)

                return { startDate: saturday.toISOString(), endDate: sunday.toISOString() }
            }
            default: // 'Toutes dates'
                return { startDate: null, endDate: null }
        }
    }

    // ✅ Envoyer les filtres au parent avec le bon format
    const sendFiltersToParent = useCallback(() => {
        const { startDate, endDate } = convertDateFilter(filters.date)

        onFilterChange?.({
            location: filters.location || '',
            distance: filters.distance,
            startDate,
            endDate,
            categories: filters.categories,
        })
    }, [onFilterChange, filters])

    // Appeler le parent quand les filtres changent
    useEffect(() => {
        sendFiltersToParent()
    }, [sendFiltersToParent])

    const handleLocationChange = (e) => {
        setFilters((prev) => ({ ...prev, location: e.target.value }))
    }

    const handleDistanceChange = (e, val) => {
        setFilters((prev) => ({ ...prev, distance: val }))
    }

    const handleDateChange = (dateOption) => {
        setFilters((prev) => ({ ...prev, date: dateOption }))
    }

    const handleCategoryToggle = (id) => {
        setFilters((prev) => {
            const selected = prev.categories.includes(id) ? prev.categories.filter((c) => c !== id) : [...prev.categories, id]
            return { ...prev, categories: selected }
        })
    }

    const handleReset = () => {
        setFilters({
            location: '',
            distance: null,
            startDate: null,
            endDate: null,
            categories: [],
            date: 'Toutes dates',
        })
    }

    const getIconComponent = (name) => MuiIcons[name] || MuiIcons.Interests
    const dateOptions = ['Toutes dates', 'Demain', 'Cette semaine', 'Ce weekend']

    return (
        <>
            {/* --- OVERLAY NOIR --- */}
            <Fade in={open}>
                <Box
                    onClick={() => setOpen(false)}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        zIndex: 1400,
                        pointerEvents: open ? 'auto' : 'none',
                    }}
                />
            </Fade>

            {/* --- BOUTON FLOTTANT --- */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 2000,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    boxShadow: 4,
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'scale(1.05)',
                    },
                }}
                onClick={() => setOpen(true)}
            >
                <MuiIcons.Tune sx={{ color: '#3454D1', fontSize: 30 }} />
            </Box>

            {/* --- PANEL GLISSANT --- */}
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: '100vw',
                        maxHeight: '85vh',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        p: 3,
                        zIndex: 1500,
                        overflowY: 'auto',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#3454D1', fontWeight: 700 }}>
                            Filtres
                        </Typography>
                        <IconButton onClick={() => setOpen(false)}>
                            <MuiIcons.Close />
                        </IconButton>
                    </Box>

                    {/* Localisation */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1 }}>Localisation</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ex: Lyon, Marseille..."
                            value={filters.location}
                            onChange={handleLocationChange}
                            InputProps={{
                                startAdornment: <MuiIcons.Search sx={{ mr: 1, color: '#999' }} />,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#3454D1',
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Distance */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1 }}>
                            Distance : {filters.distance !== null ? `${filters.distance} km` : 'Pas de limite'}
                        </Typography>
                        <Box sx={{ px: 1 }}>
                            <Slider
                                value={filters.distance || 0}
                                onChange={handleDistanceChange}
                                min={0}
                                max={100}
                                step={5}
                                marks={[
                                    { value: 0, label: '0 km' },
                                    { value: 50, label: '50 km' },
                                    { value: 100, label: '100 km' },
                                ]}
                                sx={{
                                    color: '#3454D1',
                                    '& .MuiSlider-markLabel': {
                                        fontSize: 12,
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Date */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1 }}>Date</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {dateOptions.map((opt) => (
                                <Button
                                    key={opt}
                                    variant={filters.date === opt ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => handleDateChange(opt)}
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        bgcolor: filters.date === opt ? '#3454D1' : 'white',
                                        color: filters.date === opt ? 'white' : '#3454D1',
                                        borderColor: '#3454D1',
                                        fontWeight: filters.date === opt ? 600 : 400,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: filters.date === opt ? '#2c43a5' : '#f0f2ff',
                                        },
                                    }}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {/* Type d'activité */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1 }}>Type d'activité</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {/* Bouton "Tout" */}
                            <Chip
                                label="Tout"
                                onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
                                sx={{
                                    bgcolor: filters.categories.length === 0 ? '#3454D1' : '#f5f5f5',
                                    color: filters.categories.length === 0 ? 'white' : '#555',
                                    fontWeight: filters.categories.length === 0 ? 600 : 400,
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: filters.categories.length === 0 ? '#2c43a5' : '#e0e0e0',
                                    },
                                    '& .MuiChip-icon': {
                                        color: filters.categories.length === 0 ? 'white' : '#3454D1',
                                        transition: 'color 0.2s ease',
                                    },
                                }}
                            />

                            {categories.map((cat) => {
                                const Icon = getIconComponent(cat.iconName)
                                const selected = filters.categories.includes(cat.id)
                                return (
                                    <Chip
                                        key={cat.id}
                                        icon={<Icon sx={{ fontSize: 18 }} />}
                                        label={cat.description}
                                        onClick={() => handleCategoryToggle(cat.id)}
                                        sx={{
                                            bgcolor: selected ? '#3454D1' : '#f5f5f5',
                                            color: selected ? 'white' : '#555',
                                            fontWeight: selected ? 600 : 400,
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: selected ? '#2c43a5' : '#e0e0e0',
                                            },
                                            '& .MuiChip-icon': {
                                                color: selected ? 'white' : cat.color || '#3454D1',
                                                transition: 'color 0.2s ease',
                                            },
                                        }}
                                    />
                                )
                            })}
                        </Box>
                    </Box>

                    {/* Réinitialiser */}
                    <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
                        <Button
                            onClick={handleReset}
                            variant="outlined"
                            startIcon={<MuiIcons.Refresh />}
                            sx={{
                                textTransform: 'none',
                                color: '#666',
                                borderColor: '#ccc',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#f5f5f5',
                                    borderColor: '#999',
                                },
                            }}
                        >
                            Réinitialiser les filtres
                        </Button>
                    </Box>
                </Paper>
            </Slide>
        </>
    )
}
