// FILE: src/firebase-messaging.js
import { messaging } from './firebase-config'
import { getToken, onMessage } from 'firebase/messaging'
import { auth } from './firebase-config'
import { saveUserNotificationToken } from './services/notificationsService'

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY

/**
 * Demande la permission de recevoir des notifications et enregistre le token FCM
 */
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission()

        if (permission !== 'granted') {
            console.warn('Permission de notifications refusée par l’utilisateur.')
            return null
        }

        const currentUser = auth.currentUser
        if (!currentUser) {
            console.warn('Aucun utilisateur connecté pour enregistrer le token.')
            return null
        }

        const token = await getToken(messaging, { vapidKey: VAPID_KEY })
        if (!token) {
            console.warn('Aucun token FCM obtenu.')
            return null
        }

        console.log('Token FCM obtenu:', token)
        await saveUserNotificationToken(currentUser.uid, token)
        console.log('Token FCM enregistré pour l’utilisateur:', currentUser.uid)
        return token
    } catch (error) {
        console.error('Erreur lors de la récupération du token FCM:', error)
        return null
    }
}

/**
 * Écoute les notifications reçues quand l’app est ouverte (foreground)
 */
export const listenToForegroundMessages = () => {
    onMessage(messaging, (payload) => {
        console.log('Notification reçue en foreground:', payload)
    })
}
