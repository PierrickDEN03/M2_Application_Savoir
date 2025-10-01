// FILE: src/components/Favoris.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

export default function Favoris({ favorites }) {
    const navigate = useNavigate()

    if (favorites.length === 0) return null

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    const getIconComponent = (iconName) => {
        const IconComponent = MuiIcons[iconName] || MuiIcons.ShoppingCart
        return IconComponent
    }

    return (
        <Box sx={{ px: 3, mb: 3 }}>
            <Card
                sx={{
                    bgcolor: '#ED6A5A',
                    borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <MuiIcons.Favorite sx={{ color: 'white', fontSize: 28 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'white',
                                fontWeight: 600,
                            }}
                        >
                            Mes Envies
                        </Typography>
                    </Box>

                    {favorites.map((activity, index) => (
                        <Box
                            key={activity.id}
                            onClick={() => navigate(`/user/activity/${activity.id}`)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: index < favorites.length - 1 ? 1.5 : 0,
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {activity.category && (
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {React.createElement(getIconComponent(activity.category.iconName), {
                                            sx: { fontSize: 24, color: 'white' },
                                        })}
                                    </Box>
                                )}
                                <Typography sx={{ color: 'white', fontWeight: 600 }}>{activity.title}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MuiIcons.Schedule sx={{ color: 'white', fontSize: 20 }} />
                                <Typography sx={{ color: 'white', fontWeight: 600 }}>{formatTime(activity.date)}</Typography>
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Box>
    )
}
