import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, Button, CircularProgress, Chip } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchActivityById } from '../../../services/activitiesService'
import { fetchUserById } from '../../../services/userService'
import { fetchCategoryById, getCategoryImage } from '../../../services/categoriesService'
import { checkReservation, addReservation, removeReservation } from '../../../services/reservationsService'
import { checkFavorite, addFavorite, removeFavorite } from '../../../services/favorisService'
import { auth, db } from '../../../firebase-config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { formatActivityDate } from '../../../components/utils/formatDate'
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
    const [registeredCount, setRegisteredCount] = useState(0)

    const currentUser = auth.currentUser

    useEffect(() => {
        const loadActivityDetails = async () => {
            try {
                if (!currentUser) {
                    navigate('/login')
                    return
                }

                const activityData = await fetchActivityById(activityId)
                if (!activityData) {
                    navigate('/user/activity')
                    return
                }
                setActivity(activityData)

                const userData = await fetchUserById(activityData.userId || activityData.createdBy)
                setCreator(userData)

                const categoryData = await fetchCategoryById(activityData.categoryId)
                setCategory(categoryData)

                const q = query(collection(db, 'reservations'), where('activityId', '==', activityId))
                const querySnapshot = await getDocs(q)
                setRegisteredCount(querySnapshot.size)

                const resId = await checkReservation(currentUser.uid, activityId)
                if (resId) {
                    setIsRegistered(true)
                    setReservationId(resId)
                }

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

        if (activityId) loadActivityDetails()
    }, [activityId, navigate, currentUser])

    const handleToggleFavorite = async () => {
        if (!currentUser) return
        setActionLoading(true)
        try {
            if (isFavorite) {
                await removeFavorite(favoriteId)
                setIsFavorite(false)
                setFavoriteId(null)
            } else {
                const newFavId = await addFavorite(currentUser.uid, activityId)
                setIsFavorite(true)
                setFavoriteId(newFavId)
            }
        } catch (error) {
            console.error('Erreur lors des favoris:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleRegistration = async () => {
        if (!currentUser) return
        setActionLoading(true)
        try {
            if (isRegistered) {
                await removeReservation(reservationId)
                setIsRegistered(false)
                setRegisteredCount((prev) => Math.max(0, prev - 1))
            } else {
                const newResId = await addReservation(currentUser.uid, activityId)
                setIsRegistered(true)
                setReservationId(newResId)
                setRegisteredCount((prev) => prev + 1)
            }
        } catch (error) {
            console.error('Erreur lors de la réservation:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString) => formatActivityDate(dateString)

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#e4eff6' }}>
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    if (!activity) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#e4eff6', p: 3 }}>
                <Typography>Activité non trouvée</Typography>
            </Box>
        )
    }

    const categoryImage = category ? getCategoryImage(category.description) : activity.photoUrl
    const categoryName = category?.description || 'Autres'

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#e4eff6', pb: 10 }}>
            <AvatarPlaceholder />

            {/* En-tête hors image */}
            <Box sx={{ px: 3, pt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer' }} onClick={() => navigate(-1)}>
                    <MuiIcons.ArrowBack sx={{ color: '#3454D1', fontSize: 24 }} />
                    <Typography sx={{ color: '#3454D1', fontWeight: 700, fontSize: 18 }}>Back</Typography>
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3454D1', mb: 2 }}>
                    {activity.title}
                </Typography>
            </Box>

            {/* Box principale avec fond blanc */}
            <Box
                sx={{
                    bgcolor: 'white',
                    borderRadius: 3,
                    mx: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
            >
                {/* Image en haut de la box */}
                <Box
                    sx={{
                        position: 'relative',
                        height: 180,
                        background: `url(${categoryImage}) center/cover no-repeat`,
                    }}
                >
                    {/* Badge catégorie en haut à gauche */}
                    {category && (
                        <Chip
                            icon={category.iconName ? React.createElement(MuiIcons[category.iconName]) : undefined}
                            label={categoryName}
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: category.color ? `${category.color}E6` : 'rgba(52, 84, 209, 0.9)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                height: 30,
                                '& .MuiChip-label': { px: 1 },
                                '& .MuiChip-icon': { color: 'white' },
                            }}
                        />
                    )}
                </Box>

                {/* Contenu texte */}
                <Box sx={{ p: 3 }}>
                    {/* Profil organisateur */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar src={creator?.photoUrl} sx={{ width: 56, height: 56, mr: 2, border: '3px solid #3454D1' }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {creator?.displayName || 'Utilisateur'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Contacter l'organisateur
                            </Typography>
                        </Box>
                    </Box>

                    {/* Informations */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Informations
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <MuiIcons.CalendarToday sx={{ fontSize: 18, color: '#ED6A5A', mr: 1 }} />
                        <Typography>{formatDate(activity.date)}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <MuiIcons.LocationOn sx={{ fontSize: 18, color: '#ED6A5A', mr: 1 }} />
                        <Typography>{activity.address?.street || activity.address?.city}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MuiIcons.Group sx={{ fontSize: 18, color: '#ED6A5A', mr: 1 }} />
                        <Typography>
                            {registeredCount}/{activity.participants || 0} participants
                        </Typography>
                    </Box>

                    {/* Description */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Détail de l'annonce
                    </Typography>
                    <Typography sx={{ color: '#333', mb: 3 }}>{activity.description || 'Aucune description disponible.'}</Typography>
                </Box>
            </Box>
            {/* Boutons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 5, px: 3 }}>
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
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
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
                        bgcolor: isRegistered ? '#3454D1' : '#ED6A5A',
                        color: 'white',
                        borderRadius: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { bgcolor: isRegistered ? '#2140ba' : '#d45a4a' },
                    }}
                >
                    {isRegistered ? 'Inscrit ✓' : "S'inscrire"}
                </Button>
            </Box>
        </Box>
    )
}

export default ActivityDetail
