// FILE: src/components/messagerie/MessageBubble.jsx
import React, { useState, useEffect } from 'react'
import { Box, Typography, Avatar } from '@mui/material'
import { fetchUserById, getUserAvatarUrl } from '../../services/userService'

export default function MessageBubble({ message, isOwn, isGroupChat }) {
    const [senderData, setSenderData] = useState(null)

    useEffect(() => {
        const loadSender = async () => {
            if (!message.senderId) {
                return
            }

            try {
                const userData = await fetchUserById(message.senderId)
                setSenderData(userData)
            } catch (error) {
                console.error('Erreur chargement utilisateur:', error)
            }
        }

        // Charger les données même pour les messages propres en mode groupe
        if (isGroupChat || !isOwn) {
            loadSender()
        }
    }, [message.senderId, isOwn, isGroupChat])

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const senderName = senderData?.displayName || senderData?.firstName || 'Utilisateur'
    const senderPhoto = getUserAvatarUrl(message.senderId)

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 2,
                alignItems: 'flex-start',
                gap: 1,
            }}
        >
            {/* Avatar à gauche pour les messages des autres */}
            {!isOwn && (
                <Avatar
                    src={senderPhoto}
                    sx={{
                        width: 32,
                        height: 32,
                        mt: 0.5,
                        ml: 2,
                    }}
                />
            )}

            <Box sx={{ maxWidth: '70%' }}>
                {/* Nom de l'expéditeur pour les messages des autres ou en groupe */}
                {(!isOwn || isGroupChat) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                color: '#1a1a1a',
                                fontFamily: '"Nunito", sans-serif',
                            }}
                        >
                            {senderName}
                        </Typography>
                        {isOwn && (
                            <Box
                                sx={{
                                    bgcolor: '#FFE4E1',
                                    color: '#FF6B6B',
                                    fontFamily: '"Nunito", sans-serif',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 2,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                }}
                            >
                                Vous
                            </Box>
                        )}
                    </Box>
                )}

                {/* Bulle de message */}
                <Box
                    sx={{
                        bgcolor: isOwn ? '#E3F2FD' : '#F5F5F5',
                        color: '#1a1a1a',
                        borderRadius: 3,
                        p: 1.5,
                        position: 'relative',
                        ml: isOwn ? 2 : 0,
                        mr: isOwn ? 2 : 0,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            wordBreak: 'break-word',
                            lineHeight: 1.5,
                            fontFamily: '"Nunito", sans-serif',
                        }}
                    >
                        {message.text}
                    </Typography>
                </Box>

                {/* Heure en bas */}
                <Typography
                    variant="caption"
                    sx={{
                        color: '#999',
                        fontSize: '0.7rem',
                        fontFamily: '"Nunito", sans-serif',
                        display: 'block',
                        mt: 0.5,
                        textAlign: isOwn ? 'right' : 'left',
                        ml: isOwn ? 2 : 0,
                        mr: isOwn ? 2 : 0,
                    }}
                >
                    {formatTime(message.createdAt)}
                </Typography>
            </Box>
        </Box>
    )
}
