// FILE: src/components/AvatarUser.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Avatar } from '@mui/material'
import { getUserAvatarUrl } from '../../services/userService'
import { auth } from '../../firebase-config'

export default function AvatarPlaceholder({ userId, size = 48, position = 'absolute', top = 16, right = 16 }) {
    const navigate = useNavigate()

    // Si userId n'est pas fourni, on utilise l'utilisateur connecté
    const currentUser = auth.currentUser
    const targetUserId = userId || currentUser?.uid

    const handleClick = () => {
        if (targetUserId) {
            navigate(`/user/profile/${targetUserId}`)
        }
    }

    return (
        <Box
            onClick={handleClick}
            sx={{
                position: position,
                top: top,
                right: right,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                },
            }}
        >
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #3454D1',
                }}
            >
                <Avatar
                    src={getUserAvatarUrl(targetUserId)}
                    alt="User avatar"
                    sx={{
                        width: size,
                        height: size,
                    }}
                />
            </Box>
        </Box>
    )
}
