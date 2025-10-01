import React from 'react'
import { Box, Typography } from '@mui/material'
import ActivityCard from './ActivityCard'

function CategorySection({ title, activities, category }) {
    if (activities.length === 0) return null

    return (
        <Box sx={{ px: 3, mb: 3 }}>
            <Typography
                variant="h6"
                sx={{
                    color: '#3454D1',
                    fontWeight: 600,
                    mb: 2,
                }}
            >
                {title}
            </Typography>

            {activities.map((activity) => (
                <ActivityCard
                    key={activity.id}
                    activity={activity}
                    category={category}
                    variant={title === 'Ce soir' ? 'tonight' : 'default'}
                />
            ))}
        </Box>
    )
}

export default CategorySection
