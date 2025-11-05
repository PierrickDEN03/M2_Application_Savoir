// FILE: src/components/dashboard/MyActivityCard.jsx
import React, { useState } from 'react'
import { Box, Typography, Collapse, IconButton, Snackbar, Alert } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ActivityCard from '../../utils/ActivityCard'
import { deleteActivity } from '../../../services/activitiesService'

export default function MyActivityCard({ activity, onDeleted }) {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    const handleToggle = (e) => {
        e.stopPropagation()
        setExpanded((prev) => !prev)
    }

    const handleCardClick = (e) => {
        e.stopPropagation()
        setExpanded(!expanded)
    }

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            'Êtes-vous sûr de vouloir supprimer définitivement cette activité ? Les participants seront notifiés.'
        )
        if (!confirmDelete) return

        try {
            setDeleting(true)
            await deleteActivity(activity.id)

            setSnackbar({
                open: true,
                message: 'Activité supprimée avec succès',
                severity: 'success',
            })

            if (onDeleted) onDeleted(activity.id)
        } catch (err) {
            console.error('Erreur lors de la suppression de l’activité :', err)
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression de l’activité',
                severity: 'error',
            })
        } finally {
            setDeleting(false)
        }
    }

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }))
    }

    return (
        <>
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
                    opacity: deleting ? 0.5 : 1,
                    pointerEvents: deleting ? 'none' : 'auto',
                    transition: 'opacity 0.2s ease',
                }}
            >
                {/* Header + engrenage */}
                <Box sx={{ position: 'relative' }} onClick={handleCardClick}>
                    <IconButton
                        onClick={handleToggle}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 8,
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            bgcolor: 'white',
                            width: 36,
                            height: 36,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        }}
                    >
                        <Icons.KeyboardArrowDown sx={{ fontSize: 25, color: '#666' }} />
                    </IconButton>

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

                        <Box onClick={handleDelete} sx={menuItemStyle}>
                            <Icons.Cancel sx={{ fontSize: 20, color: '#ff4444' }} />
                            <Typography sx={menuTextStyle}>Annuler l'activité</Typography>
                        </Box>

                        <Box onClick={() => navigate(`/user/activity-edit/${activity.id}`)} sx={menuItemStyle}>
                            <Icons.Edit sx={{ fontSize: 20, color: '#666' }} />
                            <Typography sx={menuTextStyle}>Modifier l'activité</Typography>
                        </Box>
                    </Box>
                </Collapse>
            </Box>

            {/* Snackbar suppression confirmé */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: 15 }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
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
    fontFamily: '"Nunito", sans-serif',
}
