import React from 'react'
import MapActivities from '../../../components/google_api/MapActivities'
import CreateActivityButton from '../../../components/utils/CreateActivityBtn'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

export default function Map() {
    return (
        <div>
            <MapActivities />
            <CreateActivityButton />
            <AvatarPlaceholder />
        </div>
    )
}
