// FILE: src/pages/EditProfile.jsx
import React, { useState, useEffect } from 'react'
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

    const [formData, setFormData] = useState({
        firstName: '',
        description: '',
        email: '',
    })
    const [interests, setInterests] = useState([])
    const [photoUrl, setPhotoUrl] = useState('')

    // Vérifier que c'est bien le profil de l'utilisateur connecté
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

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateUserProfile(idUser, {
                firstName: formData.firstName,
                description: formData.description,
                email: formData.email,
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
                    bgcolor: '#F0E7D6',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F0E7D6',
                pb: 10,
            }}
        >
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
            </Box>

            {/* Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={photoUrl || '/avatar_default.jpg'} sx={{ width: 100, height: 100, border: '4px solid white' }} />
                    <IconButton
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
                </Box>
            </Box>

            {/* Formulaire */}
            <Box sx={{ px: 3 }}>
                {/* Nom */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                        Nom
                    </Typography>
                    <TextField
                        fullWidth
                        value={formData.firstName}
                        onChange={handleChange('firstName')}
                        placeholder="Sarah"
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                        }}
                    />
                </Box>

                {/* Description */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                        À propos de moi
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange('description')}
                        placeholder="J'adore transmettre mon savoir autour de rencontres..."
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                        }}
                    />
                </Box>

                {/* Email */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                        Email
                    </Typography>
                    <TextField
                        disabled
                        fullWidth
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="sarah.d@univ-lyon2.fr"
                        type="email"
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                        }}
                    />
                </Box>

                {/* Centres d'intérêts */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a' }}>
                        Mes centres d'intérêts
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        {interests.map((interest) => {
                            const IconComponent = MuiIcons[interest.iconName] || MuiIcons.ShoppingCart
                            return (
                                <Chip
                                    key={interest.id}
                                    icon={<IconComponent sx={{ fontSize: 18 }} />}
                                    label={interest.description}
                                    sx={{
                                        bgcolor: interest.color,
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: 'white' },
                                    }}
                                />
                            )
                        })}
                        <IconButton
                            onClick={handleGoToInterests}
                            sx={{
                                bgcolor: '#B2DDF7',
                                color: '#3454D1',
                                width: 32,
                                height: 32,
                                '&:hover': { bgcolor: '#a0d0f0' },
                            }}
                        >
                            <MuiIcons.Add />
                        </IconButton>
                    </Box>
                </Box>

                {/* Bouton Mettre à jour */}
                <Button
                    fullWidth
                    variant="contained"
                    endIcon={<MuiIcons.ArrowForward />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        bgcolor: '#ED6A5A',
                        color: 'white',
                        py: 1.5,
                        borderRadius: 3,
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
    )
}
