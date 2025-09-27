import React, { useState, useContext } from 'react'
import { TextField, Button, Typography, Snackbar, Alert, Box, Link } from '@mui/material'
import { UserContext } from '../context/userContext'

export default function SignInMagic() {
    const { sendMagicLink } = useContext(UserContext)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [isSending, setIsSending] = useState(false)

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    async function handleSend(e) {
        e.preventDefault()

        if (isSending) {
            setStatus({ open: true, severity: 'warning', message: 'Patiente un peu avant de renvoyer un lien' })
            return
        }

        if (!email.trim()) {
            setStatus({ open: true, severity: 'error', message: 'L’email est requis' })
            return
        }

        if (!validateEmail(email)) {
            setStatus({ open: true, severity: 'error', message: 'L’email n’est pas valide' })
            return
        }

        try {
            setIsSending(true)
            const result = await sendMagicLink(email)

            if (result === 'not_registered') {
                setStatus({ open: true, severity: 'error', message: 'Email non enregistré' })
            } else if (result === 'too_soon') {
                setStatus({ open: true, severity: 'warning', message: 'Lien déjà envoyé récemment, vérifie ta boîte mail' })
            } else {
                setStatus({ open: true, severity: 'success', message: 'Lien envoyé — vérifie ta boîte mail' })
            }
        } catch (err) {
            console.error(err)
            setStatus({ open: true, severity: 'error', message: 'Erreur serveur, réessaie plus tard' })
        } finally {
            setTimeout(() => setIsSending(false), 5000)
        }
    }

    return (
        <Box
            sx={{
                height: '100vh',
                bgcolor: '#3454D1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%',
                    px: 3,
                }}
            >
                {/* Logo */}
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#F0E7D6', mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    echo
                    <Box component="span" sx={{ color: '#ED6A5A' }}>
                        •
                    </Box>
                    ly
                </Typography>

                {/* Slogan */}
                <Typography variant="subtitle2" sx={{ color: '#FFD166', mb: 4 }}>
                    Là où chaque rencontre résonne
                </Typography>

                {/* Titre */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F0E7D6', mb: 3 }}>
                    Se connecter
                </Typography>

                {/* Formulaire */}
                <Box
                    component="form"
                    onSubmit={handleSend}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        placeholder="e-mail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            width: '320px',
                            mb: 3,
                            bgcolor: 'white',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        disabled={isSending}
                        sx={{
                            width: '270px',
                            bgcolor: '#ED6A5A',
                            color: '#fff',
                            borderRadius: '12px',
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            '&:hover': { bgcolor: '#B2DDF7', color: '#3454D1' },
                        }}
                    >
                        Se connecter →
                    </Button>
                </Box>

                {/* Lien inscription */}
                <Typography variant="body2" sx={{ mt: 4, color: '#F0E7D6' }}>
                    Pas encore de compte ?{' '}
                    <Link href="/login" underline="none" sx={{ color: '#B2DDF7', fontWeight: 'bold' }}>
                        Créer un compte
                    </Link>
                </Typography>
            </Box>

            {/* Snackbar */}
            <Snackbar open={status.open} autoHideDuration={5000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.severity} sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
