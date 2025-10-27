// FILE: src/components/messagerie/ActivityContactItem.jsx
import React from 'react'
import { Card, CardActionArea, Avatar, Typography, Box } from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import { getCategoryImage } from '../../services/categoriesService'

function ActivityContactItem({ conversation, onClick }) {
    const activityImage = conversation.activityCategory ? getCategoryImage(conversation.activityCategory) : getCategoryImage('Autres')

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
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'flex-start',
                }}
            >
                <Avatar
                    src={activityImage}
                    alt={conversation.activityTitle || 'Activité'}
                    sx={{
                        width: 56,
                        height: 56,
                        border: '2px solid #F0E7D6',
                    }}
                />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {conversation.activityTitle || 'Activité'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <GroupIcon sx={{ fontSize: 14 }} />
                        {conversation.participants?.length || 0} participant{conversation.participants?.length > 1 ? 's' : ''}
                    </Typography>
                    {conversation.lastMessage && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#888',
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                            }}
                        >
                            {conversation.lastMessage}
                        </Typography>
                    )}
                </Box>
            </CardActionArea>
        </Card>
    )
}

export default ActivityContactItem
