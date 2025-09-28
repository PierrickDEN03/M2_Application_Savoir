import React from 'react'
import LogOut from '../../../components/LogOut'
import BottomNav from '../../../components/NavbarBottom'
import CreateActivityButton from '../../../components/CreateActivityBtn'

export default function Dashboard() {
    return (
        <div>
            <p>Dashboard</p>
            <LogOut />
            <BottomNav />
            <CreateActivityButton />
        </div>
    )
}
