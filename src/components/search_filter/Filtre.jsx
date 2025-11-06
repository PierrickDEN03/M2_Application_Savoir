import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react'
import { Box, Paper, Typography, TextField, IconButton, Slider, Chip, Button, Slide, Collapse } from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { fr } from 'date-fns/locale'
import { isSameDay } from 'date-fns'
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
    const { currentUser } = useContext(UserContext)

    const [showCalendar, setShowCalendar] = useState(false)

    const [filters, setFilters] = useState({
        location: '',
        distance: null,
        categories: [],
        date: 'Toutes dates',
        searchQuery: '',
        customDates: [],
    })

    const dateOptions = ['Toutes dates', 'Demain', 'Cette semaine', 'Ce weekend', 'Choisir des dates']

    // Charger les catégories et les filtres sauvegardés
    useEffect(() => {
        const loadData = async () => {
            try {
                const cats = await fetchCategoriesFromDB()
                setCategories(cats)

                if (currentUser?.uid) {
                    const savedFilters = await loadUserFilters(currentUser.uid)
                    if (savedFilters) {
                        setFilters(savedFilters)
                        if (savedFilters.date === 'Choisir des dates' && savedFilters.customDates?.length > 0) {
                            setShowCalendar(true)
                        }
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
    const convertDateFilter = useCallback((dateString, customDates) => {
        if (dateString === 'Choisir des dates' && customDates?.length > 0) {
            return {
                startDate: null,
                endDate: null,
                selectedDates: customDates.map((d) => {
                    const date = new Date(d)
                    date.setHours(0, 0, 0, 0)
                    return date.toISOString()
                }),
            }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (dateString) {
            case 'Demain': {
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
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
                const dayOfWeek = today.getDay()
                const saturday = new Date(today)

                if (dayOfWeek === 0) {
                    saturday.setDate(saturday.getDate() + 6)
                } else if (dayOfWeek !== 6) {
                    saturday.setDate(saturday.getDate() + (6 - dayOfWeek))
                }
                saturday.setHours(0, 0, 0, 0)

                const sunday = new Date(saturday)
                sunday.setDate(sunday.getDate() + 1)
                sunday.setHours(23, 59, 59, 999)
                return { startDate: saturday.toISOString(), endDate: sunday.toISOString() }
            }
            default:
                return { startDate: null, endDate: null }
        }
    }, [])

    // Stabiliser onFilterChange avec useRef
    const onFilterChangeRef = useRef(onFilterChange)
    useEffect(() => {
        onFilterChangeRef.current = onFilterChange
    }, [onFilterChange])

    // Mémoriser les customDates stringifiées pour éviter les re-renders inutiles
    const customDatesString = useMemo(() => JSON.stringify(filters.customDates), [filters.customDates])

    // Envoyer les filtres au parent
    useEffect(() => {
        const result = convertDateFilter(filters.date, filters.customDates)
        onFilterChangeRef.current?.({
            location: filters.location || '',
            distance: filters.distance,
            startDate: result.startDate,
            endDate: result.endDate,
            selectedDates: result.selectedDates,
            categories: filters.categories,
            searchQuery: filters.searchQuery || '',
        })
    }, [filters.location, filters.distance, filters.date, filters.categories, filters.searchQuery, customDatesString, convertDateFilter])

    // Sauvegarder les filtres
    useEffect(() => {
        if (currentUser?.uid && !loading) {
            const timeoutId = setTimeout(() => {
                saveUserFilters(currentUser.uid, filters)
            }, 500)

            return () => clearTimeout(timeoutId)
        }
    }, [filters, currentUser?.uid, loading])

    // Handlers mémorisés
    const handleSearchChange = useCallback((e) => {
        setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
    }, [])

    const handleDistanceChange = useCallback((e, val) => {
        setFilters((prev) => ({ ...prev, distance: val }))
    }, [])

    const handleDateChange = useCallback((dateOption) => {
        if (dateOption === 'Choisir des dates') {
            setShowCalendar((prev) => !prev)
            setFilters((prev) => ({ ...prev, date: dateOption }))
        } else {
            setShowCalendar(false)
            setFilters((prev) => ({
                ...prev,
                date: dateOption,
                customDates: [],
            }))
        }
    }, [])

    const handleCalendarDateChange = useCallback((newDate) => {
        if (newDate) {
            const selectedDate = new Date(newDate)
            selectedDate.setHours(0, 0, 0, 0)
            const dateString = selectedDate.toISOString()

            setFilters((prev) => {
                const currentDates = prev.customDates || []
                const isAlreadySelected = currentDates.some((d) => isSameDay(new Date(d), selectedDate))

                if (isAlreadySelected) {
                    return {
                        ...prev,
                        date: 'Choisir des dates',
                        customDates: currentDates.filter((d) => !isSameDay(new Date(d), selectedDate)),
                    }
                } else {
                    return {
                        ...prev,
                        date: 'Choisir des dates',
                        customDates: [...currentDates, dateString],
                    }
                }
            })
        }
    }, [])

    const handleCategoryToggle = useCallback((id) => {
        setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(id) ? prev.categories.filter((c) => c !== id) : [...prev.categories, id],
        }))
    }, [])

    const handleReset = useCallback(() => {
        setFilters({
            location: '',
            distance: null,
            categories: [],
            date: 'Toutes dates',
            searchQuery: '',
            customDates: [],
        })
        setShowCalendar(false)
    }, [])

    const toggleOpen = useCallback(() => setOpen((prev) => !prev), [])
    const closePanel = useCallback(() => setOpen(false), [])

    const getIconComponent = useCallback((name) => MuiIcons[name] || MuiIcons.Interests, [])

    const getCustomDateLabel = useCallback(() => {
        if (filters.date === 'Choisir des dates' && filters.customDates?.length > 0) {
            const count = filters.customDates.length
            return `${count} date${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`
        }
        return 'Choisir des dates'
    }, [filters.date, filters.customDates])

    const CustomDay = useCallback(
        (props) => {
            const { day, ...other } = props
            const isSelected = filters.customDates?.some((d) => isSameDay(new Date(d), day))

            return (
                <PickersDay
                    {...other}
                    day={day}
                    sx={{
                        ...(isSelected && {
                            bgcolor: '#3454D1 !important',
                            color: 'white !important',
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: '#2c43a5 !important',
                            },
                            '&::after': {
                                content: '"✓"',
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: '10px',
                            },
                        }),
                    }}
                />
            )
        },
        [filters.customDates]
    )

    return (
        <>
            {/* SearchBar */}
            <Box
                sx={{
                    position: viewMode === 'list' ? 'sticky' : 'fixed',
                    top: viewMode === 'list' ? 0 : 20,
                    left: viewMode === 'list' ? 'auto' : 20,
                    right: viewMode === 'map' ? 96 : 'auto', // laisse la place au bouton de 56px + marges
                    zIndex: 2000,
                    bgcolor: viewMode === 'list' ? '#E4EFF6' : 'white',
                    borderRadius: viewMode === 'list' ? 0 : '50px',
                    boxShadow: viewMode === 'list' ? 0 : 4,
                    p: viewMode === 'list' ? 2 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: viewMode === 'map' ? 'calc(100vw - 96px)' : '100%',
                }}
            >
                <TextField
                    size="small"
                    placeholder="Rechercher une activité..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        [viewMode === 'list' ? 'endAdornment' : 'startAdornment']: <MuiIcons.Search sx={{ mr: 1, color: '#999' }} />,
                    }}
                    sx={{
                        width: 'auto',
                        minWidth: '0',
                        flex: viewMode === 'list' ? 1 : 'none',
                        bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                        borderRadius: viewMode === 'list' ? '50px' : 0,
                        fontFamily: '"Nunito", sans-serif',
                        '& .MuiOutlinedInput-root': {
                            fieldset: { border: 'none' },
                        },
                    }}
                />
                {viewMode === 'list' && (
                    <Box
                        onClick={toggleOpen}
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
                )}
            </Box>

            {/* FilterButton */}
            {viewMode === 'map' && (
                <Box
                    onClick={toggleOpen}
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
            )}

            {/* Catégories horizontales */}
            {viewMode === 'map' && (
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
                        '&::-webkit-scrollbar': { display: 'none' },
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
                                        bgcolor: selected ? '#FFD166' : '#ffffff',
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
            )}

            {/* FilterPanel */}
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: '100vw',
                        height: '100vh',
                        borderRadius: 0,
                        p: 3,
                        zIndex: 1000000000000000,
                        overflowY: 'auto',
                        boxSizing: 'border-box',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                fontSize: 20,
                                fontFamily: '"All Round Gothic Semi", sans-serif',
                                color: '#3454D1',
                            }}
                        >
                            Filtres
                        </Typography>
                        <IconButton onClick={closePanel}>
                            <MuiIcons.Close />
                        </IconButton>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#f45b69',
                                mb: 1,
                                fontFamily: '"All Round Gothic Semi", sans-serif',
                            }}
                        >
                            Localisation
                        </Typography>
                        <CityAutocomplete
                            value={filters.location}
                            onCitySelected={(cityData) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    location: cityData.city || cityData.full || cityData || '',
                                }))
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': { borderColor: '#3454D1' },
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#f45b69',
                                mb: 1,
                                fontFamily: '"All Round Gothic Semi", sans-serif',
                            }}
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
                                    '& .MuiSlider-markLabel': { fontSize: 12 },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#f45b69',
                                mb: 1,
                                fontFamily: '"All Round Gothic Semi", sans-serif',
                            }}
                        >
                            Date
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {dateOptions.map((opt) => {
                                const isSelected = filters.date === opt
                                const displayLabel = opt === 'Choisir des dates' ? getCustomDateLabel() : opt

                                return (
                                    <Button
                                        key={opt}
                                        variant={isSelected ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => handleDateChange(opt)}
                                        startIcon={opt === 'Choisir des dates' ? <MuiIcons.CalendarMonth /> : null}
                                        sx={{
                                            borderRadius: '20px',
                                            textTransform: 'none',
                                            bgcolor: isSelected ? '#3454D1' : 'white',
                                            color: isSelected ? 'white' : '#3454D1',
                                            borderColor: '#3454D1',
                                            fontWeight: isSelected ? 600 : 400,
                                            fontFamily: '"Nunito", sans-serif',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: isSelected ? '#2c43a5' : '#f0f2ff',
                                            },
                                        }}
                                    >
                                        {displayLabel}
                                    </Button>
                                )
                            })}
                        </Box>

                        <Collapse in={showCalendar}>
                            <Box
                                sx={{
                                    mt: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: '#f9f9f9',
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                {filters.customDates?.length > 0 && (
                                    <Box sx={{ mb: 2, width: '100%' }}>
                                        <Typography
                                            sx={{
                                                fontSize: 14,
                                                color: '#666',
                                                mb: 1,
                                                fontFamily: '"Nunito", sans-serif',
                                            }}
                                        >
                                            Dates sélectionnées :
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {filters.customDates
                                                .map((dateStr) => new Date(dateStr))
                                                .sort((a, b) => a - b)
                                                .map((date, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={date.toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                        onDelete={() => handleCalendarDateChange(date)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#3454D1',
                                                            color: 'white',
                                                            fontFamily: '"Nunito", sans-serif',
                                                            '& .MuiChip-deleteIcon': {
                                                                color: 'white',
                                                                '&:hover': {
                                                                    color: '#f45b69',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                ))}
                                        </Box>
                                    </Box>
                                )}

                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                    <DateCalendar
                                        onChange={handleCalendarDateChange}
                                        slots={{
                                            day: CustomDay,
                                        }}
                                        sx={{
                                            '& .MuiPickersDay-root': {
                                                fontFamily: '"Nunito", sans-serif',
                                            },
                                            '& .MuiPickersCalendarHeader-label': {
                                                fontFamily: '"All Round Gothic Semi", sans-serif',
                                            },
                                            '& .MuiDayCalendar-weekDayLabel': {
                                                fontFamily: '"Nunito", sans-serif',
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Collapse>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#f45b69',
                                mb: 1,
                                fontFamily: '"All Round Gothic Semi", sans-serif',
                            }}
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
