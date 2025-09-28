import React from 'react'
import MapActivities from '../../../components/google_api/MapActivities'
import CreateActivityButton from '../../../components/CreateActivityBtn'

export default function Map() {
    return (
        <div>
            <MapActivities />
            <CreateActivityButton />
        </div>
    )
}
