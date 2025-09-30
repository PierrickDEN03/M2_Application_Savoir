// FILE: src/pages/Private/CreateActivityForm.jsx
import React, { useState, useContext, useEffect } from 'react'
import { Container, TextField, Button, Box, Typography, Slider, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PhotoCamera } from '@mui/icons-material'
import frLocale from 'date-fns/locale/fr'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../../firebase-config'
import useLoadGooglePlaces from '../../../components/google_api/useLoadGooglePlaces'
import AddressAutocomplete from '../../../components/google_api/AddressAutocomplete'
import { UserContext } from '../../../context/userContext'
import { createActivity } from '../../../services/activitiesService'
import { getUserInterests } from '../../../services/categoriesService'
import * as MuiIcons from '@mui/icons-material'

export default function CreateActivityForm() {
    const loaded = useLoadGooglePlaces()
    const { currentUser } = useContext(UserContext)

    const [formData, setFormData] = useState({
        title: '',
        date: new Date(),
        address: { street: '', city: '', postalCode: '', full: '', placeId: '' },
        photos: null,
        participants: 1,
        description: '',
    })

    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [submitting, setSubmitting] = useState(false)

    // Charger les intérêts utilisateur (catégories complètes)
    useEffect(() => {
        async function fetchCategories() {
            if (!currentUser) return
            try {
                const cats = await getUserInterests(currentUser.uid)
                setCategories(cats)
            } catch (err) {
                console.error('Erreur chargement catégories utilisateur', err)
            }
        }
        fetchCategories()
    }, [currentUser])

    const handleSelectCategory = (id) => {
        setSelectedCategory(id)
        setErrors((prev) => ({ ...prev, category: undefined }))
    }

    const handleChange = (field) => (e) => {
        setFormData((s) => ({ ...s, [field]: e.target.value }))
        setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    const handleAddressSelected = (addrObj) => {
        setFormData((s) => ({ ...s, address: addrObj }))
        setErrors((prev) => ({ ...prev, address: undefined }))
    }

    const handlePhotoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((s) => ({ ...s, photos: e.target.files[0] }))
            setErrors((prev) => ({ ...prev, photos: undefined }))
        }
    }

    const validateFields = () => {
        const newErrors = {}
        if (!selectedCategory) newErrors.category = 'Veuillez choisir une catégorie'
        if (!formData.title?.trim()) newErrors.title = 'Titre requis'
        if (!formData.date || isNaN(new Date(formData.date).getTime())) newErrors.date = 'Date invalide'
        if (!formData.address?.placeId) {
            newErrors.address = 'Veuillez sélectionner une adresse valide dans la liste.'
        } else {
            if (!formData.address.street?.trim()) newErrors.address = 'Rue manquante dans l’adresse'
            if (!formData.address.city?.trim()) newErrors.address = 'Ville manquante dans l’adresse'
            if (!formData.address.postalCode?.trim()) newErrors.address = 'Code postal manquant'
        }
        if (!formData.participants || formData.participants < 1) newErrors.participants = 'Nombre de participants invalide'
        if (!formData.description?.trim() || formData.description.trim().length < 20) {
            newErrors.description = 'La description doit contenir au moins 20 caractères'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const fetchPlaceDetails = (placeId) => {
        return new Promise((resolve, reject) => {
            if (!loaded || !window.google) {
                reject(new Error('Le service Google Maps n’est pas encore chargé.'))
                return
            }
            const service = new window.google.maps.places.PlacesService(document.createElement('div'))
            service.getDetails({ placeId, fields: ['address_components', 'formatted_address', 'place_id'] }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    const components = place.address_components || []
                    const street = components.find((c) => c.types.includes('route'))?.long_name || ''
                    const streetNumber = components.find((c) => c.types.includes('street_number'))?.long_name || ''
                    const city = components.find((c) => c.types.includes('locality'))?.long_name || ''
                    const postalCode = components.find((c) => c.types.includes('postal_code'))?.long_name || ''
                    resolve({
                        street: streetNumber ? `${streetNumber} ${street}` : street,
                        city,
                        postalCode,
                        full: place.formatted_address,
                        placeId: place.place_id,
                    })
                } else {
                    reject(new Error('Adresse introuvable via Google Places.'))
                }
            })
        })
    }

    const handleSubmit = async () => {
        setStatus({ open: false, severity: 'info', message: '' })

        if (!currentUser) {
            setStatus({ open: true, severity: 'error', message: 'Vous devez être connecté pour créer une activité.' })
            return
        }

        if (!validateFields()) {
            setStatus({ open: true, severity: 'error', message: 'Corrige les champs indiqués pour continuer.' })
            return
        }

        setSubmitting(true)
        try {
            let place
            try {
                place = await fetchPlaceDetails(formData.address.placeId)
            } catch (err) {
                setErrors((prev) => ({ ...prev, address: err.message }))
                setStatus({ open: true, severity: 'error', message: err.message })
                setSubmitting(false)
                return
            }

            let photoUrl = null
            if (formData.photos) {
                const storageRef = ref(storage, `activities/${currentUser.uid}/${Date.now()}_${formData.photos.name}`)
                await uploadBytes(storageRef, formData.photos)
                photoUrl = await getDownloadURL(storageRef)
            }

            const payload = {
                title: formData.title.trim(),
                date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
                address: place,
                participants: formData.participants,
                description: formData.description.trim(),
                photoUrl: photoUrl || null,
                placeId: place.placeId,
                createdAt: new Date().toISOString(),
                userId: currentUser.uid,
                categoryId: selectedCategory,
            }

            const activityId = await createActivity(currentUser.uid, payload)
            setStatus({ open: true, severity: 'success', message: `Activité créée (id: ${activityId})` })

            setFormData({
                title: '',
                date: new Date(),
                address: { street: '', city: '', postalCode: '', full: '', placeId: '' },
                photos: null,
                participants: 1,
                description: '',
            })
            setSelectedCategory(null)
            setErrors({})
        } catch (err) {
            console.error(err)
            setStatus({ open: true, severity: 'error', message: err.message || 'Erreur lors de la création.' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#ED6A5A', py: 2 }}>
            <Container maxWidth="sm" sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pt: 2 }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.3rem' }}>
                        Ajouter une activité
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Catégorie */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1, fontSize: '0.95rem', fontWeight: 500 }}>Choisis une catégorie</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categories.map((cat) => {
                                const IconComponent = MuiIcons[cat.iconName] || null
                                const isSelected = selectedCategory === cat.id
                                return (
                                    <Button
                                        key={cat.id}
                                        onClick={() => handleSelectCategory(cat.id)}
                                        sx={{
                                            minWidth: '110px',
                                            height: '50px',
                                            bgcolor: isSelected ? '#ED6A5A' : 'white',
                                            color: isSelected ? 'white' : '#333',
                                            borderRadius: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            textTransform: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            border: isSelected ? '2px solid #ED6A5A' : '2px solid transparent',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                bgcolor: isSelected ? '#d45a4a' : '#f5f5f5',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            },
                                        }}
                                    >
                                        {IconComponent && <IconComponent sx={{ fontSize: 20, color: isSelected ? 'white' : cat.color }} />}
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: '500' }}>{cat.description}</Typography>
                                    </Button>
                                )
                            })}
                        </Box>
                        {errors.category && (
                            <Typography sx={{ color: 'error.main', fontSize: '0.85rem', mt: 1 }}>{errors.category}</Typography>
                        )}
                    </Box>

                    {/* Titre */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                            Quelle activité proposes-tu ?
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Apprendre la salsa"
                            value={formData.title}
                            onChange={handleChange('title')}
                            error={!!errors.title}
                            helperText={errors.title}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: '12px',
                                '& .MuiOutlinedInput-root': { borderRadius: '12px', border: 'none', '& fieldset': { border: 'none' } },
                                '& input': { py: 1.5, fontSize: '0.9rem' },
                            }}
                        />
                    </Box>

                    {/* Date */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                            Quand es-tu disponible ?
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                            <DateTimePicker
                                value={formData.date}
                                onChange={(newValue) => {
                                    setFormData((s) => ({ ...s, date: newValue }))
                                    setErrors((p) => ({ ...p, date: undefined }))
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        fullWidth
                                        {...params}
                                        placeholder="Demain à 15h30"
                                        error={!!errors.date}
                                        helperText={errors.date}
                                        sx={{
                                            bgcolor: 'white',
                                            borderRadius: '12px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                border: 'none',
                                                '& fieldset': { border: 'none' },
                                            },
                                            '& input': { py: 1.5, fontSize: '0.9rem' },
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Adresse */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1 }}>Où souhaites-tu rejoindre les participants ?</Typography>
                        {loaded ? (
                            <AddressAutocomplete
                                value={formData.address.street ? `${formData.address.street}, ${formData.address.city}` : ''}
                                onAddressSelected={handleAddressSelected}
                                error={!!errors.address}
                                helperText={errors.address}
                            />
                        ) : (
                            <TextField fullWidth disabled placeholder="Chargement de Google Maps..." />
                        )}
                    </Box>

                    {/* Upload photo */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                            As-tu des photos à ajouter ?
                        </Typography>
                        <Box sx={{ bgcolor: 'white', borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton component="label" sx={{ bgcolor: '#F0E7D6', borderRadius: '8px', p: 1 }}>
                                <PhotoCamera sx={{ color: '#ED6A5A' }} />
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                            </IconButton>
                            <Typography sx={{ fontSize: '0.9rem', color: '#666', flex: 1 }}>
                                {formData.photos ? formData.photos.name : 'Aucune photo sélectionnée'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Participants */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                            Combien de personnes peuvent participer ?
                        </Typography>
                        <Box sx={{ bgcolor: 'white', borderRadius: '12px', p: 2 }}>
                            <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ED6A5A', mb: 1 }}>
                                {formData.participants}
                            </Typography>
                            <Slider
                                value={formData.participants}
                                min={1}
                                max={20}
                                step={1}
                                onChange={(e, val) => {
                                    setFormData((s) => ({ ...s, participants: val }))
                                    setErrors((p) => ({ ...p, participants: undefined }))
                                }}
                                sx={{
                                    color: '#ED6A5A',
                                    '& .MuiSlider-thumb': { bgcolor: '#ED6A5A' },
                                    '& .MuiSlider-track': { bgcolor: '#ED6A5A' },
                                    '& .MuiSlider-rail': { bgcolor: '#F0E7D6' },
                                }}
                            />
                            {errors.participants && (
                                <Typography sx={{ color: 'error.main', fontSize: '0.85rem', mt: 1 }}>{errors.participants}</Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Description */}
                    <Box>
                        <Typography sx={{ color: 'white', mb: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                            Décris ton activité en quelques mots
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Je suis passionnée de salsa depuis toujours !"
                            value={formData.description}
                            onChange={(e) => {
                                setFormData((s) => ({ ...s, description: e.target.value }))
                                setErrors((p) => ({ ...p, description: undefined }))
                            }}
                            error={!!errors.description}
                            helperText={errors.description || 'Minimum 20 caractères'}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: '12px',
                                '& .MuiOutlinedInput-root': { borderRadius: '12px', border: 'none', '& fieldset': { border: 'none' } },
                                '& textarea': { fontSize: '0.9rem' },
                            }}
                        />
                    </Box>

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{
                            bgcolor: '#B2DDF7',
                            color: '#3454D1',
                            borderRadius: '25px',
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            mt: 2,
                            mb: 8,
                            '&:hover': { bgcolor: '#9AC9E3' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Valider'}
                    </Button>
                </Box>
            </Container>

            <Snackbar open={status.open} autoHideDuration={5000} onClose={() => setStatus((s) => ({ ...s, open: false }))}>
                <Alert severity={status.severity} sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
