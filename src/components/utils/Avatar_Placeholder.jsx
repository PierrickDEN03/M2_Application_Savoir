// FILE: src/components/AvatarUser.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Avatar } from '@mui/material'
import { fetchUserById } from '../../services/userService'
import { auth } from '../../firebase-config'

export default function AvatarPlaceholder({ userId, size = 48, position = 'absolute', top = 16, right = 16 }) {
    const navigate = useNavigate()
    const [userPhoto, setUserPhoto] = useState(null)
    const [loading, setLoading] = useState(true)

    // Si userId n'est pas fourni, on utilise l'utilisateur connecté
    const currentUser = auth.currentUser
    const targetUserId = userId || currentUser?.uid

    useEffect(() => {
        const loadUserPhoto = async () => {
            if (!targetUserId) {
                setLoading(false)
                return
            }

            try {
                const userData = await fetchUserById(targetUserId)
                if (userData && userData.photoUrl) {
                    setUserPhoto(userData.photoUrl)
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la photo:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUserPhoto()
    }, [targetUserId])

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
                {loading ? (
                    <Box
                        sx={{
                            width: size - 8,
                            height: size - 8,
                            borderRadius: '50%',
                            bgcolor: '#F0E7D6',
                        }}
                    />
                ) : (
                    <Avatar
                        src={userPhoto || '/avatar_default.jpg'}
                        alt="User avatar"
                        sx={{
                            width: size - 8,
                            height: size - 8,
                        }}
                    />
                )}
            </Box>
        </Box>
    )
}
