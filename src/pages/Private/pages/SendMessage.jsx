import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, CircularProgress } from '@mui/material'
import { auth, db } from '../../../firebase-config'
import { fetchUserById } from '../../../services/userService'
import { fetchActivityById } from '../../../services/activitiesService'
import { sendMessage, listenToMessages } from '../../../services/messagesService'
import { getOrCreateActivityConversation, listenToActivityMessages, sendActivityMessage } from '../../../services/conversationsService'
import { collection, getDocs, query, where } from 'firebase/firestore'
import MessageBubble from '../../../components/messagerie/MessageBubble'
import MessageInput from '../../../components/messagerie/MessageInput'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

export default function SendMessage() {
    const { idUser, activityId } = useParams()
    const navigate = useNavigate()
    const currentUser = auth.currentUser
    const messagesEndRef = useRef(null)

    const [recipient, setRecipient] = useState(null)
    const [activity, setActivity] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [conversationId, setConversationId] = useState(null)
    const [participants, setParticipants] = useState([])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }

        const loadData = async () => {
            try {
                // 🔹 Message privé
                if (idUser) {
                    const userData = await fetchUserById(idUser)
                    if (!userData) {
                        navigate('/user/dashboard')
                        return
                    }

                    setRecipient(userData)
                    setLoading(false)

                    const unsubscribe = listenToMessages(currentUser.uid, idUser, (msgs) => setMessages(msgs))
                    return () => unsubscribe && unsubscribe()
                }

                // 🔹 Conversation d'activité
                if (activityId) {
                    // Récupérer les infos de l'activité
                    const activityData = await fetchActivityById(activityId)
                    if (activityData) {
                        setActivity(activityData)
                    }

                    const reservationsRef = collection(db, 'reservations')
                    const q = query(reservationsRef, where('activityId', '==', activityId))
                    const snapshot = await getDocs(q)

                    const participantIds = snapshot.docs.map((doc) => doc.data().userId)
                    const convId = await getOrCreateActivityConversation(activityId, participantIds, currentUser.uid)

                    setConversationId(convId)
                    setParticipants(participantIds)
                    setLoading(false)

                    const unsubscribe = listenToActivityMessages(convId, (msgs) => setMessages(msgs))
                    return () => unsubscribe && unsubscribe()
                }
            } catch (error) {
                console.error('Erreur lors du chargement:', error)
                setLoading(false)
            }
        }

        loadData()
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
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#B2DDF7' }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        )
    }

    const isGroupChat = Boolean(activityId)

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#B2DDF7', display: 'flex', flexDirection: 'column' }}>
            <AvatarPlaceholder />

            {/* Header */}
            <Box sx={{ bgcolor: '#B2DDF7', p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography onClick={() => navigate(-1)} sx={{ cursor: 'pointer', color: '#1a1a1a', fontWeight: 600, fontSize: 16 }}>
                    ← Retour
                </Typography>
            </Box>

            {/* Conversation Header */}
            <Box sx={{ bgcolor: '#B2DDF7', p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                {isGroupChat ? (
                    <>
                        <Avatar src={'/activity_group_icon.png'} sx={{ width: 48, height: 48, border: '2px solid #3454D1' }} />
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {activity?.title || "Discussion de l'activité"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                {participants.length} participant{participants.length > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <Avatar
                            src={recipient?.photoUrl || '/avatar_default.jpg'}
                            sx={{ width: 48, height: 48, border: '2px solid #3454D1' }}
                        />
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {recipient?.displayName || recipient?.firstName || 'Utilisateur'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                Conversation privée
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, bgcolor: '#B2DDF7', overflowY: 'auto', pb: 10 }}>
                {messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center' }}>
                            Aucun message. Commencez la conversation !
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => (
                        <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUser.uid} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </Box>

            <MessageInput onSend={handleSendMessage} disabled={sending} />
        </Box>
    )
}
