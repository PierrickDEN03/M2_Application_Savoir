// FILE: src/components/dashboard/MyInscriptions.jsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, Collapse, IconButton, CircularProgress } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useLoadGooglePlaces from '../../google_api/useLoadGooglePlaces'
import { getCategoryImage } from '../../../services/categoriesService'
import { calculateDistance } from '../../../services/distanceService'
import { getUserReservations, removeReservation } from '../../../services/reservationsService'
import { fetchActivityById } from '../../../services/activitiesService'
import { fetchCategoryById } from '../../../services/categoriesService'

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

function InscriptionCard({ reservation, onRemove }) {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const [distance, setDistance] = useState('...')
    const googleLoaded = useLoadGooglePlaces()

    const activity = reservation.activity
    const category = reservation.category
    const categoryColor = category?.color || '#E74C3C'
    const CategoryIcon = category?.iconName ? iconMap[category.iconName] : null

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

    const handleRemoveInscription = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir annuler votre inscription ?')) {
            try {
                await removeReservation(reservation.id)
                onRemove(reservation.id)
            } catch (error) {
                console.error('Erreur lors de la suppression:', error)
            }
        }
    }

    return (
        <Box
            sx={{
                width: '100%',
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
                        src={getCategoryImage(category.description)}
                        alt={activity.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            console.log(getCategoryImage(category.description))
                            console.log(category.description)
                            console.log(e)
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
                                {activity.address?.city || 'Lieu inconnu'} • {distance}
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
                            {category?.description || 'Sport'}
                        </Box>
                    </Box>
                </Box>

                {/* Bouton menu */}
                <IconButton
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
                </IconButton>
            </Box>

            {/* Menu déroulant */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ width: '100%', bgcolor: 'white' }}>
                    <Box
                        onClick={() => {
                            navigate(`/activity/${activity.id}/message`)
                            setExpanded(false)
                        }}
                        sx={menuItemStyle}
                    >
                        <Icons.Message sx={{ fontSize: 20, color: '#666' }} />
                        <Typography sx={menuTextStyle}>Envoyer un message à l'organisateur</Typography>
                    </Box>

                    <Box onClick={handleRemoveInscription} sx={menuItemStyle}>
                        <Icons.Cancel sx={{ fontSize: 20, color: '#ff4444' }} />
                        <Typography sx={menuTextStyle}>Annuler mon inscription</Typography>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    )
}

export default function MyInscriptions({ userId }) {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadInscriptions()
    }, [userId])

    const loadInscriptions = async () => {
        try {
            setLoading(true)
            const userReservations = await getUserReservations(userId)
            const enrichedReservations = []

            for (const reservation of userReservations) {
                const activity = await fetchActivityById(reservation.activityId)

                if (activity) {
                    const activityDate = new Date(activity.date)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    if (activityDate >= today) {
                        const category = await fetchCategoryById(activity.categoryId)
                        enrichedReservations.push({
                            ...reservation,
                            activity,
                            category,
                        })
                    }
                }
            }

            setReservations(enrichedReservations)
        } catch (error) {
            console.error('Erreur lors du chargement des inscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveReservation = (reservationId) => {
        setReservations(reservations.filter((r) => r.id !== reservationId))
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        )
    }

    if (reservations.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>Aucune inscription pour le moment</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {reservations.map((reservation) => (
                <InscriptionCard key={reservation.id} reservation={reservation} onRemove={handleRemoveReservation} />
            ))}
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
