// FILE: src/components/ActivityCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Box, Typography } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'

function ActivityCard({ activity, category, variant = 'default' }) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/user/activity/${activity.id}`)
    }
    // Fonction pour formater l'heure
    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}h${minutes}`
    }

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear().toString().slice(2)
        return `${day}/${month}/${year}`
    }

    // Récupérer l'icône
    const getIconComponent = (iconName) => {
        const IconComponent = MuiIcons[iconName] || MuiIcons.ShoppingCart
        return IconComponent
    }

    const IconComponent = category ? getIconComponent(category.iconName) : MuiIcons.ShoppingCart

    // Styles selon la variante
    const isTonight = variant === 'tonight'
    const cardBgColor = isTonight ? '#B2DDF7' : 'white'
    const iconBgColor = isTonight ? 'white' : category?.color || '#3454D1'
    const iconColor = isTonight ? '#3454D1' : 'white'

    return (
        <Card
            onClick={handleClick}
            sx={{
                mb: 1.5,
                bgcolor: cardBgColor,
                borderRadius: 2,
                boxShadow: isTonight ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: isTonight ? '0 2px 8px rgba(52, 84, 209, 0.15)' : '0 4px 12px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    '&:last-child': { pb: 2 },
                }}
            >
                {/* Icône */}
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: iconBgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        flexShrink: 0,
                    }}
                >
                    <IconComponent sx={{ fontSize: 20, color: iconColor }} />
                </Box>

                {/* Contenu */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 600,
                            color: '#1a1a1a',
                            mb: isTonight ? 0 : 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {activity.title}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                        }}
                    >
                        {activity.address?.city || 'Lieu non spécifié'}
                    </Typography>
                </Box>

                {/* Date et heure */}
                {isTonight ? (
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: '#1a1a1a',
                            ml: 2,
                            flexShrink: 0,
                        }}
                    >
                        {formatTime(activity.date)}
                    </Typography>
                ) : (
                    <Box sx={{ textAlign: 'right', ml: 2, flexShrink: 0 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#666',
                                display: 'block',
                            }}
                        >
                            {formatDate(activity.date)}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: '#1a1a1a',
                            }}
                        >
                            {formatTime(activity.date)}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

export default ActivityCard
