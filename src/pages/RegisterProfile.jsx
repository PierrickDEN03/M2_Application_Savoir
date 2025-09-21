// FILE: src/pages/RegisterProfile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Container, TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert, Avatar, IconButton } from '@mui/material'
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
        photoUrl: '', // Pour l'affichage local de l'avatar
    })
    const [photoFile, setPhotoFile] = useState(null) // Fichier réel pour l'upload
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })

    // Vérifie si l'utilisateur est connecté dès le chargement
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login') // Redirection si pas connecté
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

    const handleAddressSelected = ({ street, city, postalCode }) => {
        setFormData((prev) => ({ ...prev, street, city, postalCode }))
    }

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setPhotoFile(file) // Stocke le fichier réel pour l'upload
            setFormData((prev) => ({ ...prev, photoUrl: URL.createObjectURL(file) })) // Pour aperçu local
        }
    }

    const validateStep = () => {
        const newErrors = {}
        if (step === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis'
            if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis'
            if (!formData.email.trim()) newErrors.email = 'Email requis'
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
        } else if (step === 2) {
            if (!formData.street.trim()) newErrors.street = 'Rue requise'
            if (!formData.city.trim()) newErrors.city = 'Ville requise'
            if (!formData.postalCode.trim()) newErrors.postalCode = 'Code postal requis'
        } else if (step === 3) {
            if (!formData.phone.trim()) newErrors.phone = 'Numéro de téléphone requis'
            else if (!/^\+?\d{10,15}$/.test(formData.phone)) newErrors.phone = 'Numéro invalide'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep()) setStep((prev) => prev + 1)
    }

    const prevStep = () => setStep((prev) => prev - 1)

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
                // Upload du fichier réel sur Firebase Storage
                const storageRef = ref(storage, `users/${uid}/profile.jpg`)
                await uploadBytes(storageRef, photoFile)
                // Récupère l'URL publique pour Firestore
                photoUrl = await getDownloadURL(storageRef)
            }

            const payload = {
                displayName: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                photoUrl, // URL finale stockée dans Firestore
                address: {
                    street: formData.street,
                    city: formData.city,
                    postalCode: formData.postalCode,
                },
                createdAt: new Date().toISOString(),
            }

            await setDoc(doc(db, 'users', uid), payload, { merge: true })
            navigate('/user/dashboard')
        } catch (err) {
            console.error('Erreur Firestore/Storage:', err)
            setStatus({
                open: true,
                severity: 'error',
                message: `Erreur lors de la création du profil: ${err.message}`,
            })
        }
    }

    if (loadingUser) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Chargement de l'utilisateur…</Typography>
            </Container>
        )
    }

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Complète ton profil
                </Typography>
                <Box component="form" sx={{ mt: 3, width: '100%' }} onSubmit={handleSubmit}>
                    {/* STEP 1 */}
                    {step === 1 && (
                        <Box>
                            <TextField
                                label="Prénom"
                                fullWidth
                                required
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                                sx={{ mb: 2 }}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                            <TextField
                                label="Nom"
                                fullWidth
                                required
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                                sx={{ mb: 2 }}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                required
                                value={formData.email}
                                sx={{ mb: 2 }}
                                disabled
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" color="secondary" onClick={nextStep}>
                                    Suivant
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <Box>
                            <AddressAutocomplete
                                value={formData.street ? `${formData.street}, ${formData.city}, ${formData.postalCode}` : ''}
                                onAddressSelected={handleAddressSelected}
                                error={!!errors.street || !!errors.city || !!errors.postalCode}
                                helperText={errors.street || errors.city || errors.postalCode || ''}
                            />
                            <TextField
                                label="Rue"
                                fullWidth
                                required
                                value={formData.street}
                                onChange={handleChange('street')}
                                sx={{ mb: 2 }}
                                error={!!errors.street}
                                helperText={errors.street}
                            />
                            <TextField
                                label="Ville"
                                fullWidth
                                required
                                value={formData.city}
                                onChange={handleChange('city')}
                                sx={{ mb: 2 }}
                                error={!!errors.city}
                                helperText={errors.city}
                            />
                            <TextField
                                label="Code Postal"
                                fullWidth
                                required
                                value={formData.postalCode}
                                onChange={handleChange('postalCode')}
                                sx={{ mb: 2 }}
                                error={!!errors.postalCode}
                                helperText={errors.postalCode}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="outlined" onClick={prevStep}>
                                    Précédent
                                </Button>
                                <Button variant="contained" color="secondary" onClick={nextStep}>
                                    Suivant
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <Box>
                            {/* Avatar affiché à partir de l'URL locale pour aperçu */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                <Avatar src={formData.photoUrl || '/avatar_default.jpg'} sx={{ width: 120, height: 120, mb: 1 }} />
                                <label htmlFor="icon-button-file">
                                    <input
                                        accept="image/*"
                                        id="icon-button-file"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                    <IconButton color="primary" component="span">
                                        <PhotoCamera />
                                    </IconButton>
                                </label>
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    Cliquez sur l’icône pour changer la photo
                                </Typography>
                            </Box>

                            <TextField
                                label="Numéro de téléphone"
                                fullWidth
                                required
                                value={formData.phone}
                                onChange={handleChange('phone')}
                                sx={{ mb: 3 }}
                                error={!!errors.phone}
                                helperText={errors.phone || 'Ex: +33123456789'}
                                inputProps={{ maxLength: 15 }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="outlined" onClick={prevStep}>
                                    Précédent
                                </Button>
                                <Button type="submit" variant="contained" color="secondary">
                                    Terminer
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
        </Container>
    )
}
