import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ChatIcon from '@mui/icons-material/Chat'
import MapIcon from '@mui/icons-material/Map'
import Paper from '@mui/material/Paper'

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    // Détermine quel onglet est actif selon l'URL
    const getValueFromPath = (path) => {
        if (path.startsWith('/user/dashboard')) return 0
        if (path.startsWith('/reservations')) return 1
        if (path.startsWith('/messagerie')) return 2
        if (path.startsWith('/user/map')) return 3
        return 0
    }

    const [value, setValue] = React.useState(getValueFromPath(location.pathname))

    React.useEffect(() => {
        setValue(getValueFromPath(location.pathname))
    }, [location.pathname])

    const handleChange = (event, newValue) => {
        setValue(newValue)
        switch (newValue) {
            case 0:
                navigate('/user/dashboard')
                break
            case 1:
                navigate('/reservations')
                break
            case 2:
                navigate('/messagerie')
                break
            case 3:
                navigate('/user/map')
                break
            default:
                navigate('/user/dashboard')
        }
    }

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: '20px 20px 0 0',
                bgcolor: '#F0E7D6',
                zIndex: 1000,
                border: 'none',
            }}
            elevation={0}
        >
            <BottomNavigation
                value={value}
                onChange={handleChange}
                showLabels={false}
                sx={{
                    height: 70,
                    bgcolor: 'transparent',
                    '& .MuiBottomNavigationAction-root': {
                        color: 'rgba(237, 106, 90, 0.5)',
                        minWidth: 'auto',
                        padding: '8px',
                        borderRadius: '12px',
                        margin: '4px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            color: 'rgba(237, 106, 90, 0.5)',
                            bgcolor: 'rgba(178, 221, 247, 0.1)',
                            transform: 'translateY(-2px)',
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: '28px',
                        },
                    },
                    '& .Mui-selected': {
                        color: '#ED6A5A !important',
                        bgcolor: 'rgba(237, 106, 90, 0.1)',
                        borderRadius: '12px',
                        transform: 'scale(1.1)',
                        '& .MuiSvgIcon-root': {
                            fontSize: '32px',
                        },
                    },
                }}
            >
                <BottomNavigationAction
                    icon={<HomeIcon />}
                    sx={{ '&.Mui-selected .MuiSvgIcon-root': { filter: 'drop-shadow(0 2px 4px rgba(237,106,90,0.3))' } }}
                />
                <BottomNavigationAction
                    icon={<ListAltIcon />}
                    sx={{ '&.Mui-selected .MuiSvgIcon-root': { filter: 'drop-shadow(0 2px 4px rgba(237,106,90,0.3))' } }}
                />
                <BottomNavigationAction
                    icon={<ChatIcon />}
                    sx={{ '&.Mui-selected .MuiSvgIcon-root': { filter: 'drop-shadow(0 2px 4px rgba(237,106,90,0.3))' } }}
                />
                <BottomNavigationAction
                    icon={<MapIcon />}
                    sx={{ '&.Mui-selected .MuiSvgIcon-root': { filter: 'drop-shadow(0 2px 4px rgba(237,106,90,0.3))' } }}
                />
            </BottomNavigation>
        </Paper>
    )
}
