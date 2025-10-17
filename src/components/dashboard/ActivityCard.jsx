// FILE: src/components/dashboard/ActivityCard.jsx
import React from 'react'
import { Box, Typography } from '@mui/material'
import {
    LocationOn,
    Settings,
    Message,
    Cancel,
    SportsBaseball,
    MusicNote,
    EmojiPeople,
    Restaurant,
    Build,
    Palette,
    MenuBook,
    TheaterComedy,
    DirectionsRun,
    ShoppingCart,
    VideogameAsset,
    Hiking,
    Pool,
    MoreHoriz,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Mapping des icônes Material UI
const iconMap = {
    SportsBaseball: SportsBaseball,
    MusicNote: MusicNote,
    EmojiPeople: EmojiPeople,
    Restaurant: Restaurant,
    Build: Build,
    Palette: Palette,
    MenuBook: MenuBook,
    TheaterComedy: TheaterComedy,
    DirectionsRun: DirectionsRun,
    ShoppingCart: ShoppingCart,
    VideogameAsset: VideogameAsset,
    Hiking: Hiking,
    Pool: Pool,
    MoreHoriz: MoreHoriz,
}

export default function ActivityCard({ activity, type = 'myActivity' }) {
    const navigate = useNavigate()
    const [showActions, setShowActions] = React.useState(false)

    // Formater la date
    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        const formattedDate = date.toLocaleDateString('fr-FR', options)
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        return `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} • ${time}`
    }

    // Calculer la distance
    const getDistance = () => {
        if (activity.address?.distance) {
            return `${activity.address.distance}km`
        }
        return '0.3km'
    }

    const handleCardClick = () => {
        if (type === 'myActivity' && !showActions) {
            navigate(`/activity/${activity.id}`)
        }
    }

    // Récupérer l'icône de la catégorie
    const CategoryIcon = activity.category?.iconName ? iconMap[activity.category.iconName] : null

    return (
        <>
            <Box
                onClick={handleCardClick}
                sx={{
                    bgcolor: 'white',
                    borderRadius: 3,
                    p: 2,
                    mb: showActions ? 0 : 2,
                    display: 'flex',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderBottomLeftRadius: showActions ? 0 : 3,
                    borderBottomRightRadius: showActions ? 0 : 3,
                    position: 'relative',
                    '&:hover': {
                        transform: showActions ? 'none' : 'translateY(-2px)',
                        boxShadow: showActions ? '0 2px 8px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.12)',
                    },
                }}
            >
                {/* Image */}
                <Box
                    sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        flexShrink: 0,
                        bgcolor: '#f5f5f5',
                    }}
                >
                    {activity.imageUrl ? (
                        <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: activity.category?.color || '#3454D1',
                            }}
                        >
                            <Typography
                                sx={{
                                    color: 'white',
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                }}
                            >
                                {activity.title?.[0]?.toUpperCase() || '?'}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Contenu */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Date */}
                    <Typography
                        sx={{
                            fontSize: '0.75rem',
                            color: '#7a7a7a',
                            mb: 0.3,
                            fontWeight: 400,
                            fontFamily: 'Roboto, sans-serif',
                        }}
                    >
                        {formatDate(activity.date)}
                    </Typography>

                    {/* Titre */}
                    <Typography
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: '#1a1a1a',
                            mb: 0.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: 'Roboto, sans-serif',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {activity.title || 'Activité sans titre'}
                    </Typography>

                    {/* Description courte */}
                    {activity.description && (
                        <Typography
                            sx={{
                                fontSize: '0.85rem',
                                color: '#7a7a7a',
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 400,
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            {activity.description}
                        </Typography>
                    )}

                    {/* Localisation */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn sx={{ fontSize: '0.95rem', color: '#b0b0b0' }} />
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: '#7a7a7a',
                                fontWeight: 400,
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            {activity.address?.city || 'Lyon'}{' '}
                            {activity.address?.postalCode ? `${activity.address.postalCode.slice(0, 2)}e` : '6e'} • {getDistance()}
                        </Typography>
                    </Box>

                    {/* Badge catégorie */}
                    {activity.category && (
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: activity.category.color,
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 20,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFamily: 'Roboto, sans-serif',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {CategoryIcon && <CategoryIcon sx={{ fontSize: '1rem', color: 'white' }} />}
                            {activity.category.description || 'Activité'}
                        </Box>
                    )}
                </Box>

                {/* Icône paramètres */}
                {type === 'myActivity' && (
                    <Box
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowActions(!showActions)
                        }}
                        sx={{
                            flexShrink: 0,
                            cursor: 'pointer',
                            p: 0.5,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.05)',
                            },
                        }}
                    >
                        <Settings sx={{ fontSize: '1.35rem', color: '#1a1a1a' }} />
                    </Box>
                )}
            </Box>

            {/* Menu d'actions */}
            {showActions && type === 'myActivity' && (
                <Box
                    sx={{
                        bgcolor: 'white',
                        borderBottomLeftRadius: 3,
                        borderBottomRightRadius: 3,
                        mb: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Envoyer un message */}
                    <Box
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/activity/${activity.id}/message`)
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            borderTop: '1px solid #f0f0f0',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.03)',
                            },
                        }}
                    >
                        <Message sx={{ fontSize: '1.5rem', color: '#1a1a1a' }} />
                        <Typography
                            sx={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            Envoyer un message à tous les participants
                        </Typography>
                    </Box>

                    {/* Annuler l'activité */}
                    <Box
                        onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('Êtes-vous sûr de vouloir annuler cette activité ?')) {
                                // Logique d'annulation ici
                                console.log('Annuler activité:', activity.id)
                            }
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            borderTop: '1px solid #f0f0f0',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.03)',
                            },
                        }}
                    >
                        <Cancel sx={{ fontSize: '1.5rem', color: '#ff5252' }} />
                        <Typography
                            sx={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            Annuler l'activité
                        </Typography>
                    </Box>

                    {/* Modifier l'activité */}
                    <Box
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/activity/${activity.id}/edit`)
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            borderTop: '1px solid #f0f0f0',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.03)',
                            },
                        }}
                    >
                        <Settings sx={{ fontSize: '1.5rem', color: '#1a1a1a' }} />
                        <Typography
                            sx={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            Modifier l'activité
                        </Typography>
                    </Box>
                </Box>
            )}
        </>
    )
}
