// FILE: src/components/messagerie/ActivityContactItem.jsx
import React from 'react'
import { Card, CardActionArea, Avatar, Typography, Box, Chip, Stack } from '@mui/material'
import * as Icons from '@mui/icons-material'
import { getCategoryImage } from '../../services/categoriesService'
import { formatActivityDate } from '../../components/utils/formatDate' // ✅ correct path

function ActivityContactItem({ conversation, onClick }) {
    const category = conversation.categoryData || null

    const activityImage = conversation.activityCategory ? getCategoryImage(conversation.activityCategory) : getCategoryImage('Autres')

    const IconComponent = category && Icons[category.iconName] ? Icons[category.iconName] : Icons['MoreHoriz']

    const activityDateLabel = conversation.activityDate ? formatActivityDate(conversation.activityDate) : null

    return (
        <Card
            sx={{
                backgroundColor: '#ffffff',
                color: 'black',
                borderRadius: 3,
                boxShadow: 3,
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {/* Partie gauche */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={activityImage}
                        alt={conversation.activityTitle || 'Activité'}
                        sx={{
                            width: 56,
                            height: 56,
                            border: '2px solid #F0E7D6',
                        }}
                    />

                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {conversation.activityTitle || 'Activité'}
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                color: '#666',
                                mt: 0.5,
                                fontFamily: '"Nunito", sans-serif',
                            }}
                        >
                            {conversation.participants?.length || 0} participant
                            {conversation.participants?.length > 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>

                {/* Partie droite : date + catégorie */}
                <Stack spacing={1}>
                    {activityDateLabel && (
                        <Typography
                            sx={{
                                textAlign: 'right',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: category.color,
                                fontFamily: '"Nunito", sans-serif',
                            }}
                        >
                            {activityDateLabel}
                        </Typography>
                    )}

                    {category && (
                        <Box display="flex" justifyContent="flex-end">
                            <Chip
                                icon={<IconComponent sx={{ color: 'white' }} />}
                                label={category.description}
                                sx={{
                                    backgroundColor: category.color,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 26,
                                    borderRadius: '6px',
                                    /* Cible l’icône interne du Chip */
                                    '& .MuiChip-icon': {
                                        color: 'white !important',
                                        fontSize: 16,
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Stack>
            </CardActionArea>
        </Card>
    )
}

export default ActivityContactItem
