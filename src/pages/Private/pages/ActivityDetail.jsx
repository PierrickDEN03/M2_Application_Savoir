// FILE: src/pages/ActivityDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, Button, CircularProgress } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchActivityById } from '../../../services/activitiesService'
import { fetchUserById } from '../../../services/userService'
import { fetchCategoryById } from '../../../services/categoriesService'
import { checkReservation, addReservation, removeReservation } from '../../../services/reservationsService'
import { checkFavorite, addFavorite, removeFavorite } from '../../../services/favorisService'
import { auth } from '../../../firebase-config'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

function ActivityDetail() {
    const { activityId } = useParams()
    const navigate = useNavigate()
    const [activity, setActivity] = useState(null)
    const [creator, setCreator] = useState(null)
    const [category, setCategory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isRegistered, setIsRegistered] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [reservationId, setReservationId] = useState(null)
    const [favoriteId, setFavoriteId] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const currentUser = auth.currentUser

    useEffect(() => {
        const loadActivityDetails = async () => {
            try {
                if (!currentUser) {
                    navigate('/login')
                    return
                }

                // Récupérer l'activité
                const activityData = await fetchActivityById(activityId)
                if (!activityData) {
                    console.error('Activité non trouvée')
                    navigate('/user/activity')
                    return
                }
                setActivity(activityData)

                // Récupérer le créateur
                const userData = await fetchUserById(activityData.userId || activityData.createdBy)
                setCreator(userData)

                // Récupérer la catégorie
                const categoryData = await fetchCategoryById(activityData.categoryId)
                setCategory(categoryData)

                // Vérifier si l'utilisateur est déjà inscrit
                const resId = await checkReservation(currentUser.uid, activityId)
                if (resId) {
                    setIsRegistered(true)
                    setReservationId(resId)
                }

                // Vérifier si l'activité est dans les favoris
                const favId = await checkFavorite(currentUser.uid, activityId)
                if (favId) {
                    setIsFavorite(true)
                    setFavoriteId(favId)
                }
            } catch (error) {
                console.error('Erreur lors du chargement:', error)
            } finally {
                setLoading(false)
            }
        }

        if (activityId) {
            loadActivityDetails()
        }
    }, [activityId, navigate, currentUser])

    const handleToggleRegistration = async () => {
        if (!currentUser) return
        setActionLoading(true)

        try {
            if (isRegistered) {
                // Désinscrire
                await removeReservation(reservationId)
                setIsRegistered(false)
                setReservationId(null)
            } else {
                // Inscrire
                const newResId = await addReservation(currentUser.uid, activityId)
                setIsRegistered(true)
                setReservationId(newResId)
            }
        } catch (error) {
            console.error("Erreur lors de la gestion de l'inscription:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleFavorite = async () => {
        if (!currentUser) return
        setActionLoading(true)

        try {
            if (isFavorite) {
                // Retirer des favoris
                await removeFavorite(favoriteId)
                setIsFavorite(false)
                setFavoriteId(null)
            } else {
                // Ajouter aux favoris
                const newFavId = await addFavorite(currentUser.uid, activityId)
                setIsFavorite(true)
                setFavoriteId(newFavId)
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des favoris:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        return date.toLocaleDateString('fr-FR', options)
    }

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}h${minutes}`
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

    if (!activity) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F0E7D6', p: 3 }}>
                <Typography>Activité non trouvée</Typography>
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
            <AvatarPlaceholder />
            {/* Header avec image */}
            <Box
                sx={{
                    position: 'relative',
                    height: 250,
                    background: activity.photoUrl ? `url(${activity.photoUrl})` : 'linear-gradient(135deg, #3454D1 0%, #B2DDF7 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Bouton retour */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate(-1)}
                >
                    <MuiIcons.ArrowBack sx={{ color: 'white', fontSize: 24 }} />
                    <Typography
                        sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 18,
                        }}
                    >
                        Back
                    </Typography>
                </Box>

                {/* Titre sur l'image */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: 'white',
                            fontWeight: 700,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    >
                        {activity.title}
                    </Typography>
                </Box>
            </Box>

            {/* Contenu */}
            <Box sx={{ px: 3, pt: 3 }}>
                {/* Profil créateur */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={creator?.photoUrl}
                        sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            border: '2px solid #3454D1',
                        }}
                    />
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => navigate(`/user/profile/${creator?.id}`)}
                        >
                            {creator?.displayName || 'Utilisateur'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Contact de l'organisateur
                        </Typography>
                    </Box>
                </Box>

                {/* Section Informations */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#1a1a1a',
                    }}
                >
                    Informations
                </Typography>

                {/* Date et heure */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#FFE5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            flexShrink: 0,
                        }}
                    >
                        <MuiIcons.CalendarToday sx={{ fontSize: 20, color: '#ED6A5A' }} />
                    </Box>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatDate(activity.date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            à {formatTime(activity.date)}
                        </Typography>
                    </Box>
                </Box>

                {/* Lieu */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#FFE5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            flexShrink: 0,
                        }}
                    >
                        <MuiIcons.LocationOn sx={{ fontSize: 20, color: '#ED6A5A' }} />
                    </Box>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {activity.address?.street || activity.address?.city}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {activity.address?.full || `${activity.address?.postalCode} ${activity.address?.city}`}
                        </Typography>
                    </Box>
                </Box>

                {/* Participants */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#FFE5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            flexShrink: 0,
                        }}
                    >
                        <MuiIcons.Group sx={{ fontSize: 20, color: '#ED6A5A' }} />
                    </Box>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {activity.participants || 0} participants
                        </Typography>
                    </Box>
                </Box>

                {/* Détail de l'annonce */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#1a1a1a',
                    }}
                >
                    Détail de l'annonce
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: '#333',
                        lineHeight: 1.6,
                        mb: 4,
                    }}
                >
                    {activity.description || 'Aucune description disponible.'}
                </Typography>

                {/* Boutons d'action */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={isFavorite ? <MuiIcons.Favorite /> : <MuiIcons.FavoriteBorder />}
                        onClick={handleToggleFavorite}
                        disabled={actionLoading}
                        sx={{
                            borderColor: '#ED6A5A',
                            color: '#ED6A5A',
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: '#ED6A5A',
                                bgcolor: 'rgba(237, 106, 90, 0.05)',
                            },
                        }}
                    >
                        {isFavorite ? 'Retirer des envies' : 'Ajouter aux envies'}
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={isRegistered ? <MuiIcons.CheckCircle /> : <MuiIcons.Check />}
                        onClick={handleToggleRegistration}
                        disabled={actionLoading}
                        sx={{
                            bgcolor: isRegistered ? '#27AE60' : '#ED6A5A',
                            color: 'white',
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: isRegistered ? '#229954' : '#d45a4a',
                            },
                        }}
                    >
                        {isRegistered ? 'Inscrit ✓' : "S'inscrire"}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default ActivityDetail
