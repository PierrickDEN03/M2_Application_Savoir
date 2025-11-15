import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, CircularProgress } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { auth, db } from '../../../firebase-config'
import { fetchUserById, getUserAvatarUrl } from '../../../services/userService'
import { fetchActivityById } from '../../../services/activitiesService'
import { sendMessage, listenToMessages } from '../../../services/messagesService'
import { getOrCreateActivityConversation, listenToActivityMessages, sendActivityMessage } from '../../../services/conversationsService'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getAverageNoteUser } from '../../../services/avisService'
import { getCategoryImage, fetchCategoryById } from '../../../services/categoriesService'
import MessageBubble from '../../../components/messagerie/MessageBubble'
import MessageInput from '../../../components/messagerie/MessageInput'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'
import ActivityCard from '../../../components/utils/ActivityCard'

export default function SendMessage() {
    const { idUser, activityId } = useParams()
    const navigate = useNavigate()
    const currentUser = auth.currentUser
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)

    const [recipient, setRecipient] = useState(null)
    const [activity, setActivity] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [conversationId, setConversationId] = useState(null)
    const [participants, setParticipants] = useState([])
    const [averageRating, setAverageRating] = useState(null)
    const [categoryImage, setCategoryImage] = useState('/avatar_default.png')

    // Fonction de scroll améliorée
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
    }

    // Récupération de l'image selon categoryId
    useEffect(() => {
        const loadCategoryImage = async () => {
            if (activity?.categoryId) {
                const cat = await fetchCategoryById(activity.categoryId)
                if (cat?.description) {
                    const img = getCategoryImage(cat.description)
                    setCategoryImage(img)
                }
            }
        }
        loadCategoryImage()
    }, [activity?.categoryId])

    // Scroll automatique quand les messages changent
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom('smooth')
        }, 100)
        return () => clearTimeout(timer)
    }, [messages])

    // Scroll immédiat au chargement initial
    useEffect(() => {
        if (!loading && messages.length > 0) {
            scrollToBottom('auto')
        }
    }, [loading])

    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }

        let unsubscribe = null

        const loadData = async () => {
            try {
                // 🔹 Charger l'activité si activityId existe
                if (activityId) {
                    const activityData = await fetchActivityById(activityId)
                    if (activityData) {
                        setActivity(activityData)
                    }
                }

                // 🔹 Charger le destinataire si idUser existe (conversation privée)
                if (idUser) {
                    const userData = await fetchUserById(idUser)
                    if (!userData) {
                        navigate('/user/dashboard')
                        return
                    }

                    setRecipient(userData)

                    try {
                        const avg = await getAverageNoteUser(idUser)
                        setAverageRating(avg && avg > 0 ? avg.toFixed(1) : null)
                    } catch (error) {
                        console.error('Erreur lors du chargement de la note:', error)
                        setAverageRating(null)
                    }

                    // Messages privés (1:1)
                    setLoading(false)
                    try {
                        unsubscribe = listenToMessages(currentUser.uid, idUser, (msgs) => {
                            setMessages(msgs)
                        })
                    } catch (error) {
                        console.error('Erreur listener messages privés:', error)
                        setMessages([])
                    }
                    return
                }

                // 🔹 Conversation de groupe (uniquement activityId, pas de idUser)
                if (activityId && !idUser) {
                    const reservationsRef = collection(db, 'reservations')
                    const q = query(reservationsRef, where('activityId', '==', activityId))
                    const snapshot = await getDocs(q)

                    const participantIds = snapshot.docs.map((doc) => doc.data().userId)

                    if (!participantIds.includes(currentUser.uid)) {
                        participantIds.push(currentUser.uid)
                    }

                    const convId = await getOrCreateActivityConversation(activityId, participantIds, currentUser.uid)

                    setConversationId(convId)
                    setParticipants(participantIds)
                    setLoading(false)

                    try {
                        unsubscribe = listenToActivityMessages(convId, (msgs) => {
                            setMessages(msgs)
                        })
                    } catch (error) {
                        console.error('Erreur listener messages activité:', error)
                        setMessages([])
                    }
                    return
                }
            } catch (error) {
                console.error('Erreur lors du chargement:', error)
                setLoading(false)
            }
        }

        loadData()

        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                try {
                    unsubscribe()
                } catch (error) {
                    console.error('Erreur lors du cleanup du listener:', error)
                }
            }
        }
    }, [idUser, activityId, currentUser, navigate])

    const handleSendMessage = async (text) => {
        if (!text.trim() || sending) return
        setSending(true)

        try {
            if (idUser) {
                await sendMessage(currentUser.uid, idUser, text)
            } else if (conversationId) {
                await sendActivityMessage(conversationId, currentUser.uid, text)
            }
            setTimeout(() => scrollToBottom('smooth'), 100)
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
            alert("Erreur lors de l'envoi du message. Vérifiez vos permissions.")
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#e4eff6',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#e4eff6', display: 'flex', flexDirection: 'column' }}>
            <AvatarPlaceholder />

            {/* Header Retour */}
            <Box sx={{ bgcolor: '#e4eff6', p: 2, pb: 4, pt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                    onClick={() => navigate(-1)}
                    sx={{
                        cursor: 'pointer',
                        color: '#3454D1',
                        fontFamily: '"All Round Gothic Semi", sans-serif',
                        fontWeight: 600,
                        fontSize: 16,
                    }}
                >
                    ← Retour
                </Typography>
            </Box>

            {/* Header Conversation */}
            <Box
                sx={{
                    bgcolor: '#ffffff',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }}
            >
                {/* Section Utilisateur ou Groupe */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Avatar et infos utilisateur (si conversation privée) */}
                    {idUser && recipient ? (
                        <>
                            <Avatar src={getUserAvatarUrl(recipient.id)} sx={{ width: 48, height: 48, border: '2px solid #3454D1' }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => navigate(`/user/profile/${idUser}`)}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1a1a1a',
                                            fontFamily: '"Nunito", sans-serif',
                                        }}
                                    >
                                        {recipient?.displayName || recipient?.firstName || 'Utilisateur'}
                                    </Typography>

                                    {averageRating && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                bgcolor: 'white',
                                                border: '1px solid #f28b82',
                                                borderRadius: '50px',
                                                px: 1,
                                                py: 0.2,
                                            }}
                                        >
                                            <StarIcon sx={{ color: '#f28b82', fontSize: 18 }} />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#f28b82',
                                                    fontFamily: '"All Round Gothic Semi", sans-serif',
                                                }}
                                            >
                                                {averageRating}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Typography variant="caption" sx={{ color: '#666', fontFamily: '"Nunito", sans-serif' }}>
                                    Conversation privée
                                </Typography>
                            </Box>
                        </>
                    ) : null}
                </Box>

                {/* Carte d'activité (affichée si activityId existe) */}
                {activityId && activity && (
                    <Box>
                        <ActivityCard activity={activity} />

                        <Typography
                            variant="caption"
                            sx={{ display: 'block', p1: 2, pt: 3, color: '#666', fontFamily: '"Nunito", sans-serif' }}
                        >
                            {participants.length} participant{participants.length > 1 ? 's' : ''}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Zone de messages avec ref et scroll amélioré */}
            <Box
                ref={messagesContainerRef}
                sx={{
                    flex: 1,
                    bgcolor: '#ffffff',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pb: 30,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#888',
                        borderRadius: '4px',
                        '&:hover': {
                            bgcolor: '#555',
                        },
                    },
                }}
            >
                {messages.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            p: 3,
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', fontFamily: '"Nunito", sans-serif' }}>
                            Aucun message. Commencez la conversation !
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUser.uid} />
                        ))}
                        <div ref={messagesEndRef} style={{ height: '1px' }} />
                    </>
                )}
            </Box>

            {/* Input */}
            <MessageInput onSend={handleSendMessage} disabled={sending} />
        </Box>
    )
}
