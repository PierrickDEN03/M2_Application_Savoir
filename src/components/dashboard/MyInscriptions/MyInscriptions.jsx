// FILE: src/components/dashboard/MyInscriptions.jsx
import React, { useEffect, useState } from 'react'
import {
    Box,
    Collapse,
    Button,
    CircularProgress,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Rating,
    TextField,
} from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ActivityCard from '../../utils/ActivityCard'
import { getUserReservations, removeReservation } from '../../../services/reservationsService'
import { fetchActivityById } from '../../../services/activitiesService'
import { fetchCategoryById } from '../../../services/categoriesService'
import { getAvisByActivityId, addAvis, updateAvis } from '../../../services/avisService'

export default function MyInscriptions({ userId }) {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [reviewMode, setReviewMode] = useState(null)

    useEffect(() => {
        if (userId) loadInscriptions()
    }, [userId])

    const loadInscriptions = async () => {
        try {
            setLoading(true)
            const userReservations = await getUserReservations(userId)
            const enriched = []

            for (const reservation of userReservations) {
                const activity = await fetchActivityById(reservation.activityId)
                if (!activity) continue
                const category = await fetchCategoryById(activity.categoryId)
                enriched.push({ ...reservation, activity, category })
            }

            setReservations(enriched)
        } catch (err) {
            console.error('Erreur lors du chargement des inscriptions:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveReservation = (reservationId) => {
        setPendingDeleteId(reservationId)
        setConfirmOpen(true)
    }

    const confirmRemove = async () => {
        try {
            await removeReservation(pendingDeleteId)
            setReservations((prev) => prev.filter((r) => r.id !== pendingDeleteId))
            setSnackbarOpen(true)
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
        } finally {
            setConfirmOpen(false)
            setPendingDeleteId(null)
        }
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
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Aucune inscription pour le moment</p>
            </Box>
        )
    }

    if (reviewMode) {
        return (
            <ReviewInterface
                reservation={reviewMode}
                userId={userId}
                onBack={() => setReviewMode(null)}
                onReviewSaved={() => {
                    setReviewMode(null)
                    setSnackbarOpen(true)
                }}
            />
        )
    }

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reservations.map((r) => (
                    <InscriptionItem
                        key={r.id}
                        reservation={r}
                        onRemove={handleRemoveReservation}
                        onReview={setReviewMode}
                        userId={userId}
                    />
                ))}
            </Box>

            {/* ✅ Dialogue de confirmation */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1, minWidth: 320 },
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Annuler votre inscription ?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Êtes-vous sûr de vouloir annuler votre participation à cette activité ?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={() => setConfirmOpen(false)} variant="outlined">
                        Non
                    </Button>
                    <Button onClick={confirmRemove} variant="contained" color="error" startIcon={<MuiIcons.Cancel />}>
                        Oui, annuler
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ✅ Snackbar centrée en bas */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    bottom: 130,
                }}
            >
                <Alert
                    severity="success"
                    onClose={() => setSnackbarOpen(false)}
                    sx={{
                        width: '320px',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textAlign: 'center',
                    }}
                >
                    Action effectuée avec succès.
                </Alert>
            </Snackbar>
        </>
    )
}

/* -------------------------------------------------------------------------- */
/* ✅ ITEM D'INSCRIPTION */
/* -------------------------------------------------------------------------- */
function InscriptionItem({ reservation, onRemove, onReview, userId }) {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const [hasReview, setHasReview] = useState(false)

    useEffect(() => {
        checkUserReview()
    }, [])

    const checkUserReview = async () => {
        const avis = await getAvisByActivityId(reservation.activity.id)
        const userReview = avis.find((a) => a.idUser === userId)
        setHasReview(!!userReview)
    }

    const handleCardClick = (e) => {
        e.stopPropagation()
        e.preventDefault()
        setExpanded((prev) => !prev)
    }

    const activityDate = new Date(reservation.activity.date)
    const today = new Date()
    const isPast = activityDate < today.setHours(0, 0, 0, 0)

    return (
        <Box
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: expanded ? '0 4px 10px rgba(0,0,0,0.15)' : '0 2px 5px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s ease',
                backgroundColor: 'white',
            }}
        >
            <div
                onClick={handleCardClick}
                style={{
                    position: 'relative',
                    cursor: 'pointer',
                }}
            >
                <Box sx={{ pointerEvents: 'none' }}>
                    <ActivityCard activity={reservation.activity} />
                </Box>
            </div>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'white',
                        borderTop: '1px solid rgba(0,0,0,0.08)',
                        p: 1,
                    }}
                >
                    <ActionLine
                        icon={<MuiIcons.Message fontSize="small" />}
                        label="Envoyer un message à l’organisateur"
                        onClick={() => navigate(`/activity/${reservation.activity.id}/message`)}
                    />
                    <ActionLine
                        icon={<MuiIcons.Cancel color="error" fontSize="small" />}
                        label="Annuler mon inscription"
                        onClick={() => onRemove(reservation.id)}
                    />
                    {isPast && (
                        <ActionLine
                            icon={<MuiIcons.Star color="warning" fontSize="small" />}
                            label={hasReview ? 'Modifier mon avis' : 'Laisser un avis'}
                            onClick={() => onReview(reservation)}
                        />
                    )}
                </Box>
            </Collapse>
        </Box>
    )
}

/* -------------------------------------------------------------------------- */
/* ✅ INTERFACE D’AJOUT / MODIF D’AVIS */
/* -------------------------------------------------------------------------- */
function ReviewInterface({ reservation, onBack, userId, onReviewSaved }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [existingReview, setExistingReview] = useState(null)

    useEffect(() => {
        loadExistingReview()
    }, [])

    const loadExistingReview = async () => {
        const avis = await getAvisByActivityId(reservation.activity.id)
        const userReview = avis.find((a) => a.idUser === userId)
        if (userReview) {
            setExistingReview(userReview)
            setRating(userReview.note)
            setComment(userReview.comment || '')
        }
        setLoading(false)
    }

    const handleSubmit = async () => {
        try {
            if (existingReview) {
                await updateAvis(existingReview.id, { note: rating, comment })
            } else {
                await addAvis({
                    idActivity: reservation.activity.id,
                    idUser: userId,
                    note: rating,
                    comment,
                    createdAt: new Date(),
                })
            }
            onReviewSaved()
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l’avis:', e)
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                backgroundColor: 'white',
                borderRadius: 3,
                p: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxWidth: 500,
                mx: 'auto',
                mt: 4,
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f4ed8', textAlign: 'center', mb: 2 }}>
                {existingReview ? 'Modifier mon avis' : 'Laisser un avis'}
            </Typography>

            <ActivityCard activity={reservation.activity} />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                Qu’as-tu pensé de cette activité ?
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Rating value={rating} onChange={(e, newValue) => setRating(newValue)} size="large" />
            </Box>

            <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Ton avis..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                <Button
                    onClick={onBack}
                    variant="outlined"
                    sx={{
                        borderRadius: '50px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                    }}
                >
                    Retour
                </Button>

                <Button
                    variant="contained"
                    startIcon={<MuiIcons.ArrowRightAlt />}
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: '#F37C6B',
                        color: 'white',
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                            backgroundColor: '#f58f7f',
                            boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                        },
                    }}
                >
                    Valider
                </Button>
            </Box>
        </Box>
    )
}

/* -------------------------------------------------------------------------- */
function ActionLine({ icon, label, onClick }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 1,
                transition: 'background-color 0.2s',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
        >
            {icon}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {label}
            </Typography>
        </Box>
    )
}
