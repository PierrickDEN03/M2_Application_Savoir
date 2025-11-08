// src/pages/Private/pages/ChooseInterest.js
import React, { useEffect, useState, useContext } from 'react'
import { Button, Typography, Box } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../context/userContext'
import { fetchCategoriesFromDB, getUserInterests, saveUserInterests } from '../../../services/categoriesService'

export default function ChooseInterest() {
    const [categories, setCategories] = useState([])
    const [selected, setSelected] = useState([])
    const navigate = useNavigate()
    const { currentUser } = useContext(UserContext)

    useEffect(() => {
        const loadData = async () => {
            try {
                // récupérer toutes les catégories depuis le service
                const cats = await fetchCategoriesFromDB()
                setCategories(cats)

                // Récupérer les intérêts de l'utilisateur s'il est connecté
                if (currentUser) {
                    const userInterests = await getUserInterests(currentUser.uid)
                    const interestIds = userInterests.map((c) => c.id)
                    setSelected(interestIds)
                }
            } catch (err) {
                console.error('Erreur lors du chargement des données:', err)
            }
        }

        loadData()
    }, [currentUser])

    const toggleSelect = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
    }

    const handleFinish = async () => {
        if (!currentUser) {
            console.error('Aucun utilisateur connecté')
            return
        }

        try {
            await saveUserInterests(currentUser.uid, selected)
            navigate(-1)
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des intérêts:", error)
        }
    }

    return (
        <Box
            sx={{
                px: 3,
                py: 4,
                bgcolor: '#E7F2F8',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                pb: 12,
            }}
        >
            {/* TITRE */}
            <Typography
                sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    fontWeight: 700,
                    color: '#3454D1',
                    mb: 4,
                    textAlign: 'center',
                    lineHeight: 1.1,
                }}
            >
                Quelles sont<br />tes passions ?
            </Typography>

            {/* GRILLE D’ICÔNES */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    maxWidth: '380px',
                    width: '100%',
                    mb: 8,
                    justifyItems: 'center',
                }}
            >
                {categories.map((cat) => {
                    const IconComponent = Icons[cat.iconName]
                    const isSelected = selected.includes(cat.id)

                    return (
                        <Button
                            key={cat.id}
                            onClick={() => toggleSelect(cat.id)}
                            sx={{
                                flex: '1 1 auto',
                                minWidth: 'fit-content',
                                maxWidth: 'calc(33.33% - 8px)',
                                height: '50px',
                                bgcolor: isSelected ? '#c6d44aff' : 'white',
                                color: isSelected ? 'white' : '#333',
                                borderRadius: '50px',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 1,
                                pr: 2,
                                pl: 1.5,
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: isSelected ? '#c6d44aff' : '#f0f0f0',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            {IconComponent && (
                                <IconComponent
                                    sx={{
                                        fontSize: 22,
                                        color: isSelected ? 'white' : cat.color || '#ED6A5A',

                                    }}
                                />
                            )}
                            <Typography sx={{
                                fontSize: '0.75rem', fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {cat.description}
                            </Typography>
                        </Button>
                    )
                })}
            </Box>

            {/* BOUTON FIXE EN BAS */}
            <Button
                sx={{
                    position: 'fixed',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '300px',
                    bgcolor: '#ED6A5A',
                    color: 'white',
                    borderRadius: '50px',
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    '&:hover': {
                        bgcolor: '#d45a4a',
                        transform: 'translateX(-50%) translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(237, 106, 90, 0.4)',
                    },
                    '&:disabled': {
                        bgcolor: '#ccc',
                        color: '#999',
                    },
                }}
                disabled={selected.length === 0}
                onClick={handleFinish}
            >
                Sélectionner  →
            </Button>
        </Box>
    )
}