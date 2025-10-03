// FILE: src/pages/ResearchActivity.jsx
import React, { useState, useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { fetchActivitiesFromDB, fetchCategoriesFromDB } from '../../../services/activitiesService'
import { auth } from '../../../firebase-config'
import SearchBar from '../../../components/activities/SearchBar'
import CategorySection from '../../../components/activities/CategorySection'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

function ResearchActivity() {
    const currentUser = auth.currentUser
    const [activities, setActivities] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const loadData = async () => {
            try {
                const [activitiesData, categoriesData] = await Promise.all([fetchActivitiesFromDB(), fetchCategoriesFromDB()])

                // Filtrer les activités pour exclure celles créées par l'utilisateur courant et celles passées
                const now = new Date()
                const filteredByUser = currentUser
                    ? activitiesData.filter(
                          (act) => act.createdBy !== currentUser.uid && act.userId !== currentUser.uid && new Date(act.date) > now
                      )
                    : activitiesData.filter((act) => new Date(act.date) > now)

                setActivities(filteredByUser)
                setCategories(categoriesData)
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [currentUser])

    const isToday = (dateString) => {
        if (!dateString) return false
        const actDate = new Date(dateString)
        const today = new Date()
        return actDate.toDateString() === today.toDateString()
    }

    // 🔹 Filtrage des activités selon la recherche
    const filteredActivities = activities.filter((act) => {
        const query = searchQuery.toLowerCase()
        return (
            act.title?.toLowerCase().includes(query) ||
            act.description?.toLowerCase().includes(query) ||
            act.city?.toLowerCase().includes(query)
        )
    })

    // 🔹 Activités du jour
    const todayActivities = filteredActivities.filter((act) => isToday(act.date))

    // 🔹 Activités regroupées par catégorie (hors today)
    const groupedActivities = categories.map((category) => ({
        ...category,
        activities: filteredActivities.filter((act) => act.categoryId === category.id && !isToday(act.date)),
    }))

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#F0E7D6',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F0E7D6',
                pb: 10,
            }}
        >
            <AvatarPlaceholder />

            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    pt: 4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ color: '#3454D1', fontWeight: 700, lineHeight: 1.2 }}>
                        Que veux
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#3454D1', fontWeight: 700, lineHeight: 1.2 }}>
                        tu faire today ?
                    </Typography>
                </Box>
            </Box>

            {/* Barre de recherche */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* Section Ce soir */}
            {todayActivities.length > 0 && (
                <CategorySection
                    title="Ce soir"
                    activities={todayActivities}
                    category={categories.find((c) => todayActivities[0] && c.id === todayActivities[0].categoryId)}
                />
            )}

            {/* Sections par catégorie */}
            {groupedActivities.map((group) => (
                <CategorySection key={group.id} title={group.description} activities={group.activities} category={group} />
            ))}
        </Box>
    )
}

export default ResearchActivity
