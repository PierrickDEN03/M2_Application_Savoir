// FILE: src/components/messagerie/MessageInput.jsx
import React, { useState } from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

export default function MessageInput({ onSend, disabled = false }) {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim())
            setMessage('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: '#ffffff',
                p: 2,
                pb: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                zIndex: 10,
            }}
        >
            <TextField
                fullWidth
                multiline
                maxRows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrire un message..."
                disabled={disabled}
                sx={{
                    bgcolor: 'white',
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '& fieldset': {
                            borderColor: '#1a1a1a',
                            borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                            borderColor: '#3454D1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3454D1',
                        },
                    },
                }}
            />

            <IconButton
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                sx={{
                    bgcolor: '#ed6a51',
                    color: 'white',
                    width: 48,
                    height: 48,
                    '&:hover': {
                        bgcolor: '#cc533bff',
                    },
                    '&.Mui-disabled': {
                        bgcolor: '#ccc',
                        color: 'white',
                    },
                }}
            >
                <MuiIcons.Send />
            </IconButton>
        </Box>
    )
}
