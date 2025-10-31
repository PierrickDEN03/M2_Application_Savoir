// FILE: src/services/notificationsService.js
import { db } from '../firebase-config'
import { doc, setDoc, getDoc } from 'firebase/firestore'

/**
 * Sauvegarde le token FCM d'un utilisateur pour pouvoir lui envoyer des notifications plus tard
 * @param {string} userId - ID de l'utilisateur
 * @param {string} token - Token FCM obtenu côté client
 */
export async function saveUserNotificationToken(userId, token) {
    if (!userId || !token) return
    try {
        const ref = doc(db, 'userTokens', userId)
        await setDoc(ref, { token }, { merge: true })
        console.log(`✅ Token FCM enregistré pour l'utilisateur ${userId}`)
    } catch (err) {
        console.error('Erreur saveUserNotificationToken:', err)
    }
}

/**
 * Récupère le token FCM d'un utilisateur
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
export async function getUserNotificationToken(userId) {
    try {
        const ref = doc(db, 'userTokens', userId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
            return snap.data().token
        }
        return null
    } catch (err) {
        console.error('Erreur getUserNotificationToken:', err)
        return null
    }
}

/**
 * Envoie une notification via la Cloud Function Pour les messages
 * @param {string} token - Token FCM du destinataire
 * @param {{ title: string, body: string, url?: string }} data - Données de notification
 */
export async function sendNotification(token, data) {
    try {
        const response = await fetch('https://us-central1-m2applicationsavoir.cloudfunctions.net/sendUserNotification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, ...data }),
        })
        const result = await response.json()
        console.log('✅ Réponse Cloud Function:', result)
    } catch (error) {
        console.error('Erreur Cloud Function sendNotification:', error)
    }
}
