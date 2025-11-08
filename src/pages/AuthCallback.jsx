// FILE: src/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, CircularProgress, Box } from '@mui/material'
import { completeSignInWithEmailLink } from '../services/userService'

export default function AuthCallback() {
    const navigate = useNavigate()
    const [status, setStatus] = useState({ loading: true, error: null })

    useEffect(() => {
        async function handleAuthCallback() {
            try {
                // 1️⃣ Finalise la connexion avec le lien magique
                const result = await completeSignInWithEmailLink(window.location.href)

                if (!result?.user) {
                    setStatus({
                        loading: false,
                        error: "Impossible de récupérer l'utilisateur, recommence la connexion.",
                    })
                    return
                }

                // 2️⃣ Redirige TOUJOURS vers register-profile
                // (NotPrivate se chargera de rediriger si déjà enregistré)
                navigate('/register-profile', {
                    state: { email: result.user.email },
                    replace: true,
                })
            } catch (err) {
                console.error('Erreur AuthCallback:', err)
                const message =
                    err.message === 'email-required'
                        ? 'Impossible de retrouver ton email, recommence la connexion.'
                        : 'Lien invalide ou expiré, demande un nouveau lien de connexion.'
                setStatus({ loading: false, error: message })
            }
        }

        handleAuthCallback()
    }, [navigate])

    if (status.loading) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress />
                    <Typography>Connexion en cours…</Typography>
                </Box>
            </Container>
        )
    }

    if (status.error) {
        return (
            <Container sx={{ mt: 8 }}>
                <Typography color="error">{status.error}</Typography>
            </Container>
        )
    }

    return null
}
