// FILE: src/components/dashboard/MyActivityCard.jsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, Collapse } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useLoadGooglePlaces from '../../google_api/useLoadGooglePlaces'
import { getCategoryImage } from '../../../services/categoriesService'
import { calculateDistance } from '../../../services/distanceService'

const iconMap = {
    SportsBaseball: Icons.SportsBaseball,
    MusicNote: Icons.MusicNote,
    EmojiPeople: Icons.EmojiPeople,
    Restaurant: Icons.Restaurant,
    Build: Icons.Build,
    Palette: Icons.Palette,
    MenuBook: Icons.MenuBook,
    TheaterComedy: Icons.TheaterComedy,
    DirectionsRun: Icons.DirectionsRun,
    ShoppingCart: Icons.ShoppingCart,
    VideogameAsset: Icons.VideogameAsset,
    Hiking: Icons.Hiking,
    Pool: Icons.Pool,
    MoreHoriz: Icons.MoreHoriz,
}

export default function MyActivityCard({ activity }) {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const [distance, setDistance] = useState('...')
    const [categoryImage, setCategoryImage] = useState(null)
    const googleLoaded = useLoadGooglePlaces()

    const categoryColor = activity.category?.color || '#E74C3C'
    const CategoryIcon = activity.category?.iconName ? iconMap[activity.category.iconName] : null

    useEffect(() => {
        if (activity.category?.description) {
            const imageUrl = getCategoryImage(activity.category.description)
            setCategoryImage(imageUrl)
        }
    }, [activity.category?.description])

    useEffect(() => {
        if (googleLoaded && activity.address?.placeId) {
            calculateDistance(activity.address.placeId, setDistance)
        }
    }, [googleLoaded, activity.address?.placeId])

    const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        const formattedDate = d.toLocaleDateString('fr-FR', options)
        const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        return `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} • ${time}`
    }

    const handleToggle = (e) => {
        e.stopPropagation()
        setExpanded((prev) => !prev)
    }

    const onCardClick = () => {
        setExpanded((prev) => !prev)
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 600,
                minWidth: 300,
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                mb: 1.5,
            }}
        >
            {/* Partie principale cliquable */}
            <Box
                onClick={onCardClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    p: 1.5,
                    py: 2.2,
                    minHeight: 125,
                    width: '100%',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                    transition: 'all 200ms ease',
                }}
            >
                {/* Image de catégorie */}
                <Box
                    sx={{
                        width: 100,
                        height: 130,
                        borderRadius: 2,
                        overflow: 'hidden',
                        flexShrink: 0,
                        mr: 2,
                    }}
                >
                    <img
                        src={categoryImage}
                        alt=""
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement.style.backgroundColor = categoryColor
                        }}
                    />
                </Box>

                {/* Contenu texte */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.9rem', fontWeight: 500, mb: 0.75 }}>
                        {formatDate(activity.date)}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#111',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.75,
                        }}
                    >
                        {activity.title}
                    </Typography>

                    {/* Ligne infos + badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Icons.LocationOn sx={{ fontSize: 16, color: '#666' }} />
                            <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                {activity.address?.city || 'Lyon'} • {distance}
                            </Typography>
                        </Box>

                        <Box
                            component="span"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: categoryColor,
                                color: 'white',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                ml: 'auto',
                                minWidth: 'fit-content',
                            }}
                        >
                            {CategoryIcon && <CategoryIcon sx={{ fontSize: 16, mr: 0.5 }} />}
                            {activity.category?.description || 'Sport'}
                        </Box>
                    </Box>
                </Box>

                {/* Bouton menu */}
                <Box
                    onClick={handleToggle}
                    sx={{
                        p: 0.75,
                        cursor: 'pointer',
                        ml: -3,
                        mr: 1.25,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        flexShrink: 0,
                    }}
                >
                    <Icons.Settings sx={{ fontSize: 20, color: '#666' }} />
                </Box>
            </Box>

            {/* Menu déroulant */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ width: '100%', bgcolor: 'white' }}>
                    <Box onClick={() => navigate(`/user/activity-message/${activity.id}`)} sx={menuItemStyle}>
                        <Icons.Message sx={{ fontSize: 20, color: '#666' }} />
                        <Typography sx={menuTextStyle}>Envoyer un message à tous les participants</Typography>
                    </Box>

                    <Box
                        onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir annuler cette activité ?')) {
                                console.log('Annulation activité:', activity.id)
                            }
                        }}
                        sx={menuItemStyle}
                    >
                        <Icons.Cancel sx={{ fontSize: 20, color: '#ff4444' }} />
                        <Typography sx={menuTextStyle}>Annuler l'activité</Typography>
                    </Box>

                    <Box onClick={() => navigate(`/activity/${activity.id}/edit`)} sx={menuItemStyle}>
                        <Icons.Settings sx={{ fontSize: 20, color: '#666' }} />
                        <Typography sx={menuTextStyle}>Modifier l'activité</Typography>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    )
}

const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: 1.5,
    cursor: 'pointer',
    borderTop: '1px solid #f0f0f0',
    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
}

const menuTextStyle = {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#444',
}
