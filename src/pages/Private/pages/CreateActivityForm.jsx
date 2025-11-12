import React, { useState, useContext, useEffect } from 'react'
import { Box, Container, Typography, TextField, Button, MenuItem, Slider, Snackbar, Alert, CircularProgress } from '@mui/material'
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import frLocale from 'date-fns/locale/fr'
import * as MuiIcons from '@mui/icons-material'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../../firebase-config'
import { UserContext } from '../../../context/userContext'
import { createActivity, fetchActivityById, updateActivity } from '../../../services/activitiesService'
import { fetchCategoriesFromDB } from '../../../services/categoriesService'
import AddressAutocomplete from '../../../components/google_api/AddressAutocomplete'
import useLoadGooglePlaces from '../../../components/google_api/useLoadGooglePlaces'
import { useNavigate, useParams } from 'react-router-dom'

export default function CreateActivityForm() {
    const loaded = useLoadGooglePlaces()
    const { currentUser } = useContext(UserContext)
    const navigate = useNavigate()
    const { activityId } = useParams()
    const isEditMode = Boolean(activityId)
    const [isLoadingActivity, setIsLoadingActivity] = useState(isEditMode)

    const [step, setStep] = useState(1)
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [categoriesLoaded, setCategoriesLoaded] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        date: new Date(new Date().setDate(new Date().getDate() + 1)), // Demain
        time: new Date(new Date().setHours(14, 0, 0, 0)), // 14h00
        address: { street: '', city: '', postalCode: '', full: '', placeId: '' },
        participants: 4,
        duration: 1,
        description: '',
        photoFile: null,
        photoUrl: null,
    })

    const [previewUrl, setPreviewUrl] = useState(null)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [submitting, setSubmitting] = useState(false)

    // Load categories
    useEffect(() => {
        if (!currentUser) return
        fetchCategoriesFromDB()
            .then((cats) => {
                setCategories(cats || [])
                setCategoriesLoaded(true)
            })
            .catch((err) => {
                console.error('Erreur chargement catégories utilisateur', err)
                setCategoriesLoaded(true)
            })
    }, [currentUser])

    // Load activity data if edit mode
    useEffect(() => {
        if (!isEditMode || !currentUser || !categoriesLoaded) return
        const loadActivity = async () => {
            setIsLoadingActivity(true)
            try {
                const activity = await fetchActivityById(activityId)
                if (!activity) return

                const date = activity.date ? new Date(activity.date) : new Date()
                const time = date

                setFormData({
                    title: activity.title || '',
                    date,
                    time,
                    address: activity.address || { street: '', city: '', postalCode: '', full: '', placeId: '' },
                    participants: activity.participants || 4,
                    duration: activity.duration || 1,
                    description: activity.description || '',
                    photoFile: null,
                    photoUrl: activity.photoUrl || null,
                })

                const cat = categories.find((c) => c.id === activity.categoryId)
                setSelectedCategory(cat || null)

                if (activity.photoUrl) setPreviewUrl(activity.photoUrl)
            } catch (err) {
                console.error(err)
                setStatus({ open: true, severity: 'error', message: "Erreur lors du chargement de l'activité." })
            } finally {
                setIsLoadingActivity(false)
            }
        }
        loadActivity()
    }, [activityId, isEditMode, currentUser, categories, categoriesLoaded])

    // Photo preview logic - VERSION STABILISÉE
    useEffect(() => {
        if (isEditMode && isLoadingActivity) return

        if (formData.photoFile) {
            const url = URL.createObjectURL(formData.photoFile)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else if (formData.photoUrl && !previewUrl) {
            setPreviewUrl(formData.photoUrl)
        } else if (!formData.photoFile && !formData.photoUrl && previewUrl) {
            setPreviewUrl(null)
        }
    }, [formData.photoFile, formData.photoUrl, isEditMode, isLoadingActivity])

    useEffect(() => {
        if (categoriesLoaded && categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0])
        }
    }, [categoriesLoaded, categories])

    const handleChangeField = (field) => (e) => {
        setFormData((s) => ({ ...s, [field]: e.target.value }))
        setErrors((p) => ({ ...p, [field]: undefined }))
    }

    const handleDateChange = (value) => {
        setFormData((s) => ({ ...s, date: value }))
        setErrors((p) => ({ ...p, date: undefined }))
    }

    const handleTimeChange = (value) => {
        setFormData((s) => ({ ...s, time: value }))
        setErrors((p) => ({ ...p, time: undefined }))
    }

    const handleAddressSelected = (addrObj) => {
        setFormData((s) => ({ ...s, address: addrObj }))
        setErrors((p) => ({ ...p, address: undefined }))
    }

    const handleCategorySelect = (catId) => {
        const cat = categories.find((c) => c.id === catId)
        setSelectedCategory(cat || null)
        setErrors((p) => ({ ...p, category: undefined }))
    }

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0] ?? null
        if (file) {
            if (!file.type.startsWith('image/')) {
                setStatus({ open: true, severity: 'error', message: 'Format de fichier non supporté.' })
                return
            }
            setFormData((s) => ({ ...s, photoFile: file }))
            setErrors((p) => ({ ...p, photoFile: undefined }))
        }
    }

    const validateStep = (s = step) => {
        const newErrors = {}
        if (s === 1) {
            if (!formData.title?.trim()) newErrors.title = 'Titre requis'
            if (!selectedCategory) newErrors.category = 'Choisir une catégorie'
            if (!formData.date || isNaN(new Date(formData.date).getTime())) newErrors.date = 'Date invalide'
            if (!formData.time || isNaN(new Date(formData.time).getTime())) newErrors.time = 'Heure invalide'
            if (!formData.address?.placeId) newErrors.address = 'Sélectionner une adresse valide'
        } else {
            if (!formData.description?.trim() || formData.description.trim().length < 10)
                newErrors.description = 'Description trop courte (min 10 caractères)'
            if (!formData.participants || formData.participants < 1) newErrors.participants = 'Nombre invalide'
            if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Durée invalide'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const formatDuration = (val) => {
        const hours = Math.floor(val)
        const minutes = val % 1 === 0 ? 0 : Math.round((val % 1) * 60)
        return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    }

    const handleFinalSubmit = async () => {
        if (!validateStep(2)) {
            setStatus({ open: true, severity: 'error', message: 'Corrige les champs.' })
            return
        }
        if (!currentUser) {
            setStatus({ open: true, severity: 'error', message: 'Vous devez être connecté.' })
            return
        }

        setSubmitting(true)
        try {
            let photoUrl = formData.photoUrl || null
            if (formData.photoFile) {
                const storageRef = ref(storage, `activities/${currentUser.uid}/${Date.now()}_${formData.photoFile.name}`)
                await uploadBytes(storageRef, formData.photoFile)
                photoUrl = await getDownloadURL(storageRef)
            }

            const combinedDate = new Date(formData.date)
            combinedDate.setHours(formData.time.getHours())
            combinedDate.setMinutes(formData.time.getMinutes())

            const payload = {
                title: formData.title.trim(),
                categoryId: selectedCategory?.id || null,
                date: combinedDate.toISOString(),
                address: formData.address,
                participants: formData.participants,
                duration: formData.duration,
                description: formData.description.trim(),
                photoUrl,
                placeId: formData.address.placeId || null,
                userId: currentUser.uid,
            }

            if (isEditMode) {
                await updateActivity(activityId, payload)
                setStatus({ open: true, severity: 'success', message: 'Activité mise à jour !' })
                setTimeout(() => navigate(-1), 1500)
            } else {
                await createActivity(currentUser.uid, payload)
                setStatus({ open: true, severity: 'success', message: 'Activité créée !' })
                setTimeout(() => navigate(-1), 1500)
            }
        } catch (err) {
            console.error(err)
            setStatus({ open: true, severity: 'error', message: err.message || 'Erreur lors de la sauvegarde.' })
            setSubmitting(false)
        }
    }

    // VERSION SIMPLIFIÉE ET STABLE DU RENDU DE PREVIEW
    const renderPhotoPreview = () => {
        if (isEditMode && (isLoadingActivity || !categoriesLoaded)) {
            return (
                <Box
                    sx={{
                        width: '100%',
                        height: 160,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#E5E7EB',
                    }}
                >
                    <CircularProgress sx={{ color: '#3454D1' }} />
                </Box>
            )
        }

        const hasPhoto = !!previewUrl
        const showCategory = !hasPhoto && selectedCategory && !formData.photoFile

        return (
            <Box sx={{ position: 'relative' }}>
                {hasPhoto ? (
                    <Box
                        component="img"
                        src={previewUrl}
                        alt="Aperçu photo"
                        sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 3 }}
                    />
                ) : showCategory ? (
                    <Box
                        sx={{
                            width: '100%',
                            height: 160,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: selectedCategory?.color || '#D1388B',
                        }}
                    >
                        {React.createElement(MuiIcons[selectedCategory?.iconName] || MuiIcons.MusicNote, {
                            sx: { fontSize: 64, color: 'white' },
                        })}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            height: 160,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#E5E7EB',
                        }}
                    >
                        <MuiIcons.Image sx={{ fontSize: 56, color: '#9CA3AF' }} />
                    </Box>
                )}

                <Box
                    sx={{
                        position: 'absolute',
                        right: 12,
                        bottom: 12,
                        bgcolor: 'white',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                    }}
                >
                    <MuiIcons.Edit sx={{ fontSize: 18, color: '#3454D1' }} />
                </Box>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#D6E9F8', py: 3 }}>
            <Container maxWidth="sm" sx={{ px: 2 }}>
                <Box sx={{ mb: 3 }}>
                    {step === 1 ? (
                        <>
                            <Button
                                onClick={() => navigate(-1)}
                                sx={{
                                    textTransform: 'none',
                                    color: '#3454D1',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    fontFamily: '"All Round Gothic Semi", sans-serif',
                                    mb: 0.5,
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: 'transparent' },
                                }}
                            >
                                Back
                            </Button>
                            <Typography
                                sx={{ color: '#3454D1', fontSize: 28, fontWeight: 700, fontFamily: '"All Round Gothic Semi", sans-serif' }}
                            >
                                Ton activité
                            </Typography>
                        </>
                    ) : (
                        <Button
                            onClick={() => setStep(1)}
                            sx={{
                                textTransform: 'none',
                                color: '#3454D1',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                fontFamily: '"Nunito", sans-serif',
                                p: 0,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: 'transparent' },
                            }}
                        >
                            ← Retour
                        </Button>
                    )}
                </Box>

                {/* SUPPRESSION DE LA KEY PROBLÉMATIQUE */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {step === 1 && (
                        <>
                            <Box sx={{ position: 'relative' }}>
                                <Box sx={{ cursor: 'pointer' }} onClick={() => document.getElementById('photo-upload')?.click()}>
                                    {renderPhotoPreview()}
                                </Box>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoUpload}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Quelle activité proposes-tu ?
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Concert du Nouvel An"
                                    value={formData.title}
                                    onChange={handleChangeField('title')}
                                    error={!!errors.title}
                                    helperText={errors.title}
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        fontFamily: '"Nunito", sans-serif',
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Catégorie
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={selectedCategory?.id ?? ''}
                                    onChange={(e) => handleCategorySelect(e.target.value)}
                                    error={!!errors.category}
                                    helperText={errors.category}
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {React.createElement(MuiIcons[cat.iconName] || MuiIcons.MusicNote, {
                                                    sx: { color: cat.color || '#3454D1', fontSize: 20 },
                                                })}
                                                {cat.description}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Lieu
                                </Typography>
                                {loaded ? (
                                    <AddressAutocomplete
                                        value={formData.address.full || ''}
                                        onAddressSelected={handleAddressSelected}
                                        error={!!errors.address}
                                        helperText={errors.address}
                                        filter="Lyon"
                                    />
                                ) : (
                                    <TextField fullWidth disabled placeholder="Chargement..." />
                                )}
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Date
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <DatePicker
                                            value={formData.date}
                                            onChange={handleDateChange}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.date,
                                                    helperText: errors.date,
                                                    sx: {
                                                        bgcolor: 'white',
                                                        borderRadius: 2,
                                                        flex: 1,
                                                        fontFamily: '"Nunito", sans-serif',
                                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                    },
                                                },
                                            }}
                                        />
                                        <TimePicker
                                            value={formData.time}
                                            onChange={handleTimeChange}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.time,
                                                    helperText: errors.time,
                                                    sx: {
                                                        bgcolor: 'white',
                                                        borderRadius: 2,
                                                        flex: 1,
                                                        fontFamily: '"Nunito", sans-serif',
                                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                </LocalizationProvider>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => {
                                    if (validateStep(1)) setStep(2)
                                    else setStatus({ open: true, severity: 'error', message: 'Corrige les champs.' })
                                }}
                                sx={{
                                    bgcolor: '#FF7B6C',
                                    textTransform: 'none',
                                    borderRadius: '28px',
                                    py: 1.8,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    fontFamily: '"Nunito", sans-serif',
                                    boxShadow: '0 4px 12px rgba(255, 123, 108, 0.3)',
                                    '&:hover': { bgcolor: '#FF6B5A', boxShadow: '0 6px 16px rgba(255, 123, 108, 0.4)' },
                                }}
                            >
                                Valider
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1.5,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Nombre de participants
                                </Typography>
                                <Slider
                                    value={formData.participants}
                                    min={1}
                                    max={50}
                                    step={1}
                                    onChange={(e, val) => setFormData((s) => ({ ...s, participants: val }))}
                                    valueLabelDisplay="on"
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            bgcolor: '#3454D1',
                                            width: 20,
                                            height: 20,
                                        },
                                        '& .MuiSlider-track': {
                                            bgcolor: '#3454D1',
                                            height: 6,
                                        },
                                        '& .MuiSlider-rail': {
                                            bgcolor: '#CBD5E1',
                                            height: 6,
                                        },
                                        '& .MuiSlider-valueLabel': {
                                            bgcolor: '#ED6A5A',
                                            color: 'white',
                                            fontWeight: 600,
                                            borderRadius: '8px',
                                        },
                                    }}
                                />
                                {errors.participants && (
                                    <Typography
                                        sx={{ color: 'error.main', fontSize: '0.85rem', mt: 0.5, fontFamily: '"Nunito", sans-serif' }}
                                    >
                                        {errors.participants}
                                    </Typography>
                                )}
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1.5,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Durée de l'activité
                                </Typography>
                                <Slider
                                    value={formData.duration}
                                    min={0.5}
                                    max={8}
                                    step={0.5}
                                    onChange={(e, val) => setFormData((s) => ({ ...s, duration: val }))}
                                    valueLabelDisplay="on"
                                    valueLabelFormat={formatDuration}
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            bgcolor: '#3454D1',
                                            width: 20,
                                            height: 20,
                                        },
                                        '& .MuiSlider-track': {
                                            bgcolor: '#3454D1',
                                            height: 6,
                                        },
                                        '& .MuiSlider-rail': {
                                            bgcolor: '#CBD5E1',
                                            height: 6,
                                        },
                                        '& .MuiSlider-valueLabel': {
                                            bgcolor: '#ED6A5A',
                                            color: 'white',
                                            fontWeight: 600,
                                            borderRadius: '8px',
                                        },
                                    }}
                                />
                                {errors.duration && (
                                    <Typography
                                        sx={{ color: 'error.main', fontSize: '0.85rem', mt: 0.5, fontFamily: '"Nunito", sans-serif' }}
                                    >
                                        {errors.duration}
                                    </Typography>
                                )}
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        color: '#3454D1',
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: '0.95rem',
                                        fontFamily: '"All Round Gothic Semi", sans-serif',
                                    }}
                                >
                                    Ton activité en quelques mots
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    placeholder="Je vous propose d'assister au concert du Nouvel An à l'Opéra de Lyon."
                                    value={formData.description}
                                    onChange={handleChangeField('description')}
                                    error={!!errors.description}
                                    helperText={errors.description}
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        fontFamily: '"Nunito", sans-serif',
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                    }}
                                />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleFinalSubmit}
                                disabled={submitting}
                                sx={{
                                    bgcolor: '#FF7B6C',
                                    textTransform: 'none',
                                    borderRadius: '28px',
                                    py: 1.8,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    fontFamily: '"Nunito", sans-serif',
                                    boxShadow: '0 4px 12px rgba(255, 123, 108, 0.3)',
                                    '&:hover': { bgcolor: '#FF6B5A', boxShadow: '0 6px 16px rgba(255, 123, 108, 0.4)' },
                                }}
                            >
                                {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Valider'}
                            </Button>
                        </>
                    )}
                </Box>

                <Snackbar
                    open={status.open}
                    autoHideDuration={5000}
                    onClose={() => setStatus((s) => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ mb: 15 }}
                >
                    <Alert severity={status.severity} sx={{ width: '100%' }}>
                        {status.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    )
}
