import React, { useState, useContext, useEffect, useMemo } from 'react'
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    MenuItem,
    Slider,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
} from '@mui/material'
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import frLocale from 'date-fns/locale/fr'
import * as MuiIcons from '@mui/icons-material'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../../firebase-config'
import { UserContext } from '../../../context/userContext'
import { createActivity } from '../../../services/activitiesService'
import { getUserInterests } from '../../../services/categoriesService'
import AddressAutocomplete from '../../../components/google_api/AddressAutocomplete'
import useLoadGooglePlaces from '../../../components/google_api/useLoadGooglePlaces'
import { useNavigate } from 'react-router-dom'

export default function CreateActivityForm() {
    const loaded = useLoadGooglePlaces()
    const { currentUser } = useContext(UserContext)
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)

    const [formData, setFormData] = useState({
        title: '',
        date: new Date(),
        time: new Date(),
        address: { street: '', city: '', postalCode: '', full: '', placeId: '' },
        participants: 4,
        duration: 1,
        description: '',
        photoFile: null,
    })

    const [previewUrl, setPreviewUrl] = useState(null)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function fetchCategories() {
            if (!currentUser) return
            try {
                const cats = await getUserInterests(currentUser.uid)
                setCategories(cats || [])
            } catch (err) {
                console.error('Erreur chargement catégories utilisateur', err)
            }
        }
        fetchCategories()
    }, [currentUser])

    useEffect(() => {
        if (!formData.photoFile) {
            setPreviewUrl(null)
        }
    }, [selectedCategory, formData.photoFile])

    useEffect(() => {
        if (!formData.photoFile) return
        const url = URL.createObjectURL(formData.photoFile)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [formData.photoFile])

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
            let photoUrl = null
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
                createdAt: new Date().toISOString(),
                userId: currentUser.uid,
            }

            const activityId = await createActivity(currentUser.uid, payload)
            setStatus({ open: true, severity: 'success', message: 'Activité créée avec succès !' })

            setFormData({
                title: '',
                date: new Date(),
                time: new Date(),
                address: { street: '', city: '', postalCode: '', full: '', placeId: '' },
                participants: 4,
                duration: 1,
                description: '',
                photoFile: null,
            })
            setSelectedCategory(null)
            setPreviewUrl(null)
            setStep(1)
            setErrors({})
        } catch (err) {
            console.error(err)
            setStatus({ open: true, severity: 'error', message: err.message || 'Erreur lors de la création.' })
        } finally {
            setSubmitting(false)
        }
    }

    const shouldRenderCategoryVisual = useMemo(() => {
        return !formData.photoFile && selectedCategory
    }, [formData.photoFile, selectedCategory])

    const renderCategoryVisual = () => {
        const color = selectedCategory?.color || '#D1388B'
        const IconName = selectedCategory?.iconName || 'MusicNote'
        const IconComponent = MuiIcons[IconName] || MuiIcons.MusicNote

        return (
            <Box
                sx={{
                    width: '100%',
                    height: 160,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: color,
                    position: 'relative',
                }}
            >
                <IconComponent sx={{ fontSize: 64, color: 'white' }} />
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
                    <MuiIcons.CheckCircle sx={{ fontSize: 32, color: '#3454D1' }} />
                </Box>
            </Box>
        )
    }

    const renderPhotoPreview = () => {
        if (previewUrl && formData.photoFile) {
            return (
                <Box
                    component="img"
                    src={previewUrl}
                    alt="Aperçu photo"
                    sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 3 }}
                />
            )
        }
        if (shouldRenderCategoryVisual) {
            return renderCategoryVisual()
        }
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
                <MuiIcons.Image sx={{ fontSize: 56, color: '#9CA3AF' }} />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#D6E9F8', py: 3 }}>
            <Container maxWidth="sm" sx={{ px: 2 }}>
                {/* Header */}
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
                                    mb: 0.5,
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: 'transparent' },
                                }}
                            >
                                Back
                            </Button>
                            <Typography sx={{ color: '#3454D1', fontSize: 28, fontWeight: 700 }}>Ton activité</Typography>
                        </>
                    ) : (
                        <Button
                            onClick={() => setStep(1)}
                            sx={{
                                textTransform: 'none',
                                color: '#3454D1',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                p: 0,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: 'transparent' },
                            }}
                        >
                            ← Retour
                        </Button>
                    )}
                </Box>

                {/* Form body */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {step === 1 && (
                        <>
                            {/* Photo preview */}
                            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                                <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                    {renderPhotoPreview()}
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            </Box>

                            {/* Title */}
                            <TextField
                                fullWidth
                                label="Quelle activité proposes-tu ?"
                                placeholder="Concert du Nouvel An"
                                value={formData.title}
                                onChange={handleChangeField('title')}
                                error={!!errors.title}
                                helperText={errors.title}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                }}
                            />

                            {/* Category */}
                            <TextField
                                select
                                fullWidth
                                label="Catégorie"
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

                            {/* Address */}
                            <Box>
                                <Typography sx={{ color: '#3454D1', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>Lieu</Typography>
                                {loaded ? (
                                    <AddressAutocomplete
                                        value={formData.address.full || ''}
                                        onAddressSelected={handleAddressSelected}
                                        error={!!errors.address}
                                        helperText={errors.address}
                                    />
                                ) : (
                                    <TextField fullWidth disabled placeholder="Chargement..." />
                                )}
                            </Box>

                            {/* Date & Time */}
                            <Box>
                                <Typography sx={{ color: '#3454D1', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>Date</Typography>
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
                            {/* Participants */}
                            <Box>
                                <Typography sx={{ color: '#3454D1', fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
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
                                    <Typography sx={{ color: 'error.main', fontSize: '0.85rem', mt: 0.5 }}>
                                        {errors.participants}
                                    </Typography>
                                )}
                            </Box>

                            {/* Duration */}
                            <Box>
                                <Typography sx={{ color: '#3454D1', fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
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
                                    <Typography sx={{ color: 'error.main', fontSize: '0.85rem', mt: 0.5 }}>{errors.duration}</Typography>
                                )}
                            </Box>

                            {/* Description */}
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                label="Ton activité en quelques mots"
                                placeholder="Je vous propose d'assister au concert du Nouvel An à l'Opéra de Lyon. Attention, il est nécessaire de réserver son billet en avance :
https://www.opera-lyon.com/fr/programmation/saison-2024-2025/concert-nouvel-an-2"
                                value={formData.description}
                                onChange={handleChangeField('description')}
                                error={!!errors.description}
                                helperText={errors.description}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                }}
                            />

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
