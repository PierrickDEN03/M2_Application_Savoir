import React from 'react'
import { Box } from '@mui/material'

export default function Avatar_Placeholder() {
    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Avatar placeholder */}
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#F0E7D6',
                }}
            />
        </Box>
    )
}
