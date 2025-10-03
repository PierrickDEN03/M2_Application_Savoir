// FILE: src/pages/AuthCallback.jsx
import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, CircularProgress } from '@mui/material'
import { auth } from '../firebase-config'
import { UserContext } from '../context/userContext'

export default function AuthCallback() {
    const navigate = useNavigate()
    const { completeSignInWithEmailLink, profileExists } = useContext(UserContext)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function run() {
            try {
                // Finalise la connexion en utilisant l’URL
                const result = await completeSignInWithEmailLink(window.location.href)

                const user = auth.currentUser || result.user
                if (!user) {
                    setError('Utilisateur non connecté après signIn')
                    return
                }

                // Vérifie si un profil existe en base
                const exists = await profileExists(user.uid)

                if (exists) {
                    // Si profil déjà créé => dashboard
                    navigate('/user/dashboard')
                } else {
                    // Sinon => page pour compléter son profil
                    navigate('/register-profile', { state: { email: user.email } })
                }
            } catch (err) {
                console.error('Erreur AuthCallback:', err)
                if (err.message === 'email-required') {
                    setError('Impossible de retrouver ton email, recommence la connexion.')
                } else {
                    setError('Lien invalide ou expiré, demande un nouveau lien de connexion.')
                }
            }
        }

        run()
    }, [navigate, completeSignInWithEmailLink, profileExists])

    if (error) {
        return (
            <Container sx={{ mt: 8 }}>
                <Typography color="error">{error}</Typography>
            </Container>
        )
    }

    return (
        <Container sx={{ mt: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Connexion en cours…</Typography>
        </Container>
    )
}
