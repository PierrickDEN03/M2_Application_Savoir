import React, { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { Box, Paper, Typography, TextField, IconButton, Slider, Chip, Button, Slide, Fade } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchCategoriesFromDB } from '../../services/categoriesService'
import { saveUserFilters, loadUserFilters } from '../../services/filtresService'
import CityAutocomplete from '../google_api/CityAutoComplete'
import { UserContext } from '../../context/userContext'

export default function Filtre({ onFilterChange, viewMode = 'map' }) {
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const scrollContainerRef = useRef(null)
    const { currentUser } = useContext(UserContext) // Récupérer l'utilisateur actuel

    const [filters, setFilters] = useState({
        location: '',
        distance: null,
        startDate: null,
        endDate: null,
        categories: [],
        date: 'Toutes dates',
        searchQuery: '',
    })

    // Charger les catégories et les filtres sauvegardés
    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger les catégories
                const cats = await fetchCategoriesFromDB()
                setCategories(cats)

                // Charger les filtres sauvegardés si l'utilisateur est connecté
                if (currentUser?.uid) {
                    const savedFilters = await loadUserFilters(currentUser.uid)
                    if (savedFilters) {
                        setFilters(savedFilters)
                    }
                }
            } catch (error) {
                console.error('Erreur chargement des données:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [currentUser?.uid])

    // Convertir l'option "date" en startDate/endDate
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
                    saturday.setDate(saturday.getDate() + 6)
                } else if (dayOfWeek === 6) {
                    saturday.setHours(0, 0, 0, 0)
                } else {
                    const daysUntilSaturday = 6 - dayOfWeek
                    saturday.setDate(saturday.getDate() + daysUntilSaturday)
                    saturday.setHours(0, 0, 0, 0)
                }

                const sunday = new Date(saturday)
                sunday.setDate(sunday.getDate() + 1)
                sunday.setHours(23, 59, 59, 999)

                return { startDate: saturday.toISOString(), endDate: sunday.toISOString() }
            }
            default:
                return { startDate: null, endDate: null }
        }
    }

    // Envoyer les filtres au parent avec le bon format
    const sendFiltersToParent = useCallback(() => {
        const { startDate, endDate } = convertDateFilter(filters.date)

        onFilterChange?.({
            location: filters.location || '',
            distance: filters.distance,
            startDate,
            endDate,
            categories: filters.categories,
            searchQuery: filters.searchQuery || '',
        })
    }, [onFilterChange, filters])

    // Appeler le parent quand les filtres changent
    useEffect(() => {
        sendFiltersToParent()
    }, [sendFiltersToParent])

    // Sauvegarder les filtres dans Firestore quand ils changent
    useEffect(() => {
        if (currentUser?.uid && !loading) {
            saveUserFilters(currentUser.uid, filters)
        }
    }, [filters, currentUser?.uid, loading])

    const handleSearchChange = (e) => {
        setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
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
            searchQuery: '',
        })
    }

    const getIconComponent = (name) => MuiIcons[name] || MuiIcons.Interests
    const dateOptions = ['Toutes dates', 'Demain', 'Cette semaine', 'Ce weekend']

    // 🔹 LAYOUT POUR VUE LISTE
    if (viewMode === 'list') {
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

                {/* --- BAR RECHERCHE --- */}
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2000,
                        bgcolor: '#E4EFF6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Rechercher une activité..."
                        value={filters.searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: <MuiIcons.Search sx={{ mr: 1, color: '#999' }} />,
                        }}
                        sx={{
                            flex: 1,
                            bgcolor: 'white',
                            fontFamily: '"Nunito", sans-serif',
                            borderRadius: '50px',
                            '& .MuiOutlinedInput-root': {
                                fieldset: {
                                    border: 'none',
                                },
                            },
                        }}
                    />

                    <Box
                        onClick={() => setOpen(!open)}
                        sx={{
                            cursor: 'pointer',
                            p: 1,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'white',
                            boxShadow: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: 4,
                            },
                        }}
                    >
                        <MuiIcons.Tune sx={{ color: '#3454D1', fontSize: 24 }} />
                    </Box>
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
                            <IconButton onClick={() => setOpen(false)}>
                                <MuiIcons.Close />
                            </IconButton>
                        </Box>

                        {/* Localisation */}
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}
                            >
                                Localisation
                            </Typography>
                            <CityAutocomplete
                                value={filters.location}
                                onCitySelected={(cityData) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        location: cityData.city || cityData.full,
                                    }))
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
                            <Typography
                                sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}
                            >
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
                            <Typography
                                sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}
                            >
                                Date
                            </Typography>
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
                                            fontFamily: '"Nunito", sans-serif',
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
                            <Typography
                                sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}
                            >
                                Type d'activité
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Chip
                                    label="Tout"
                                    onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
                                    sx={{
                                        bgcolor: filters.categories.length === 0 ? '#3454D1' : '#f5f5f5',
                                        color: filters.categories.length === 0 ? 'white' : '#555',
                                        fontWeight: filters.categories.length === 0 ? 600 : 400,
                                        fontFamily: '"Nunito", sans-serif',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: filters.categories.length === 0 ? '#2c43a5' : '#e0e0e0',
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
                                                fontFamily: '"Nunito", sans-serif',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: selected ? '#2c43a5' : '#e0e0e0',
                                                },
                                                '& .MuiChip-icon': {
                                                    color: selected ? 'white' : cat.color || '#3454D1',
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
                                    fontFamily: '"Nunito", sans-serif',
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

    // 🔹 LAYOUT POUR VUE CARTE
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

            {/* --- BAR RECHERCHE --- */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    zIndex: 2000,
                    bgcolor: 'white',
                    borderRadius: '50px',
                    boxShadow: 4,
                    p: 1,
                }}
            >
                <TextField
                    size="small"
                    placeholder="Rechercher une activité..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: <MuiIcons.Search sx={{ mr: 1, color: '#999' }} />,
                    }}
                    sx={{
                        width: 300,
                        fontFamily: '"Nunito", sans-serif',
                        '& .MuiOutlinedInput-root': {
                            fieldset: {
                                border: 'none',
                            },
                        },
                    }}
                />
            </Box>

            {/* --- BOUTON FILTRES --- */}
            <Box
                onClick={() => setOpen(!open)}
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
            >
                <MuiIcons.Tune sx={{ color: '#3454D1', fontSize: 30 }} />
            </Box>

            {/* --- CATÉGORIES RAPIDES (Horizontales) - UNIQUEMENT EN MODE CARTE --- */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 90,
                    left: 0,
                    right: 0,
                    zIndex: 1999,
                    bgcolor: 'transparent',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
                ref={scrollContainerRef}
            >
                <Box sx={{ display: 'flex', gap: 1.5, px: 2, pb: 1 }}>
                    <Chip
                        label="Tout"
                        onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
                        sx={{
                            bgcolor: filters.categories.length === 0 ? '#FFD166' : '#f5f5f5',
                            color: '#555',
                            fontFamily: '"Nunito", sans-serif',
                            fontWeight: filters.categories.length === 0 ? 600 : 400,
                            flexShrink: 0,
                            p: 1,
                            fontSize: 16,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: filters.categories.length === 0 ? '#2c43a5' : '#ffffff',
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
                                    bgcolor: selected ? '#FFD166' || '#3454D1' : '#ffffff',
                                    color: '#555',
                                    fontFamily: '"Nunito", sans-serif',
                                    fontWeight: selected ? 600 : 400,
                                    flexShrink: 0,
                                    fontSize: 16,
                                    p: 1,
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: selected ? cat.color || '#2c43a5' : '#e0e0e0',
                                    },
                                    '& .MuiChip-icon': {
                                        color: selected ? 'white' : cat.color || '#3454D1',
                                    },
                                }}
                            />
                        )
                    })}
                </Box>
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
                            alignItems: 'right',
                            mb: 3,
                        }}
                    >
                        <IconButton onClick={() => setOpen(false)}>
                            <MuiIcons.Close />
                        </IconButton>
                    </Box>

                    {/* Localisation */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}>
                            Localisation
                        </Typography>

                        <CityAutocomplete
                            value={filters.location}
                            onCitySelected={(city) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    location: city || '',
                                }))
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
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}>
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
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiSlider-markLabel': {
                                        fontSize: 12,
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Date */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}>
                            Date
                        </Typography>
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
                        <Typography sx={{ fontWeight: 600, color: '#f45b69', mb: 1, fontFamily: '"All Round Gothic Semi", sans-serif' }}>
                            Type d'activité
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                                            fontFamily: '"Nunito", sans-serif',
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
                                fontFamily: '"Nunito", sans-serif',
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
