// FILE: src/components/messagerie/MessageBubble.jsx
import React from 'react'
import { Box, Typography } from '@mui/material'

export default function MessageBubble({ message, isOwn }) {
    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 1.5,
                px: 2,
            }}
        >
            <Box
                sx={{
                    maxWidth: '70%',
                    bgcolor: isOwn ? '#3454D1' : 'white',
                    color: isOwn ? 'white' : '#1a1a1a',
                    borderRadius: 3,
                    p: 1.5,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        wordBreak: 'break-word',
                        mb: 0.5,
                    }}
                >
                    {message.text}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: isOwn ? 'rgba(255,255,255,0.7)' : '#999',
                        fontSize: '0.7rem',
                    }}
                >
                    {formatTime(message.createdAt)}
                </Typography>
            </Box>
        </Box>
    )
}
