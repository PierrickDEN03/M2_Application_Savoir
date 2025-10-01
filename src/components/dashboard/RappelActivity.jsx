// FILE: src/components/RappelActivity.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

export default function RappelActivity({ activity }) {
    const navigate = useNavigate()

    if (!activity) return null

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
                onClick={() => navigate(`/user/activity/${activity.id}`)}
                sx={{
                    bgcolor: '#ED6A5A',
                    borderRadius: 3,
                    cursor: 'pointer',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'white',
                            fontWeight: 600,
                            mb: 2,
                        }}
                    >
                        Rappel des activités
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                            <Box>
                                <Typography sx={{ color: 'white', fontWeight: 600 }}>{activity.title}</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {activity.address?.city}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MuiIcons.Schedule sx={{ color: 'white', fontSize: 20 }} />
                            <Typography sx={{ color: 'white', fontWeight: 600 }}>{formatTime(activity.date)}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
