// FILE: src/components/dashboard/MyActivityCard.jsx
import React, { useState } from 'react'
import { Box, Typography, Collapse, IconButton } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ActivityCard from '../../utils/ActivityCard'

export default function MyActivityCard({ activity }) {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)

    const handleToggle = (e) => {
        e.stopPropagation()
        setExpanded((prev) => !prev)
    }

    const handleCardClick = (e) => {
        // Empêcher la navigation par défaut d'ActivityCard
        e.stopPropagation()
        setExpanded(!expanded)
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 600,
                minWidth: 300,
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                mb: 1.5,
                position: 'relative',
            }}
        >
            {/* Wrapper pour ActivityCard + bouton engrenage */}
            <Box sx={{ position: 'relative' }} onClick={handleCardClick}>
                {/* Bouton engrenage centré verticalement à droite */}
                <IconButton
                    onClick={handleToggle}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 8,
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        bgcolor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        width: 36,
                        height: 36,
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.04)',
                        },
                    }}
                >
                    <Icons.Settings sx={{ fontSize: 20, color: '#666' }} />
                </IconButton>

                {/* ActivityCard réutilisé */}
                <Box sx={{ pointerEvents: 'none' }}>
                    <ActivityCard activity={activity} />
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
                        <Icons.Edit sx={{ fontSize: 20, color: '#666' }} />
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
