import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, Button, CircularProgress, Snackbar, Rating, Alert } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchActivityById } from '../../../services/activitiesService'
import { fetchUserById, getUserAvatarUrl } from '../../../services/userService'
import { fetchCategoryById, getCategoryImage } from '../../../services/categoriesService'
import { checkReservation, addReservation, removeReservation } from '../../../services/reservationsService'
import { checkFavorite, addFavorite, removeFavorite } from '../../../services/favorisService'
import { getAvisByActivityId, getAverageNote } from '../../../services/avisService'
import { auth, db } from '../../../firebase-config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { formatActivityDate } from '../../../components/utils/formatDate'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

function ActivityDetail() {
    const { activityId } = useParams()
    const navigate = useNavigate()

    const currentUser = auth.currentUser

    const [activity, setActivity] = useState(null)
    const [creator, setCreator] = useState(null)
    const [category, setCategory] = useState(null)
    const [loading, setLoading] = useState(true)

    const [participantsList, setParticipantsList] = useState([])
    const [registeredCount, setRegisteredCount] = useState(0)
    const [isRegistered, setIsRegistered] = useState(false)
    const [reservationId, setReservationId] = useState(null)

    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriteId, setFavoriteId] = useState(null)

    const [isPast, setIsPast] = useState(false)
    const [isFull, setIsFull] = useState(false)

    const [avis, setAvis] = useState([])
    const [averageNote, setAverageNote] = useState(0)
    const [showAvis, setShowAvis] = useState(false)

    const [actionLoading, setActionLoading] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarSeverity, setSnackbarSeverity] = useState('success')

    useEffect(() => {
        const loadActivityDetails = async () => {
            try {
                if (!currentUser) {
                    navigate('/login')
                    return
                }

                // Récupération de l'activité
                const activityData = await fetchActivityById(activityId)
                if (!activityData) {
                    navigate('/user/activity')
                    return
                }
                setActivity(activityData)

                // Créateur
                const creatorData = await fetchUserById(activityData.userId || activityData.createdBy)
                setCreator(creatorData)

                // Catégorie
                const categoryData = await fetchCategoryById(activityData.categoryId)
                setCategory(categoryData)

                // Participants
                const q = query(collection(db, 'reservations'), where('activityId', '==', activityId))
                const snapshot = await getDocs(q)
                const uids = snapshot.docs.map((doc) => doc.data().userId)
                setParticipantsList(uids)
                setRegisteredCount(uids.length)

                // Check réservation de l'utilisateur
                const resId = await checkReservation(currentUser.uid, activityId)
                if (resId) {
                    setIsRegistered(true)
                    setReservationId(resId)
                }

                // Check favoris
                const favId = await checkFavorite(currentUser.uid, activityId)
                if (favId) {
                    setIsFavorite(true)
                    setFavoriteId(favId)
                }

                // Date et statut
                const activityDate = new Date(activityData.date)
                setIsPast(activityDate < new Date())
                setIsFull(uids.length >= (activityData.participants || 0))
            } catch (error) {
                console.error('Erreur chargement activité:', error)
            } finally {
                setLoading(false)
            }
        }

        if (activityId) loadActivityDetails()
    }, [activityId, navigate, currentUser])

    useEffect(() => {
        const loadAvis = async () => {
            if (!activityId) return
            try {
                const avisData = await getAvisByActivityId(activityId)
                const avisWithUsers = await Promise.all(
                    avisData.map(async (a) => {
                        const user = await fetchUserById(a.idUser)
                        return { ...a, user }
                    })
                )
                setAvis(avisWithUsers)
                const moyenne = await getAverageNote(activityId)
                setAverageNote(moyenne)
            } catch (err) {
                console.error('Erreur chargement avis', err)
            }
        }
        loadAvis()
    }, [activityId])

    const handleToggleFavorite = async () => {
        if (!currentUser) return
        setActionLoading(true)
        try {
            if (isFavorite) {
                await removeFavorite(favoriteId)
                setIsFavorite(false)
                setFavoriteId(null)
                showSnackbar('Retiré des envies', 'info')
            } else {
                const newFavId = await addFavorite(currentUser.uid, activityId)
                setIsFavorite(true)
                setFavoriteId(newFavId)
                showSnackbar('Ajouté aux envies', 'success')
            }
        } catch (error) {
            console.error('Erreur favoris:', error)
            showSnackbar('Erreur favoris', 'error')
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
                setParticipantsList((prev) => prev.filter((uid) => uid !== currentUser.uid))
                setRegisteredCount((prev) => Math.max(0, prev - 1))
                showSnackbar('Réservation annulée', 'info')
            } else {
                const newResId = await addReservation(currentUser.uid, activityId)
                setIsRegistered(true)
                setReservationId(newResId)
                setParticipantsList((prev) => [...prev, currentUser.uid])
                setRegisteredCount((prev) => prev + 1)
                showSnackbar('Inscription réussie', 'success')
            }
        } catch (error) {
            console.error('Erreur réservation:', error)
            showSnackbar('Erreur lors de la réservation', 'error')
        } finally {
            setActionLoading(false)
        }
    }

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message)
        setSnackbarSeverity(severity)
        setSnackbarOpen(true)
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
                <Typography sx={{ fontFamily: '"All Round Gothic Semi", sans-serif' }}>Activité non trouvée</Typography>
            </Box>
        )
    }

    const categoryImage = category ? getCategoryImage(category.description) : activity.photoUrl

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#e4eff6', p: 2 }}>
            <AvatarPlaceholder />

            {/* Back + Titre */}
            <Box sx={{ maxWidth: 420, mx: 'auto', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 1 }} onClick={() => navigate(-1)}>
                    <MuiIcons.ArrowBack sx={{ color: '#3454D1', fontSize: 24 }} />
                    <Typography sx={{ color: '#3454D1', fontWeight: 700, fontSize: 18, fontFamily: '"All Round Gothic Semi", sans-serif' }}>
                        Back
                    </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3454D1', fontFamily: '"All Round Gothic Semi", sans-serif' }}>
                    {activity.title}
                </Typography>
            </Box>

            {/* Conteneur principal */}
            <Box sx={{ maxWidth: 420, mx: 'auto', bgcolor: 'white', borderRadius: 4, overflow: 'hidden', boxShadow: 1 }}>
                {/* Image + bandeau */}
                <Box sx={{ position: 'relative', height: 180, background: `url(${categoryImage}) center/cover no-repeat` }}>
                    {isPast && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                bgcolor: '#ED6A5A',
                                color: 'white',
                                textAlign: 'center',
                                py: 1,
                                fontWeight: 600,
                                fontFamily: '"Nunito", sans-serif',
                            }}
                        >
                            Cette activité est terminée
                        </Box>
                    )}
                    {!isPast && category && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: category.color || '#3454D1',
                                color: 'white',
                                fontWeight: 600,
                                fontFamily: '"Nunito", sans-serif',
                                borderRadius: '8px',
                                px: 2,
                                py: 0.5,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            {category.iconName &&
                                React.createElement(MuiIcons[category.iconName], {
                                    sx: { fontSize: 18, color: 'white' },
                                    'aria-hidden': true,
                                })}
                            <Typography component="span" sx={{ fontSize: '0.9rem', lineHeight: 1, fontFamily: '"Nunito", sans-serif' }}>
                                {category.description}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Contenu principal */}
                <Box sx={{ p: 3 }}>
                    {/* Profil créateur */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar src={getUserAvatarUrl(creator.id)} sx={{ width: 56, height: 56, mr: 2, border: '3px solid #3454D1' }} />
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, cursor: 'pointer', fontFamily: '"Nunito", sans-serif' }}
                                onClick={() => navigate(`/user/profile/${creator?.id}`)}
                            >
                                {creator?.displayName || 'Utilisateur'}
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<MuiIcons.Message />}
                                onClick={() => navigate(`/user/send-message/${creator?.id}/${activityId}`)}
                                sx={{
                                    bgcolor: '#FFD186',
                                    color: 'white',
                                    borderRadius: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    fontFamily: '"Nunito", sans-serif',
                                    textTransform: 'none',
                                    '&:hover': '#e7b667ff',
                                }}
                            >
                                Envoyer un message
                            </Button>
                        </Box>
                    </Box>

                    {/* Informations */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 2, fontFamily: '"Nunito", sans-serif' }}>
                        Informations
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <MuiIcons.CalendarToday sx={{ fontSize: 18, color: '#ED6A5A', mr: 1 }} />
                        <Typography sx={{ fontFamily: '"Nunito", sans-serif' }}>{formatDate(activity.date)}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <MuiIcons.LocationOn sx={{ fontSize: 18, color: '#ED6A5A', mr: 1 }} />
                        <Typography sx={{ fontFamily: '"Nunito", sans-serif' }}>
                            {activity.address?.street || activity.address?.city}
                        </Typography>
                    </Box>
                    {/* Participants */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MuiIcons.Group sx={{ fontSize: 18, color: '#ED6A5A', mr: 1 }} />
                        <Typography sx={{ fontFamily: '"Nunito", sans-serif' }}>
                            {registeredCount}/{activity.participants || 0} participants
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {participantsList.map((uid) => (
                            <Avatar
                                onClick={() => navigate(`/user/profile/${uid}`)}
                                key={uid}
                                src={getUserAvatarUrl(uid)}
                                sx={{ width: 36, height: 36, border: '2px solid #3454D1' }}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: '"Nunito", sans-serif' }}>
                        Détail de l'annonce
                    </Typography>
                    <Typography sx={{ color: '#333', mb: 3, fontFamily: '"Nunito", sans-serif' }}>
                        {activity.description || 'Aucune description disponible.'}
                    </Typography>

                    {/* Avis — uniquement si activité terminée */}
                    {isPast && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700, color: '#ED6A5A', mr: 1, fontFamily: '"Nunito", sans-serif' }}
                                >
                                    {averageNote.toFixed(1)}/5
                                </Typography>
                                <Rating value={averageNote} precision={0.5} readOnly />
                                <Typography sx={{ ml: 1, color: '#555', fontFamily: '"Nunito", sans-serif' }}>
                                    {avis.length} avis
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                onClick={() => setShowAvis(!showAvis)}
                                startIcon={<MuiIcons.RateReview />}
                                sx={{
                                    bgcolor: '#ED6A5A',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontFamily: '"Nunito", sans-serif',
                                    mb: 2,
                                    '&:hover': { bgcolor: '#d45a4a' },
                                }}
                            >
                                {showAvis ? 'Masquer les avis' : 'Voir les avis'}
                            </Button>

                            {showAvis && (
                                <Box sx={{ mt: 1 }}>
                                    {avis.length === 0 ? (
                                        <Typography sx={{ color: '#777', fontFamily: '"Nunito", sans-serif' }}>
                                            Aucun avis pour le moment.
                                        </Typography>
                                    ) : (
                                        avis.map((a) => (
                                            <Box key={a.id} sx={{ mt: 2 }}>
                                                <Box
                                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar src={a.user?.photoUrl} sx={{ width: 32, height: 32, mr: 1 }} />
                                                        <Typography sx={{ fontWeight: 600, fontFamily: '"Nunito", sans-serif' }}>
                                                            {a.user?.displayName || 'Utilisateur'}
                                                        </Typography>
                                                    </Box>
                                                    <Rating value={a.note} readOnly size="small" />
                                                </Box>
                                                {a.comment && (
                                                    <Typography sx={{ color: '#444', fontFamily: '"Nunito", sans-serif' }}>
                                                        {a.comment}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            {/* Boutons favoris / inscription */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 15, maxWidth: 420, mx: 'auto' }}>
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
                        fontFamily: '"Nunito", sans-serif',
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
                    disabled={actionLoading || isPast || isFull}
                    sx={{
                        bgcolor: isRegistered ? '#3454D1' : '#ED6A5A',
                        color: 'white',
                        borderRadius: 3,
                        py: 1,
                        fontWeight: 600,
                        fontFamily: '"Nunito", sans-serif',
                        textTransform: 'none',
                        '&:hover': { bgcolor: isRegistered ? '#2140ba' : '#d45a4a' },
                    }}
                >
                    {isPast ? 'Activité terminée' : isFull ? 'Complet' : isRegistered ? 'Inscrit ✓' : "S'inscrire"}
                </Button>
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: '130px' }}
            >
                <Alert severity={snackbarSeverity} sx={{ width: '100%', fontFamily: '"Nunito", sans-serif' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ActivityDetail
