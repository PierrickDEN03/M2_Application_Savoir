// FILE: src/pages/SendMessage.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Avatar, CircularProgress } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { auth } from '../../../firebase-config'
import { fetchUserById } from '../../../services/userService'
import { sendMessage, listenToMessages } from '../../../services/messagesService'
import MessageBubble from '../../../components/messagerie/MessageBubble'
import MessageInput from '../../../components/messagerie/MessageInput'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

export default function SendMessage() {
    const { idUser } = useParams()
    const navigate = useNavigate()
    const currentUser = auth.currentUser
    const messagesEndRef = useRef(null)

    const [recipient, setRecipient] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

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
                const userData = await fetchUserById(idUser)
                if (!userData) {
                    console.error('Utilisateur non trouvé')
                    navigate('/user/dashboard')
                    return
                }
                setRecipient(userData)
                setLoading(false)
            } catch (error) {
                console.error('Erreur lors du chargement:', error)
                setLoading(false)
            }
        }

        loadData()

        const unsubscribe = listenToMessages(currentUser.uid, idUser, (msgs) => {
            setMessages(msgs)
        })

        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [idUser, currentUser, navigate])

    const handleSendMessage = async (text) => {
        if (!text.trim() || sending) return

        setSending(true)
        try {
            await sendMessage(currentUser.uid, idUser, text)
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
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
                    bgcolor: '#B2DDF7',
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#B2DDF7',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <AvatarPlaceholder />
            <Box
                sx={{
                    bgcolor: '#B2DDF7',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    onClick={() => navigate(-1)}
                    sx={{
                        cursor: 'pointer',
                        color: '#1a1a1a',
                    }}
                >
                    <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Back</Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    bgcolor: '#F0E7D6',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Avatar
                    src={recipient?.photoUrl || '/avatar_default.jpg'}
                    sx={{
                        width: 48,
                        height: 48,
                        border: '2px solid #3454D1',
                    }}
                />
                <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {recipient?.displayName || recipient?.firstName || 'Utilisateur'}
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    bgcolor: '#F0E7D6',
                    px: 2,
                    pb: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: '#ED6A5A',
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Contacter {recipient?.displayName || 'Utilisateur'}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: '#666',
                        display: 'block',
                    }}
                >
                    Nouveau contact
                </Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    bgcolor: '#F0E7D6',
                    overflowY: 'auto',
                    pb: 10,
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
