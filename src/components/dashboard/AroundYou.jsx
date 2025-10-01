// FILE: src/components/AroundYou.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent, Button } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

export default function AroundYou({ activities }) {
    const navigate = useNavigate()

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
                    bgcolor: 'white',
                    borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#3454D1',
                            fontWeight: 600,
                            mb: 2,
                        }}
                    >
                        Activités autour de toi
                    </Typography>

                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <Box
                                key={activity.id}
                                onClick={() => navigate(`/user/activity/${activity.id}`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: index < activities.length - 1 ? 2 : 0,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.7,
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
                                                sx: { fontSize: 24, color: '#3454D1' },
                                            })}
                                        </Box>
                                    )}
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>{activity.title}</Typography>
                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                            {activity.address?.city}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MuiIcons.Schedule sx={{ color: '#666', fontSize: 18 }} />
                                    <Typography sx={{ color: '#1a1a1a', fontWeight: 500 }}>{formatTime(activity.date)}</Typography>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                            Aucune activité à proximité pour le moment
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        endIcon={<MuiIcons.ArrowForward />}
                        onClick={() => navigate('/user/search-activity')}
                        sx={{
                            mt: 2,
                            color: '#3454D1',
                            textTransform: 'none',
                            fontWeight: 600,
                            justifyContent: 'flex-end',
                        }}
                    >
                        Plus d'activités
                    </Button>
                </CardContent>
            </Card>
        </Box>
    )
}
