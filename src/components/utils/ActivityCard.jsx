import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardMedia, Typography, IconButton } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { getCategoryImage, fetchCategoryById } from '../../services/categoriesService'
import { formatActivityDate } from '../../components/utils/formatDate'
import { calculateDistance } from '../../services/distanceService'
import { checkFavorite, addFavorite, removeFavorite } from '../../services/favorisService'
import { UserContext } from '../../context/userContext'

export default function ActivityCard({ activity }) {
    const navigate = useNavigate()
    const { currentUser } = useContext(UserContext)
    const [category, setCategory] = useState(null)
    const [distance, setDistance] = useState(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriteId, setFavoriteId] = useState(null)
    const [loadingFav, setLoadingFav] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                if (activity.categoryId) {
                    const categoryData = await fetchCategoryById(activity.categoryId)
                    setCategory(categoryData)
                }

                if (activity.placeId) {
                    calculateDistance(activity.placeId, (dist) => setDistance(dist))
                }

                if (currentUser) {
                    const favId = await checkFavorite(currentUser.uid, activity.id)
                    if (favId) {
                        setIsFavorite(true)
                        setFavoriteId(favId)
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement:', error)
            }
        }

        loadData()
    }, [activity, currentUser])

    const handleToggleFavorite = async (e) => {
        e.stopPropagation()
        if (!currentUser) return

        setLoadingFav(true)
        try {
            if (isFavorite) {
                await removeFavorite(favoriteId)
                setIsFavorite(false)
                setFavoriteId(null)
            } else {
                const newFavId = await addFavorite(currentUser.uid, activity.id)
                setIsFavorite(true)
                setFavoriteId(newFavId)
            }
        } catch (error) {
            console.error('Erreur:', error)
        } finally {
            setLoadingFav(false)
        }
    }

    const categoryImage = category ? getCategoryImage(category.description) : activity.photoUrl
    const categoryName = category?.description || 'Autres'
    const categoryColor = category?.color || '#3454D1'
    const IconComponent = category?.iconName ? MuiIcons[category.iconName] : null

    return (
        <Card
            onClick={() => navigate(`/user/activity/${activity.id}`)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.2,
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                },
                position: 'relative',
            }}
        >
            {/* Image à gauche */}
            <Box sx={{ position: 'relative', width: 70, height: 100, borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    image={categoryImage}
                    alt={activity.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>

            {/* Badge catégorie */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    bgcolor: categoryColor,
                    color: 'white',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    fontFamily: '"Nunito", sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                }}
            >
                {IconComponent && <IconComponent sx={{ fontSize: 16 }} />}
                {categoryName}
            </Box>

            {/* Contenu texte */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    ml: 1.5,
                    pt: 4,
                    pb: 4,
                    pr: 5,
                    justifyContent: 'center',
                    gap: 0.4,
                }}
            >
                <Typography variant="caption" sx={{ color: '#3454D1', fontWeight: 500, fontFamily: '"All Round Gothic Semi", sans-serif' }}>
                    {formatActivityDate(activity.date)}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        fontFamily: '"All Round Gothic Semi", sans-serif',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {activity.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <MuiIcons.LocationOn sx={{ fontSize: 14, color: '#999' }} />
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: '"Nunito", sans-serif' }}>
                        {activity.address?.city || 'Lieu non spécifié'}
                        {distance && ` • ${distance}`}
                    </Typography>
                </Box>
            </Box>

            {/* Icône cœur */}
            <IconButton
                onClick={handleToggleFavorite}
                disabled={loadingFav}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: isFavorite ? '#ED6A5A' : '#ccc',
                    '&:hover': { color: '#ED6A5A' },
                }}
            >
                {isFavorite ? <MuiIcons.Favorite sx={{ fontSize: 20 }} /> : <MuiIcons.FavoriteBorder sx={{ fontSize: 20 }} />}
            </IconButton>
        </Card>
    )
}
