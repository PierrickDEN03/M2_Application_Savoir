import { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import ChatIcon from '@mui/icons-material/Chat'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import Paper from '@mui/material/Paper'
import { UserContext } from '../../context/userContext'

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser } = useContext(UserContext)

    const getValueFromPath = (path) => {
        if (path === '/user/create-activity' || path.startsWith('/user/activity-edit')) {
            return 2
        }

        if (path === '/user/messagerie' || path.startsWith('/user/send-message') || path.startsWith('/user/activity-message')) return 4

        if (path === '/user/map' || path.startsWith('/user/activity')) return 1

        if (path === '/user/dashboard') return 0

        if (path.startsWith('/user/profile')) {
            const segments = path.split('/')
            const profileId = segments[segments.length - 1]
            if (currentUser && profileId === currentUser.uid) return 3
            return -1
        }

        return 0
    }

    const [value, setValue] = useState(getValueFromPath(location.pathname))

    useEffect(() => {
        setValue(getValueFromPath(location.pathname))
    }, [location.pathname, currentUser])

    const handleChange = (event, newValue) => {
        setValue(newValue)

        switch (newValue) {
            case 0:
                navigate('/user/dashboard')
                break
            case 1:
                navigate('/user/map')
                break
            case 2:
                navigate('/user/create-activity')
                break
            case 3:
                if (currentUser) navigate(`/user/profile/${currentUser.uid}`)
                break
            case 4:
                navigate('/user/messagerie')
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
                bgcolor: 'white',
                zIndex: 1000,
                border: 'none',
            }}
            elevation={3}
        >
            <BottomNavigation
                value={value}
                onChange={handleChange}
                showLabels
                sx={{
                    height: 'auto',
                    bgcolor: 'transparent',
                    justifyContent: 'space-around',
                    '& .MuiBottomNavigationAction-root': {
                        color: '#9E9E9E',
                        minWidth: 'auto',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        margin: '6px 0',
                        transition: 'all 0.2s ease',
                        flexDirection: 'column',
                        fontSize: '0.7rem',
                        '&:hover': { color: '#3454D1' },
                        '& .MuiSvgIcon-root': { fontSize: '24px', marginBottom: '2px' },
                    },
                    '& .Mui-selected': {
                        color: '#3454D1 !important',
                        '& .MuiSvgIcon-root': { fontSize: '28px' },
                    },
                }}
            >
                <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
                <BottomNavigationAction label="Carte" icon={<LocationOnIcon />} />

                <BottomNavigationAction label="" icon={<AddIcon />} />

                <BottomNavigationAction label="Profil" icon={<AccountCircleIcon />} />
                <BottomNavigationAction label="Message" icon={<ChatIcon />} />
            </BottomNavigation>
        </Paper>
    )
}
