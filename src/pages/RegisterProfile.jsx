// FILE: src/pages/RegisterProfile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert, Avatar, IconButton } from '@mui/material'
import { PhotoCamera } from '@mui/icons-material'
import { auth, db, storage } from '../firebase-config'
import { doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { onAuthStateChanged } from 'firebase/auth'
import useLoadGooglePlaces from '../components/useLoadGooglePlaces'
import AddressAutocomplete from '../components/AddressAutocomplete'

export default function RegisterProfile() {
    const navigate = useNavigate()
    const location = useLocation()
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
    })
    const [photoFile, setPhotoFile] = useState(null)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login')
            } else {
                setFormData((prev) => ({
                    ...prev,
                    email: location.state?.email || user.email || '',
                }))
                setLoadingUser(false)
            }
        })
        return () => unsubscribe()
    }, [location.state, navigate])

    const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value })
    const handleAddressSelected = ({ street, city, postalCode }) => setFormData((p) => ({ ...p, street, city, postalCode }))
    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setPhotoFile(file)
            setFormData((prev) => ({ ...prev, photoUrl: URL.createObjectURL(file) }))
        }
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
            if (!formData.phone.trim()) newErrors.phone = 'Numéro requis'
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
        if (!validateStep()) return
        if (!auth.currentUser) {
            setStatus({ open: true, severity: 'error', message: 'Utilisateur non connecté' })
            return
        }
        const uid = auth.currentUser.uid
        let photoUrl = formData.photoUrl || '/avatar_default.jpg'
        try {
            if (photoFile) {
                const storageRef = ref(storage, `users/${uid}/profile.jpg`)
                await uploadBytes(storageRef, photoFile)
                photoUrl = await getDownloadURL(storageRef)
            }
            const payload = {
                displayName: `${formData.firstName} ${formData.lastName}`,
                ...formData,
                photoUrl,
                createdAt: new Date().toISOString(),
            }
            await setDoc(doc(db, 'users', uid), payload, { merge: true })
            navigate('/user/interest')
        } catch (err) {
            console.error(err)
            setStatus({ open: true, severity: 'error', message: `Erreur: ${err.message}` })
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
                height: '100vh',
                bgcolor: '#3454D1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: 400,
                }}
            >
                {/* Logo */}
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#F0E7D6', mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    echo
                    <Box component="span" sx={{ color: '#ED6A5A' }}>
                        •
                    </Box>
                    ly
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#FFD166', mb: 4 }}>
                    Là où chaque rencontre résonne
                </Typography>

                {/* Titre */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F0E7D6', mb: 3 }}>
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
                                sx={{ width: '100%', mb: 2, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <TextField
                                placeholder="Nom"
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                sx={{ width: '100%', mb: 2, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <TextField
                                placeholder="Email"
                                value={formData.email}
                                disabled
                                error={!!errors.email}
                                helperText={errors.email}
                                sx={{ width: '100%', mb: 2, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <Button
                                onClick={nextStep}
                                sx={{
                                    bgcolor: '#ED6A5A',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    px: 5,
                                    py: 1.2,
                                    mt: 2,
                                    '&:hover': { bgcolor: '#B2DDF7', color: '#3454D1' },
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
                                sx={{ maxWidth: 400, mb: 2 }}
                            />
                            <TextField
                                placeholder="Rue"
                                value={formData.street}
                                onChange={handleChange('street')}
                                sx={{ width: '100%', mb: 2, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <TextField
                                placeholder="Ville"
                                value={formData.city}
                                onChange={handleChange('city')}
                                sx={{ width: '100%', mb: 2, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <TextField
                                placeholder="Code postal"
                                value={formData.postalCode}
                                onChange={handleChange('postalCode')}
                                sx={{ width: '100%', mb: 2, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
                                <Button
                                    onClick={prevStep}
                                    sx={{
                                        bgcolor: '#B2DDF7', // couleur principale du bouton précédent
                                        color: '#3454D1', // texte en bleu foncé
                                        borderRadius: '12px',
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        '&:hover': {
                                            bgcolor: '#ED6A5A', // couleur hover
                                            color: '#F0E7D6', // texte hover
                                        },
                                    }}
                                >
                                    ← Précédent
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    sx={{
                                        bgcolor: '#ED6A5A',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        px: 4,
                                        '&:hover': { bgcolor: '#B2DDF7', color: '#3454D1' },
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
                                <IconButton component="span" sx={{ color: '#FFD166' }}>
                                    <PhotoCamera />
                                </IconButton>
                            </label>
                            <TextField
                                placeholder="Numéro de téléphone"
                                value={formData.phone}
                                onChange={handleChange('phone')}
                                error={!!errors.phone}
                                helperText={errors.phone || 'Ex: +33123456789'}
                                sx={{ width: '100%', mt: 2, mb: 3, bgcolor: 'white', borderRadius: '8px' }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Button
                                    onClick={prevStep}
                                    sx={{
                                        bgcolor: '#B2DDF7', // couleur principale du bouton précédent
                                        color: '#3454D1', // texte en bleu foncé
                                        borderRadius: '12px',
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        '&:hover': {
                                            bgcolor: '#ED6A5A', // couleur hover
                                            color: '#F0E7D6', // texte hover
                                        },
                                    }}
                                >
                                    ← Précédent
                                </Button>
                                <Button
                                    type="submit"
                                    sx={{
                                        bgcolor: '#ED6A5A',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        px: 4,
                                        '&:hover': { bgcolor: '#B2DDF7', color: '#3454D1' },
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
