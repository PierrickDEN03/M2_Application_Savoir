import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function CreateActivityButton() {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/user/create-activity')
    }

    return (
        <Fab
            aria-label="add"
            onClick={handleClick}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000,
                bgcolor: '#FFCC4D', // jaune
                color: '#fff',
                '&:hover': {
                    bgcolor: '#e6b800', // jaune plus foncé au survol
                },
            }}
        >
            <AddIcon />
        </Fab>
    )
}
