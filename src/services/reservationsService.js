// FILE: src/services/reservationsService.js
import { db } from '../firebase-config'
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { fetchActivityById } from './activitiesService'
import { getUserNotificationToken, sendNotification } from './notificationsService'

/**
 * Vérifie si l'utilisateur est inscrit à une activité
 */
export async function checkReservation(userId, activityId) {
    if (!userId || !activityId) return null

    const q = query(collection(db, 'reservations'), where('userId', '==', userId), where('activityId', '==', activityId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id
    }
    return null
}

/**
 * Ajoute une réservation
 */
export async function addReservation(userId, activityId) {
    if (!userId || !activityId) throw new Error('userId et activityId requis')

    const docRef = await addDoc(collection(db, 'reservations'), {
        userId,
        activityId,
        createdAt: serverTimestamp(),
    })

    console.log(`✅ Réservation ajoutée (${docRef.id}) pour l'activité ${activityId}`)
    return docRef.id
}

/**
 * Supprime une réservation
 */
export async function removeReservation(reservationId) {
    if (!reservationId) throw new Error('reservationId requis')
    await deleteDoc(doc(db, 'reservations', reservationId))
}

/**
 * Récupère toutes les réservations d'un utilisateur
 */
export async function getUserReservations(userId) {
    if (!userId) return []

    const q = query(collection(db, 'reservations'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}

/**
 * 🔔 Envoie des rappels pour les activités ayant lieu demain
 * (à appeler par un cron job ou manuellement)
 */
export async function sendTomorrowActivityReminders() {
    try {
        console.log('⏰ Vérification des activités ayant lieu demain...')

        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)

        // On ne garde que les activités dont la date est demain (tolérance 00h-23h59)
        const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0))
        const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999))

        const allReservations = await getDocs(collection(db, 'reservations'))

        for (const reservationDoc of allReservations.docs) {
            const { activityId, userId } = reservationDoc.data()
            const activity = await fetchActivityById(activityId)
            if (!activity || !activity.date) continue

            const activityDate = new Date(activity.date)
            if (activityDate >= startOfDay && activityDate <= endOfDay) {
                const token = await getUserNotificationToken(userId)
                if (token) {
                    const dateString = new Date(activity.date).toLocaleString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                    })

                    await sendNotification(token, {
                        title: `Rappel : ${activity.title}`,
                        body: `Demain à ${dateString}`,
                        url: `/user/activity/${activity.id}`,
                        activityId: activity.id,
                    })

                    console.log(`📬 Notification envoyée à ${userId} pour ${activity.title}`)
                } else {
                    console.warn(`⚠️ Aucun token FCM trouvé pour ${userId}`)
                }
            }
        }

        console.log('✅ Vérification terminée : rappels envoyés')
    } catch (error) {
        console.error('Erreur sendTomorrowActivityReminders:', error)
    }
}
