import React, { useEffect, useState, useContext } from 'react'
import { db } from '../../../firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { Button, Typography, Box } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../context/userContext'
import { saveUserInterests, getUserInterests } from '../../../services/categoriesService'

export default function ChooseInterest() {
    const [categories, setCategories] = useState([])
    const [selected, setSelected] = useState([])
    const navigate = useNavigate()

    const { currentUser } = useContext(UserContext)

    useEffect(() => {
        const fetchCategoriesAndUserInterests = async () => {
            try {
                // 🔹 Charger toutes les catégories disponibles
                const querySnapshot = await getDocs(collection(db, 'categories'))
                const cats = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setCategories(cats)

                // 🔹 Charger les intérêts utilisateur (objets complets)
                if (currentUser) {
                    const userInterests = await getUserInterests(currentUser.uid)

                    // On extrait uniquement les ids pour gérer la sélection
                    const interestIds = userInterests.map((c) => c.id)
                    setSelected(interestIds)
                }
            } catch (err) {
                console.error('Erreur lors de la récupération des catégories ou intérêts:', err)
            }
        }

        fetchCategoriesAndUserInterests()
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
            // Retour à la page précédente
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
                bgcolor: '#3454D1',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    color: 'white',
                    textAlign: 'center',
                    mb: 4,
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
            >
                Quelles sont tes passions ?
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
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
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: '200px',
                    '&:hover': {
                        bgcolor: '#d45a4a',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(237, 106, 90, 0.3)',
                    },
                    '&:disabled': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'rgba(255,255,255,0.5)',
                    },
                }}
                disabled={selected.length === 0}
                onClick={handleFinish}
            >
                Sélectionner →
            </Button>
        </Box>
    )
}
