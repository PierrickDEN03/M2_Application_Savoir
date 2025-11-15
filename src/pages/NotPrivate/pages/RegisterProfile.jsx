// FILE: src/pages/RegisterProfile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert, Avatar, IconButton, InputAdornment } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import frLocale from 'date-fns/locale/fr'
import {
    PhotoCamera,
    Person,
    PersonOutline,
    MailOutline,
    Home,
    LocationCity,
    PinDrop,
    Phone,
    Close,
    CalendarToday,
} from '@mui/icons-material'
import { auth } from '../../../firebase-config'
import { createProfile, getProfile } from '../../../services/userService'
import useLoadGooglePlaces from '../../../components/google_api/useLoadGooglePlaces'
import AddressAutocomplete from '../../../components/google_api/AddressAutocomplete'

export default function RegisterProfile() {
    const navigate = useNavigate()
    useLoadGooglePlaces()

    const [loadingUser, setLoadingUser] = useState(true)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        postalCode: '',
        phone: '',
        photoUrl: '',
        birthDate: '',
        age: 0,
    })
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })

    useEffect(() => {
        const initializeProfile = async () => {
            try {
                const user = auth.currentUser

                if (!user) {
                    console.log("❌ Pas d'utilisateur connecté")
                    navigate('/login')
                    return
                }

                const profile = await getProfile(user.uid)

                if (profile) {
                    console.log('✅ Profil existe déjà → redirection dashboard')
                    navigate('/user/dashboard')
                    return
                }

                console.log('🆕 Nouveau profil à créer')
                setFormData((prev) => ({ ...prev, email: user.email }))
                setLoadingUser(false)
            } catch (err) {
                console.error('❌ Erreur:', err)
                setStatus({
                    open: true,
                    severity: 'error',
                    message: 'Erreur de chargement du profil',
                })
                setLoadingUser(false)
            }
        }

        initializeProfile()
    }, [navigate])

    const handleChange = (field) => (e) => {
        const value = e.target.value
        setFormData({ ...formData, [field]: value })
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')

        if (value.length > 10) value = value.slice(0, 10)

        let formatted = ''
        for (let i = 0; i < value.length; i += 2) {
            if (i > 0) formatted += ' '
            formatted += value.slice(i, i + 2)
        }

        setFormData((prev) => ({ ...prev, phone: formatted }))
    }

    const handleAddressSelected = ({ street, city, postalCode }) => setFormData((p) => ({ ...p, street, city, postalCode }))

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setPhotoFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemovePhoto = () => {
        setPhotoFile(null)
        setPhotoPreview(null)
        const fileInput = document.getElementById('icon-button-file')
        if (fileInput) fileInput.value = ''
    }

    const calculateAge = (birthDate) => {
        if (!birthDate) return 0
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
        return age
    }

    const validateStep = () => {
        const newErrors = {}
        if (step === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis'
            if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis'
            if (!formData.email.trim()) newErrors.email = 'Email requis'
        } else if (step === 2) {
            if (!formData.street.trim()) newErrors.street = 'Rue requise'
            if (!formData.city.trim()) newErrors.city = 'Ville requise'
            if (!formData.postalCode.trim()) newErrors.postalCode = 'Code postal requis'
        } else if (step === 3) {
            if (!formData.birthDate) {
                newErrors.birthDate = 'Date de naissance requise'
            } else if (calculateAge(formData.birthDate) < 18) {
                newErrors.birthDate = 'Tu dois avoir 18 ans minimum'
            }

            const cleanPhone = formData.phone.replace(/\s/g, '')
            if (!cleanPhone) {
                newErrors.phone = 'Numéro requis'
            } else if (cleanPhone.length !== 10) {
                newErrors.phone = 'Le numéro doit contenir 10 chiffres'
            } else if (!/^0[1-9]\d{8}$/.test(cleanPhone)) {
                newErrors.phone = 'Numéro invalide (doit commencer par 01-09)'
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep()) setStep((p) => p + 1)
    }

    const prevStep = () => setStep((p) => p - 1)

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('SOUMISSION DÉMARRÉE !')

        if (!validateStep()) return

        if (!auth.currentUser) {
            setStatus({ open: true, severity: 'error', message: 'Utilisateur non connecté' })
            return
        }

        console.log('UID:', auth.currentUser.uid)

        try {
            const uid = auth.currentUser.uid
            const payload = {
                displayName: `${formData.firstName} ${formData.lastName}`,
                ...formData,
                age: calculateAge(formData.birthDate),
                hasPassword: false,
            }

            await createProfile(uid, payload, null)
            navigate('/user/interest')
        } catch (err) {
            console.error(err)
            let message = 'Erreur inconnue'

            if (err.code === 'auth/requires-recent-login') {
                message = 'Lien expiré. Clique à nouveau sur le lien magique.'
                navigate('/signup')
            } else {
                message = err.message
            }

            setStatus({ open: true, severity: 'error', message })
        }
    }

    if (loadingUser) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Chargement de l'utilisateur…</Typography>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                width: '100vw',
                minHeight: '100vh',
                overflow: 'hidden',
                bgcolor: '#E7F2F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '380px',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/Logo.svg"
                        alt="Logo"
                        sx={{
                            width: { xs: '200px', sm: '280px' },
                            height: 'auto',
                        }}
                    />
                </Box>

                <Typography
                    sx={{
                        color: '#ED6A5A',
                        fontSize: '1rem',
                        mb: { xs: 10, sm: 28 },
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 400,
                    }}
                >
                    Là où chaque rencontre résonne
                </Typography>

                <Typography
                    sx={{
                        fontWeight: 600,
                        color: '#3454D1',
                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                        fontFamily: '"All Round Gothic Semi", sans-serif',
                        alignSelf: 'flex-start',
                        mb: 3,
                        width: '100%',
                        textAlign: 'left',
                    }}
                >
                    Complète ton profil
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    {step === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <TextField
                                placeholder="Prénom"
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 2,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <TextField
                                placeholder="Nom"
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 2,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <TextField
                                placeholder="Email"
                                value={formData.email}
                                disabled
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MailOutline sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 5,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <Button
                                onClick={nextStep}
                                sx={{
                                    width: { xs: '120px', sm: '180px' },
                                    maxWidth: '100%',
                                    bgcolor: '#ED6A5A',
                                    color: '#fff',
                                    borderRadius: 5,
                                    py: 1.1,
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    fontFamily: '"Nunito", sans-serif',
                                    textTransform: 'uppercase',
                                    '&:hover': { bgcolor: '#d85a4c' },
                                }}
                            >
                                Suivant →
                            </Button>
                        </Box>
                    )}

                    {step === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <AddressAutocomplete
                                value={formData.street ? `${formData.street}, ${formData.city}` : ''}
                                onAddressSelected={handleAddressSelected}
                            />
                            <TextField
                                placeholder="Rue"
                                value={formData.street}
                                onChange={handleChange('street')}
                                error={!!errors.street}
                                helperText={errors.street}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Home sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 2,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <TextField
                                placeholder="Ville"
                                value={formData.city}
                                onChange={handleChange('city')}
                                error={!!errors.city}
                                helperText={errors.city}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationCity sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 2,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <TextField
                                placeholder="Code postal"
                                value={formData.postalCode}
                                onChange={handleChange('postalCode')}
                                error={!!errors.postalCode}
                                helperText={errors.postalCode}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PinDrop sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 5,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
                                <Button
                                    onClick={prevStep}
                                    sx={{
                                        width: { xs: '150px', sm: '200px' },
                                        bgcolor: '#B2DDF7',
                                        color: '#3454D1',
                                        borderRadius: 5,
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        fontFamily: '"Nunito", sans-serif',
                                        '&:hover': { bgcolor: '#ED6A5A', color: '#fff' },
                                    }}
                                >
                                    ← Précédent
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    sx={{
                                        width: { xs: '150px', sm: '200px' },
                                        bgcolor: '#ED6A5A',
                                        color: '#fff',
                                        borderRadius: 5,
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        fontFamily: '"Nunito", sans-serif',
                                        '&:hover': { bgcolor: '#d85a4c' },
                                    }}
                                >
                                    Suivant →
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 3 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* Avatar avec bouton de suppression */}
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar src={photoPreview || '/avatar_default.jpg'} sx={{ width: 120, height: 120 }} />
                                {photoPreview && (
                                    <IconButton
                                        onClick={handleRemovePhoto}
                                        sx={{
                                            position: 'absolute',
                                            bottom: -5,
                                            right: -5,
                                            bgcolor: '#ED6A5A',
                                            color: 'white',
                                            width: 30,
                                            height: 30,
                                            '&:hover': { bgcolor: '#d85a4c' },
                                        }}
                                    >
                                        <Close sx={{ fontSize: 18 }} />
                                    </IconButton>
                                )}
                            </Box>

                            <label htmlFor="icon-button-file">
                                <input
                                    accept="image/*"
                                    id="icon-button-file"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoChange}
                                />
                                <IconButton component="span" sx={{ color: '#3454D1', mb: 3 }}>
                                    <PhotoCamera />
                                </IconButton>
                            </label>

                            {/* Date de naissance avec DatePicker MUI */}
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                                <DatePicker
                                    value={formData.birthDate ? new Date(formData.birthDate) : null}
                                    onChange={(newDate) => {
                                        if (newDate) {
                                            const formatted = newDate.toISOString().split('T')[0]
                                            setFormData((prev) => ({
                                                ...prev,
                                                birthDate: formatted,
                                                age: calculateAge(formatted),
                                            }))
                                        }
                                    }}
                                    disableFuture
                                    openTo="year"
                                    views={['year', 'month', 'day']}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            placeholder: 'Date de naissance',
                                            error: !!errors.birthDate,
                                            helperText: errors.birthDate,
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarToday sx={{ color: '#B0BEC5' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                            sx: {
                                                width: '100%',
                                                mb: 2,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                fontFamily: '"Nunito", sans-serif',
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    fontSize: '0.9rem',
                                                    py: 0.8,
                                                },
                                                '& .MuiInputBase-input': {
                                                    py: 1.2,
                                                    fontFamily: '"Nunito", sans-serif',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>

                            {/* Téléphone avec format français */}
                            <TextField
                                placeholder="06 12 34 56 78"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone sx={{ color: '#B0BEC5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    mb: 5,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                        letterSpacing: '0.5px',
                                    },
                                }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
                                <Button
                                    onClick={prevStep}
                                    sx={{
                                        width: { xs: '150px', sm: '200px' },
                                        bgcolor: '#B2DDF7',
                                        color: '#3454D1',
                                        borderRadius: 5,
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        fontFamily: '"Nunito", sans-serif',
                                        '&:hover': { bgcolor: '#ED6A5A', color: '#fff' },
                                    }}
                                >
                                    ← Précédent
                                </Button>
                                <Button
                                    type="submit"
                                    sx={{
                                        width: { xs: '150px', sm: '200px' },
                                        bgcolor: '#ED6A5A',
                                        color: '#fff',
                                        borderRadius: 5,
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        fontFamily: '"Nunito", sans-serif',
                                        '&:hover': { bgcolor: '#d85a4c' },
                                    }}
                                >
                                    Terminer ✔
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            <Snackbar open={status.open} autoHideDuration={5000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.severity} sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
