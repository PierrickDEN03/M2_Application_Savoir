import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, Chip, Button, CircularProgress, Stack } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { fetchUserById } from '../../../services/userService'
import { getUserInterests } from '../../../services/categoriesService'
import { fetchActivitiesFromDB } from '../../../services/activitiesService'
import { getUserReservations } from '../../../services/reservationsService'
import { UserContext } from '../../../context/userContext'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'
import ActivityCard from '../../../components/utils/ActivityCard'
import LogOut from '../../../components/utils/LogOut'

export default function UserProfile() {
    const { idUser } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useContext(UserContext)

    const [user, setUser] = useState(null)
    const [interests, setInterests] = useState([])
    const [userActivities, setUserActivities] = useState([])
    const [upcomingActivities, setUpcomingActivities] = useState([])
    const [pastActivities, setPastActivities] = useState([])
    const [userReservations, setUserReservations] = useState(0)
    const [loading, setLoading] = useState(true)

    const isOwnProfile = currentUser && currentUser.uid === idUser

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const userData = await fetchUserById(idUser)
                if (!userData) {
                    console.error('Utilisateur non trouvé')
                    navigate('/user/dashboard')
                    return
                }
                setUser(userData)

                const userInterests = await getUserInterests(idUser)
                setInterests(userInterests)

                const allActivities = await fetchActivitiesFromDB()
                const activities = allActivities.filter((act) => act.createdBy === idUser || act.userId === idUser)
                setUserActivities(activities)

                const now = new Date()
                const upcoming = activities.filter((act) => new Date(act.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))
                const past = activities.filter((act) => new Date(act.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date))

                setUpcomingActivities(upcoming)
                setPastActivities(past)

                if (currentUser && currentUser.uid === idUser) {
                    const reservations = await getUserReservations(idUser)
                    setUserReservations(reservations.length)
                }
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error)
            } finally {
                setLoading(false)
            }
        }

        if (idUser) loadUserProfile()
    }, [idUser, navigate, currentUser])

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

    if (!user) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#E4EFF6', p: 3 }}>
                <Typography>Utilisateur non trouvé</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#E4EFF6', pb: 10 }}>
            {/* Header */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box
                    onClick={() => navigate(-1)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#3454D1' }}
                >
                    <MuiIcons.ArrowBack sx={{ fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Back</Typography>
                </Box>
            </Box>

            {/* Profil utilisateur */}
            <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={user.photoUrl || '/avatar_default.jpg'}
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid #3454D1',
                            mb: 2,
                        }}
                    />
                    <Typography variant="h4" sx={{ color: '#3454D1', fontWeight: 700, mb: 1, textAlign: 'center' }}>
                        {user.displayName || user.firstName || 'Utilisateur'}
                    </Typography>

                    {/* Stats utilisateur */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                                {userActivities.length}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                activités
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                                {userReservations}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                rencontres
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                                0
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                recommandations
                            </Typography>
                        </Box>
                    </Box>

                    {/* Boutons */}
                    {isOwnProfile ? (
                        <Stack direction="row" spacing={2}>
                            <AvatarPlaceholder />
                            <Button
                                variant="outlined"
                                startIcon={<MuiIcons.Edit />}
                                onClick={() => navigate(`/user/modif-profile/${idUser}`)}
                                sx={{
                                    borderColor: '#3454D1',
                                    color: '#3454D1',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        borderColor: '#3454D1',
                                        bgcolor: 'rgba(52, 84, 209, 0.05)',
                                    },
                                }}
                            >
                                Modifier
                            </Button>
                            <LogOut />
                        </Stack>
                    ) : (
                        <Button
                            variant="contained"
                            startIcon={<MuiIcons.Message />}
                            onClick={() => navigate(`/user/send-message/${idUser}`)}
                            sx={{
                                bgcolor: '#ED6A5A',
                                color: 'white',
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: '#d45a4a',
                                },
                            }}
                        >
                            Envoyer un message
                        </Button>
                    )}
                </Box>

                {/* À propos de moi */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                        À propos de moi
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1a1a1a', lineHeight: 1.6 }}>
                        {user.description || 'Aucune description pour le moment...'}
                    </Typography>
                </Box>

                {/* Centres d'intérêt */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                        Mes centres d'intérêt
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {interests.length > 0 ? (
                            interests.map((interest) => {
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
                                            border: 'none',
                                            p: 1,
                                            '& .MuiChip-icon': { color: interest.color },
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

                {/* Activités à venir */}
                {upcomingActivities.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#3454D1' }}>
                            Activités
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: '#1a1a1a', mb: 1 }}>
                            Prochaines
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {upcomingActivities.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Activités passées */}
                {pastActivities.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" sx={{ color: '#1a1a1a', mb: 1 }}>
                            Passées
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {pastActivities.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
