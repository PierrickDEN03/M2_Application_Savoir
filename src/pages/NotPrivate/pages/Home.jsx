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
                bgcolor: '#E7F2F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                {/* Logo / Nom de l’app */}
                <Typography
                    sx={{
                        fontSize: { xs: '3.5rem', sm: '5.5rem' },
                        fontWeight: 700,
                        color: '#3454D1',
                        fontFamily: 'Poppins, sans-serif',
                        mb: 0.1,
                        lineHeight: 1.1,
                        letterSpacing: '-1px',
                    }}
                >
                    echo
                    <Box
                        component="span"
                        sx={{
                            color: '#ED6A5A',
                            fontSize: { xs: '3.8rem', sm: '5.8rem' },
                            position: 'relative',
                            top: '-2px',
                        }}
                    >
                        •
                    </Box>
                    ly
                </Typography>

                <Typography
                    sx={{
                        color: '#ED6A5A',
                        fontSize: { xs: '0.5rem', sm: '0.9rem' },
                        mb: { xs: 9, sm: 25 },
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                    }}
                >
                    Là où chaque rencontre résonne
                </Typography>

                {/* BOUTON CRÉER UN COMPTE */}
                <Button
                    variant="outlined"
                    onClick={() => navigate('/register-profile')}
                    sx={{
                        bgcolor: '#ED6A5A',
                        '&:hover': { bgcolor: '#d85a4c' },
                        color: '#FFFFFF',
                        borderRadius: '24px',
                        px: 5,
                        py: 1.5,
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
                        mb: 2,
                        width: '100%',
                        maxWidth: 260,
                    }}
                >
                    CRÉER UN COMPTE
                </Button>

                <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{
                        bgcolor: '#FFFFFF',
                        color: '#3454D1',
                        borderRadius: '24px',
                        px: 5,
                        py: 1.5,
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        width: '100%',
                        maxWidth: 260,
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.10)',
                        '&:hover': { bgcolor: '#ED6A5A', color: 'white' },
                    }}
                >
                    SE CONNECTER
                </Button>

            </Box>
        </Box>
    )
}
