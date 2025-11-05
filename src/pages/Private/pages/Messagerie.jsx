import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConversations } from '../../../services/messagesService'
import { getUserActivityConversations } from '../../../services/conversationsService'
import { fetchActivityById } from '../../../services/activitiesService'
import ContactItem from '../../../components/messagerie/ContactItem'
import ActivityContactItem from '../../../components/messagerie/ActivityContactItem'
import { getAuth } from 'firebase/auth'
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

function Messagerie() {
    const [privateContacts, setPrivateContacts] = useState([])
    const [groupConversations, setGroupConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const auth = getAuth()
    const currentUser = auth.currentUser

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                if (!currentUser) {
                    navigate('/login')
                    return
                }

                // 🔹 Récupérer les conversations privées
                const privateConvs = await getConversations(currentUser.uid)
                setPrivateContacts(privateConvs)

                // 🔹 Récupérer les conversations de groupe
                const groupConvs = await getUserActivityConversations(currentUser.uid)

                // 🔹 Enrichir avec les infos des activités
                const enrichedGroupConvs = await Promise.all(
                    groupConvs.map(async (conv) => {
                        try {
                            const activity = await fetchActivityById(conv.activityId)
                            return {
                                ...conv,
                                activityTitle: activity?.title || 'Activité sans titre',
                                activityCategory: activity?.category || 'Autres',
                                activityDate: activity?.date || null,
                            }
                        } catch (error) {
                            console.error(`Erreur chargement activité ${conv.activityId}:`, error)
                            return {
                                ...conv,
                                activityTitle: 'Activité',
                                activityCategory: 'Autres',
                            }
                        }
                    })
                )

                setGroupConversations(enrichedGroupConvs)
            } catch (error) {
                console.error('Erreur lors du chargement des conversations :', error)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [currentUser, navigate])

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e4eff6',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    const hasNoConversations = privateContacts.length === 0 && groupConversations.length === 0

    return (
        <Box sx={{ backgroundColor: '#e4eff6', minHeight: '100vh', p: 3 }}>
            <AvatarPlaceholder />

            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                    color: '#3454D1',
                    fontWeight: 600,
                    fontFamily: '"All Round Gothic Semi", sans-serif',
                    textTransform: 'none',
                    mb: 2,
                }}
            >
                Retour
            </Button>

            <Typography
                variant="h4"
                sx={{
                    color: '#3454D1',
                    fontWeight: 'bold',
                    fontFamily: '"All Round Gothic Semi", sans-serif',
                    mb: 4,
                }}
            >
                Messagerie
            </Typography>

            {hasNoConversations ? (
                <Typography
                    sx={{
                        textAlign: 'center',
                        color: '#3454D1',
                        fontWeight: 500,
                        fontFamily: '"Nunito", sans-serif',
                        mt: 8,
                    }}
                >
                    Aucune conversation pour le moment.
                </Typography>
            ) : (
                <Stack spacing={4}>
                    {/* 🔹 Conversations de groupe */}
                    {groupConversations.length > 0 && (
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#3454D1',
                                    fontWeight: 600,
                                    mb: 2,
                                    display: 'flex',
                                    fontFamily: '"All Round Gothic Semi", sans-serif',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <GroupIcon /> Discussions de groupe
                            </Typography>
                            <Stack spacing={2}>
                                {groupConversations.map((conv) => (
                                    <ActivityContactItem
                                        key={conv.id}
                                        conversation={conv}
                                        onClick={() => navigate(`/user/activity-message/${conv.activityId}`)}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* 🔹 Conversations privées */}
                    {privateContacts.length > 0 && (
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#3454D1',
                                    fontFamily: '"All Round Gothic Semi", sans-serif',
                                    fontWeight: 600,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <PersonIcon /> Messages privés
                            </Typography>
                            <Stack spacing={2}>
                                {privateContacts.map((contactId) => (
                                    <ContactItem
                                        key={contactId}
                                        contactId={contactId}
                                        onClick={() => navigate(`/user/send-message/${contactId}`)}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
    )
}

export default Messagerie
