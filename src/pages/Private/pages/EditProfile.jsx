import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, Avatar, Chip, CircularProgress, IconButton } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { auth } from '../../../firebase-config'
import { fetchUserById, updateUserProfile } from '../../../services/userService'
import { getUserInterests } from '../../../services/categoriesService'

export default function EditProfile() {
    const { idUser } = useParams()
    const navigate = useNavigate()
    const currentUser = auth.currentUser
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef(null) // 🔹 référence pour le champ caché

    const [formData, setFormData] = useState({
        firstName: '',
        description: '',
        email: '',
    })
    const [interests, setInterests] = useState([])
    const [photoUrl, setPhotoUrl] = useState('')

    useEffect(() => {
        if (!currentUser || currentUser.uid !== idUser) {
            navigate('/user/dashboard')
            return
        }

        const loadUserData = async () => {
            try {
                const userData = await fetchUserById(idUser)
                if (userData) {
                    setFormData({
                        firstName: userData.firstName || '',
                        description: userData.description || '',
                        email: userData.email || '',
                    })
                    setPhotoUrl(userData.photoUrl || '')
                }

                const userInterests = await getUserInterests(idUser)
                setInterests(userInterests)
            } catch (error) {
                console.error('Erreur lors du chargement:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUserData()
    }, [idUser, currentUser, navigate])

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }))
    }

    // 🔹 Gestion du changement de photo (sans upload)
    const handlePhotoClick = () => {
        fileInputRef.current.click() // Ouvre le sélecteur de fichier
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoUrl(reader.result) // 🔹 affiche l’image choisie en base64
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateUserProfile(idUser, {
                firstName: formData.firstName,
                description: formData.description,
                email: formData.email,
                // ⚠️ on ne sauvegarde pas photoUrl, c’est seulement local
            })
            navigate(`/user/profile/${idUser}`)
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleGoToInterests = async () => {
        await handleSave()
        navigate('/user/interest')
    }

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#E4EFF6',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#E4EFF6', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 3, pt: 4 }}>
                <Box
                    onClick={() => navigate(-1)}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        color: '#3454D1',
                    }}
                >
                    <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Back</Typography>
                </Box>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: '#3454D1',
                        mt: 1,
                        fontSize: 30,
                    }}
                >
                    Edit profil
                </Typography>
            </Box>

            {/* Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={photoUrl || '/avatar_default.jpg'}
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid white',
                        }}
                    />
                    <IconButton
                        onClick={handlePhotoClick}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: '#ED6A5A',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: '#d45a4a' },
                        }}
                    >
                        <MuiIcons.Edit sx={{ fontSize: 18 }} />
                    </IconButton>

                    {/* Champ fichier caché */}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
                </Box>
            </Box>

            {/* Formulaire */}
            <Box sx={{ px: 3 }}>
                {/* Nom */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                        Nom
                    </Typography>
                    <TextField
                        fullWidth
                        value={formData.firstName}
                        onChange={handleChange('firstName')}
                        placeholder="Sarah Wilson"
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 3,
                            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                        }}
                    />
                </Box>

                {/* À propos de moi */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                        À propos de moi
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange('description')}
                        placeholder="Aucune description pour le moment..."
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 3,
                            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                        }}
                    />
                </Box>

                {/* Email */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                        Email
                    </Typography>
                    <TextField
                        disabled
                        fullWidth
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="sarah.wilson@gmail.com"
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 3,
                            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                        }}
                    />
                </Box>

                {/* Passions */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                        Mes passions
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            alignItems: 'center',
                        }}
                    >
                        {interests.map((interest) => {
                            const IconComponent = MuiIcons[interest.iconName] || MuiIcons.Interests
                            return (
                                <Chip
                                    key={interest.id}
                                    icon={<IconComponent sx={{ fontSize: 20, color: interest.color }} />}
                                    label={interest.description}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#1a1a1a',
                                        fontWeight: 600,
                                        borderRadius: 3,
                                        p: 1,
                                        '& .MuiChip-icon': { color: interest.color },
                                    }}
                                />
                            )
                        })}
                        <IconButton
                            onClick={handleGoToInterests}
                            sx={{
                                bgcolor: 'white',
                                color: '#3454D1',
                                border: '1px solid #B2DDF7',
                                width: 32,
                                height: 32,
                                '&:hover': { bgcolor: '#e7f4ff' },
                            }}
                        >
                            <MuiIcons.Add />
                        </IconButton>
                    </Box>
                </Box>

                {/* Bouton Mettre à jour */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 7 }}>
                    <Button
                        variant="contained"
                        endIcon={<MuiIcons.ArrowForward />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            width: '90%',
                            maxWidth: 340,
                            bgcolor: '#ED6A5A',
                            color: 'white',
                            py: 1.5,
                            borderRadius: 4,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: 16,
                            '&:hover': { bgcolor: '#d45a4a' },
                        }}
                    >
                        {saving ? 'Enregistrement...' : 'Mettre à jour'}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
