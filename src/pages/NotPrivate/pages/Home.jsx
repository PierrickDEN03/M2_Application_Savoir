import React from 'react'
import { Box, Typography, Button, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                bgcolor: '#3454D1', // bleu principal
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
                    px: 2,
                }}
            >
                {/* Logo / Nom de l’app */}
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                        fontWeight: 'bold',
                        color: '#F0E7D6',
                        mb: 1,
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    echo
                    <Box component="span" sx={{ color: '#ED6A5A' }}>
                        •
                    </Box>
                    ly
                </Typography>

                {/* Slogan */}
                <Typography variant="subtitle1" sx={{ color: '#FFD166', mb: 6 }}>
                    Là où chaque rencontre résonne
                </Typography>

                {/* Bouton S'inscrire */}
                <Button
                    variant="contained"
                    size="large"
                    sx={{
                        bgcolor: '#ED6A5A',
                        '&:hover': { bgcolor: '#B2DDF7', color: '#3454D1' },
                        borderRadius: '1rem',
                        px: 6,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        boxShadow: 3,
                    }}
                    onClick={() => navigate('/login')}
                >
                    S’inscrire
                </Button>

                {/* Lien Se connecter */}
                <Typography variant="body2" sx={{ mt: 3, color: '#F0E7D6' }}>
                    Déjà membre ?{' '}
                    <Link
                        component="button"
                        onClick={() => navigate('/login')}
                        underline="none"
                        sx={{ color: '#B2DDF7', fontWeight: 'bold' }}
                    >
                        Se connecter
                    </Link>
                </Typography>
            </Box>
        </Box>
    )
}
