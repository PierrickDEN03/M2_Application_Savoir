// FILE: src/services/activitiesService.js
import { db } from '../firebase-config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Crée une nouvelle activité dans Firestore
 * @param {string} uid - L'ID de l'utilisateur créateur
 * @param {object} activityData - Les données de l'activité
 * @returns {Promise<string>} - L'ID de l'activité créée
 */
export async function createActivity(uid, activityData = {}) {
    if (!uid) throw new Error('uid-required')
    if (!activityData) throw new Error('activity-data-required')

    const activitiesRef = collection(db, 'activities')
    const payload = {
        ...activityData,
        createdBy: uid,
        createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(activitiesRef, payload)
    return docRef.id
}
