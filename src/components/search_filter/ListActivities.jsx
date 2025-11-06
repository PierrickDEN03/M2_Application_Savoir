import React from 'react'
import { Box, Typography } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import ActivityCard from '../utils/ActivityCard'

export default function ListActivities({ activities }) {
    return (
        <Box
            sx={{
                height: '100vh',
                bgcolor: '#E4EFF6',
                overflowY: 'auto',
                pb: 5,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    pt: 4,
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#E4EFF6',
                    zIndex: 10,
                    borderBottom: '1px solid #e0d5c7',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ color: '#3454D1', fontWeight: 700, fontFamily: '"All Round Gothic Semi", sans-serif', mb: 2 }}
                >
                    Activités à proximité
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontFamily: '"Nunito", sans-serif' }}>
                    {activities.length} activité{activities.length !== 1 ? 's' : ''} trouvée{activities.length !== 1 ? 's' : ''}
                </Typography>
            </Box>

            {/* Contenu liste */}
            <Box sx={{ p: 2 }}>
                {activities.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {activities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <MuiIcons.SearchOff sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography sx={{ color: '#999', fontWeight: 500, fontFamily: '"Nunito", sans-serif' }}>
                            Aucune activité ne correspond à vos filtres
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
