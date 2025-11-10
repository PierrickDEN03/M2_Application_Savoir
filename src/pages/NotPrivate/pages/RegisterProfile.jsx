// FILE: src/pages/RegisterProfile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert, Avatar, IconButton, InputAdornment } from '@mui/material'
import { PhotoCamera, Person, PersonOutline, MailOutline, Home, LocationCity, PinDrop } from '@mui/icons-material'
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

                // Vérifier si le profil existe déjà
                const profile = await getProfile(user.uid)

                if (profile) {
                    console.log('✅ Profil existe déjà → redirection dashboard')
                    navigate('/user/dashboard')
                    return
                }

                // Nouveau profil → pré-remplir l'email
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

        if (field === 'birthDate') {
            const age = calculateAge(value)
            setFormData((prev) => ({ ...prev, age }))
        }
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')

        if (value.length > 10) value = value.slice(0, 10)

        if (value.startsWith('33') && value.length > 2) {
            value = `+33 ${value.slice(2, 4)} ${value.slice(4, 7)} ${value.slice(7)}`.trim()
        } else if (value.length > 0) {
            value = `${value.slice(0, 2)} ${value.slice(2, 4)} ${value.slice(4, 7)} ${value.slice(7)}`.trim()
        }

        setFormData((prev) => ({ ...prev, phone: value }))
    }

    const handleAddressSelected = ({ street, city, postalCode }) => setFormData((p) => ({ ...p, street, city, postalCode }))

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setPhotoFile(file)
            setFormData((prev) => ({ ...prev, photoUrl: URL.createObjectURL(file) }))
        }
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
            if (!formData.birthDate) newErrors.birthDate = 'Date de naissance requise'
            else if (calculateAge(formData.birthDate) < 18) newErrors.birthDate = 'Tu dois avoir 18 ans minimum'
            if (!formData.phone.trim()) {
                newErrors.phone = 'Numéro requis'
            } else if (!/^(?:\+33|0)[1-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
                newErrors.phone = 'Numéro invalide (ex: +33612345678 ou 0612345678)'
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

            await createProfile(uid, payload, photoFile)
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
                overflox: 'hidden',
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
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                    borderRadius: '24px',
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
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                        borderRadius: '24px',
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
                                        borderRadius: '24px',
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
                            <Avatar src={formData.photoUrl || '/avatar_default.jpg'} sx={{ width: 120, height: 120, mb: 2 }} />
                            <label htmlFor="icon-button-file">
                                <input
                                    accept="image/*"
                                    id="icon-button-file"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoChange}
                                />
                                <IconButton component="span" sx={{ color: '#3454D1', mb: 2 }}>
                                    <PhotoCamera />
                                </IconButton>
                            </label>
                            <TextField
                                type="date"
                                placeholder="Date de naissance"
                                value={formData.birthDate}
                                onChange={handleChange('birthDate')}
                                error={!!errors.birthDate}
                                helperText={errors.birthDate}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: '100%',
                                    mb: 2,
                                    bgcolor: 'white',
                                    borderRadius: '24px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
                                        fontSize: '0.9rem',
                                        py: 0.8,
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.2,
                                    },
                                }}
                            />
                            <TextField
                                placeholder="Numéro de téléphone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                error={!!errors.phone}
                                helperText={errors.phone ? errors.phone : ''}
                                sx={{
                                    width: '100%',
                                    mb: 5,
                                    bgcolor: 'white',
                                    borderRadius: '24px',
                                    fontFamily: '"Nunito", sans-serif',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
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
                                        borderRadius: '24px',
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
                                        borderRadius: '24px',
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
