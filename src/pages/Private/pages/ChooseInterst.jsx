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
                // 🔹 Récupérer toutes les catégories depuis le service
                const cats = await fetchCategoriesFromDB()
                setCategories(cats)

                // 🔹 Récupérer les intérêts de l'utilisateur s'il est connecté
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
                width: '100vw',
                minHeight: '100vh',
                bgcolor: '#E7F2F8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2,
                py: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '380px',
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        color: '#3454D1',
                        textAlign: 'left',
                        mb: 4,
                        fontSize: 40,
                        fontFamily: '"All Round Gothic Semi", sans-serif',
                        fontWeight: 'bold',
                        width: '100%',
                    }}
                >
                    Quelles sont tes passions ?
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'start',
                        gap: 2,
                        maxWidth: '400px',
                        mb: 4,
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
                                    minWidth: '110px',
                                    height: '50px',
                                    bgcolor: isSelected ? '#ED6A5A' : 'white',
                                    color: isSelected ? 'white' : '#333',
                                    fontFamily: '"Nunito", sans-serif',
                                    borderRadius: '25px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    textTransform: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    border: isSelected ? '2px solid #ED6A5A' : '2px solid transparent',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: isSelected ? '#d45a4a' : '#f5f5f5',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    },
                                }}
                            >
                                {IconComponent && <IconComponent sx={{ fontSize: 20, color: isSelected ? 'white' : cat.color }} />}
                                <Typography sx={{ fontSize: '0.9rem', fontWeight: '500' }}>{cat.description}</Typography>
                            </Button>
                        )
                    })}
                </Box>

                <Button
                    sx={{
                        bgcolor: '#ED6A5A',
                        color: 'white',
                        borderRadius: '25px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: '600',
                        fontFamily: '"Nunito", sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '200px',
                        '&:hover': {
                            bgcolor: '#d45a4a',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(237, 106, 90, 0.3)',
                        },
                        '&:disabled': {
                            bgcolor: '#D0D0D0',
                            color: '#9E9E9E',
                        },
                    }}
                    disabled={selected.length === 0}
                    onClick={handleFinish}
                >
                    Sélectionner →
                </Button>
            </Box>
        </Box>
    )
}
