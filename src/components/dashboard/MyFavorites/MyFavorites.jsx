// FILE: src/components/dashboard/MyFavorites/MyFavorites.jsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, IconButton } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useLoadGooglePlaces from '../../google_api/useLoadGooglePlaces'
import { getCategoryImage } from '../../../services/categoriesService'
import { calculateDistance } from '../../../services/distanceService'
import { getUserFavorites, removeFavorite, addFavorite } from '../../../services/favorisService'
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

function FavoriteCard({ favorite, onToggleFavorite }) {
    const navigate = useNavigate()
    const [distance, setDistance] = useState('...')
    const [isFavorited, setIsFavorited] = useState(true)
    const googleLoaded = useLoadGooglePlaces()

    const activity = favorite.activity
    const category = favorite.category
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

    const handleToggle = async (e) => {
        e.stopPropagation()
        const newState = await onToggleFavorite(favorite)
        setIsFavorited(newState)
    }

    const handleCardClick = () => {
        navigate(`/user/activity/${activity.id}`)
    }

    return (
        <Box
            onClick={handleCardClick}
            sx={{
                position: 'relative',
                width: '100%',
                borderRadius: 2.5,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
            }}
        >
            {/* Conteneur principal */}
            <Box sx={{ display: 'flex', gap: 2, p: 1.5, alignItems: 'flex-start' }}>
                {/* Image */}
                <Box sx={{ width: 100, height: 130, borderRadius: 2, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <img
                        src={getCategoryImage(category?.description || 'Autres')}
                        alt={activity.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement.style.backgroundColor = categoryColor
                        }}
                    />
                </Box>

                {/* Contenu */}
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Header avec date */}
                    <Box>
                        <Typography sx={{ color: '#3454D1', fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                            {formatDate(activity.date)}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: '#1a1a1a',
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {activity.title}
                        </Typography>
                    </Box>

                    {/* Footer avec location et badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontSize: '0.7rem', color: '#95A5A6' }}>📍</Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.7rem',
                                    color: '#7F8C8D',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {activity.address?.city || 'Lieu inconnu'} • {distance}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.4,
                                px: 1,
                                py: 0.4,
                                backgroundColor: categoryColor,
                                color: 'white',
                                borderRadius: '999px',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {CategoryIcon && <CategoryIcon sx={{ fontSize: 12 }} />}
                            {category?.description || 'Sport'}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Bouton cœur */}
            <IconButton
                onClick={handleToggle}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                }}
            >
                {isFavorited ? (
                    <Icons.Favorite sx={{ fontSize: 20, color: '#E74C3C', transition: 'all 0.2s ease' }} />
                ) : (
                    <Icons.FavoriteBorder sx={{ fontSize: 20, color: '#E74C3C', transition: 'all 0.2s ease' }} />
                )}
            </IconButton>
        </Box>
    )
}

export default function MyFavorites({ userId }) {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFavorites()
    }, [userId])

    const loadFavorites = async () => {
        try {
            setLoading(true)
            const userFavorites = await getUserFavorites(userId)
            const enrichedFavorites = []

            const now = new Date()
            for (const favorite of userFavorites) {
                const activity = await fetchActivityById(favorite.activityId)
                if (activity && new Date(activity.date) >= now) {
                    const category = await fetchCategoryById(activity.categoryId)
                    enrichedFavorites.push({ ...favorite, activity, category })
                }
            }
            setFavorites(enrichedFavorites)
        } catch (error) {
            console.error('Erreur lors du chargement des favoris:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFavorite = async (favorite) => {
        try {
            if (favorite.isFavorited || favorite.id) {
                // Supprimer le favori
                await removeFavorite(favorite.id)
                // Mettre à jour localement
                setFavorites((prev) => prev.map((f) => (f.id === favorite.id ? { ...f, id: null, isFavorited: false } : f)))
                return false
            } else {
                // Ajouter un nouveau favori
                const newId = await addFavorite(userId, favorite.activity.id)
                setFavorites((prev) =>
                    prev.map((f) => (f.activity.id === favorite.activity.id ? { ...f, id: newId, isFavorited: true } : f))
                )
                return true
            }
        } catch (error) {
            console.error('Erreur lors de la modification du favori:', error)
            return favorite.isFavorited
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        )
    }

    if (favorites.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Aucune envie pour le moment</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {favorites.map((favorite) => (
                <FavoriteCard key={favorite.activity.id} favorite={favorite} onToggleFavorite={handleToggleFavorite} />
            ))}
        </Box>
    )
}
