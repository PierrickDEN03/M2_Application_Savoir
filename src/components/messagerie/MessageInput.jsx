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
                bottom: 100,
                left: 0,
                right: 0,
                bgcolor: '#F0E7D6',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderTop: '1px solid rgba(0,0,0,0.1)',
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
                            border: 'none',
                        },
                    },
                }}
            />
            <IconButton
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                sx={{
                    bgcolor: '#3454D1',
                    color: 'white',
                    width: 48,
                    height: 48,
                    '&:hover': {
                        bgcolor: '#2a43a8',
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
