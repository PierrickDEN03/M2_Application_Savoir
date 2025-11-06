// FILE: src/services/userActivityUtils.js
import { fetchActivitiesByUser } from './activitiesService'
import { getUserReservations } from './reservationsService'

/**
 * Vérifie si l'utilisateur a au moins une activité ou une réservation
 * @param {string} userId
 * @returns {Promise<boolean>} true si l'utilisateur n'a rien, false sinon
 */
export async function hasNoActivitiesOrReservations(userId) {
    if (!userId) return true

    const [activities, reservations] = await Promise.all([fetchActivitiesByUser(userId), getUserReservations(userId)])

    return activities.length === 0 && reservations.length === 0
}
