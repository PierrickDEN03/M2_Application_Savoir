// FILE: src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, Chip, Button, CircularProgress } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { auth } from '../../../firebase-config'
import { fetchUserById } from '../../../services/userService'
import { getUserInterests } from '../../../services/categoriesService'
import { fetchActivitiesFromDB } from '../../../services/activitiesService'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

export default function UserProfile() {
    const { idUser } = useParams()
    const navigate = useNavigate()
    const currentUser = auth.currentUser

    const [user, setUser] = useState(null)
    const [interests, setInterests] = useState([])
    const [userActivities, setUserActivities] = useState([])
    const [loading, setLoading] = useState(true)

    const isOwnProfile = currentUser && currentUser.uid === idUser

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                // Récupérer l'utilisateur
                const userData = await fetchUserById(idUser)
                if (!userData) {
                    console.error('Utilisateur non trouvé')
                    navigate('/user/dashboard')
                    return
                }
                setUser(userData)

                // Centres d'intérêts
                const userInterests = await getUserInterests(idUser)
                setInterests(userInterests)

                // Activités de l'utilisateur
                const allActivities = await fetchActivitiesFromDB()
                const activities = allActivities.filter((act) => act.createdBy === idUser || act.userId === idUser)
                setUserActivities(activities)
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error)
            } finally {
                setLoading(false)
            }
        }

        if (idUser) loadUserProfile()
    }, [idUser, navigate])

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: isOwnProfile ? '#FFD166' : '#ED6A5A',
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        )
    }

    if (!user) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F0E7D6', p: 3 }}>
                <Typography>Utilisateur non trouvé</Typography>
            </Box>
        )
    }

    const bgColor = isOwnProfile ? '#FFD166' : '#ED6A5A'

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: bgColor, pb: 10 }}>
            {/* Header */}
            <Box sx={{ p: 3, pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box onClick={() => navigate(-1)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: 'white' }}>
                    <MuiIcons.ArrowBack />
                    <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Back</Typography>
                </Box>

                {!isOwnProfile && <AvatarPlaceholder userId={idUser} />}
            </Box>

            {/* Profil utilisateur */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar src={user.photoUrl || '/avatar_default.jpg'} sx={{ width: 64, height: 64, border: '3px solid white' }} />
                    <Box>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                            {user.displayName || user.firstName || 'Utilisateur'}
                        </Typography>
                        {isOwnProfile && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/user/modif-profile/${idUser}`)}
                                sx={{
                                    mt: 0.5,
                                    color: 'white',
                                    borderColor: 'white',
                                    textTransform: 'none',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                                }}
                            >
                                Modifier
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Centres d'intérêts */}
                <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 2.5, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
                        Centre d'intérêts
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {interests.length > 0 ? (
                            interests.map((interest) => {
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
                            })
                        ) : (
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Aucun centre d'intérêt défini
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Description */}
                <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 2.5, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a' }}>
                        Description
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                        {user.description || 'Cet utilisateur n’a pas encore ajouté de description.'}
                    </Typography>
                </Box>

                {/* Nombre d'activités */}
                <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 2.5, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a' }}>
                        Nombre d'activités proposées
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MuiIcons.Event sx={{ fontSize: 24, color: bgColor }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                            {userActivities.length}
                        </Typography>
                    </Box>
                </Box>

                {/* Nombre de rencontres */}
                <Box
                    sx={{
                        bgcolor: 'white',
                        borderRadius: 3,
                        p: 2.5,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        Nombre de rencontres
                    </Typography>
                    <Chip
                        icon={<MuiIcons.Group />}
                        label="0"
                        sx={{ bgcolor: bgColor, color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'white' } }}
                    />
                </Box>

                {/* Avis */}
                <Box
                    sx={{
                        bgcolor: 'white',
                        borderRadius: 3,
                        p: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        Avis
                    </Typography>
                    <Chip
                        icon={<MuiIcons.Star />}
                        label="N/A"
                        sx={{ bgcolor: '#f5f5f5', color: '#666', fontWeight: 600, '& .MuiChip-icon': { color: '#FFD166' } }}
                    />
                </Box>
            </Box>
        </Box>
    )
}
