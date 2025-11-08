// FILE: src/pages/SignIn.jsx
import React, { useState, useContext } from 'react'
import { TextField, Button, Typography, Snackbar, Alert, Box, Link, InputAdornment, Divider } from '@mui/material'
import { MailOutline, Google, LockOutline } from '@mui/icons-material'
import { UserContext } from '../../../context/userContext'

export default function SignIn() {
    const { sendMagicLink } = useContext(UserContext)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [isSending, setIsSending] = useState(false)

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const handleSend = async (e) => {
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
                setStatus({ open: true, severity: 'success', message: 'Lien magique envoyé ! Vérifie ta boîte mail' })
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
                width: '100vw',
                height: '100vh',
                bgcolor: '#E7F2F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                {/* LOGO */}
                <Typography
                    sx={{
                        fontSize: { xs: '3.5rem', sm: '5.5rem' },
                        fontWeight: 700,
                        color: '#3454D1',
                        fontFamily: 'Poppins, sans-serif',
                        mb: -1,
                        lineHeight: 1.1,
                        letterSpacing: '-1px',
                    }}
                >
                    echo
                    <Box component="span" sx={{ color: '#ED6A5A', fontSize: { xs: '3.8rem', sm: '5.8rem' }, position: 'relative', top: '-2px' }}>
                        •
                    </Box>
                    ly
                </Typography>

                <Typography
                    sx={{
                        color: '#ED6A5A',
                        fontSize: { xs: '0.5rem', sm: '0.9rem' },
                        mb: { xs: 9, sm: 2 },
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                    }}
                >
                    Là où chaque rencontre résonne
                </Typography>

                {/* TITRE */}
                <Typography
                    sx={{
                        fontWeight: 600,
                        color: '#3454D1',
                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                        fontFamily: 'Poppins, sans-serif',
                        alignSelf: 'flex-start',
                        width: '100%',
                        textAlign: 'left',
                    }}
                >
                    Se connecter
                </Typography>

                {/* FORMULAIRE */}
                <Box component="form" onSubmit={handleSend} sx={{ width: '100%' }}>
                    <TextField
                        placeholder="e-mail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MailOutline sx={{ color: '#B0BEC5' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: '100%',
                            mb: 2,
                            bgcolor: 'white',
                            borderRadius: '24px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '24px',
                                fontSize: '0.9rem',
                                py: 0.8,
                            },
                            '& .MuiInputBase-input': { py: 1.2 },
                        }}
                    />

                    <TextField
                        placeholder="Mot de passe"
                        type="password"
                        // Pas de value, pas de onChange → juste visuel
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutline sx={{ color: '#B0BEC5' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: '100%',
                            mb: 1,
                            bgcolor: 'white',
                            borderRadius: '24px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '24px',
                                fontSize: '0.9rem',
                                py: 0.8,
                            },
                            '& .MuiInputBase-input': {
                                py: 1.2,
                            },
                        }}
                    />

                    <Typography
                        sx={{
                            alignSelf: 'flex-end',
                            mb: 6,
                            fontSize: '0.8rem',
                            color: 'black',
                            cursor: 'pointer',
                            textAlign: 'right',
                        }}
                    >
                        Mot de passe oublié ?
                    </Typography>

                    <Button
                        type="submit"
                        disabled={isSending}
                        sx={{
                            width: { xs: '180px', sm: '250px' },
                            maxWidth: '100%',
                            bgcolor: '#ED6A5A',
                            color: '#fff',
                            borderRadius: '24px',
                            py: 1.1,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            '&:hover': { bgcolor: '#d85a4c' },
                            mb: 3,
                        }}
                    >
                        {isSending ? 'Connexion...' : 'Se connecter →'}
                    </Button>
                </Box>

                {/* OU */}
                <Divider sx={{ width: { xs: '180px', sm: '250px' }, mb: 3 }}>ou</Divider>

                {/* GOOGLE */}
                <Button
                    variant="outlined"
                    startIcon={<Google sx={{ fontSize: '1.1rem' }} />}
                    sx={{
                        bgcolor: 'white',
                        color: '#000',
                        border: '1px solid #ddd',
                        borderRadius: '24px',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        width: { xs: '180px', sm: '250px' },
                        py: 1,
                        mb: 4,
                        '&:hover': { bgcolor: '#f9f9f9', borderColor: '#ccc' },
                    }}
                >
                    Se connecter avec Google
                </Button>
                {/* LIEN BAS */}
                <Typography sx={{ mt: 4, fontSize: '0.9rem', color: '#333' }}>
                    Pas encore de compte ?{' '}
                    <Link href="/signup" underline="none" sx={{ color: '#3454D1', fontWeight: 600 }}>
                        Créer un compte
                    </Link>
                </Typography>
            </Box>

            {/* SNACKBAR */}
            <Snackbar open={status.open} autoHideDuration={5000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.severity} sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}