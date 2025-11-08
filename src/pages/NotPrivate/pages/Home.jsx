import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                width: '100vw',
                minHeight: '108vh',
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
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/Logo.svg"
                        alt="Logo"
                        sx={{
                            width: { xs: '200px', sm: '280px' },
                            height: 'auto',
                        }}
                    />
                </Box>

                <Typography
                    sx={{
                        color: '#ED6A5A',
                        fontSize: '1rem',
                        mb: { xs: 10, sm: 28 },
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 400,
                    }}
                >
                    Là où chaque rencontre résonne
                </Typography>

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
                        fontFamily: '"Nunito", sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        width: '100%',
                        maxWidth: 260,
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.10)',
                        '&:hover': { bgcolor: '#ED6A5A', color: 'white' },
                    }}
                >
                    Se connecter
                </Button>
            </Box>
        </Box>
    )
}
