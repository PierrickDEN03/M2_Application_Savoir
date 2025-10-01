// FILE: src/services/reservationsService.js
import { db } from '../firebase-config'
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

/**
 * Vérifie si l'utilisateur est inscrit à une activité
 * @param {string} userId - ID de l'utilisateur
 * @param {string} activityId - ID de l'activité
 * @returns {Promise<string|null>} - ID de la réservation ou null
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
 * @param {string} userId - ID de l'utilisateur
 * @param {string} activityId - ID de l'activité
 * @returns {Promise<string>} - ID de la réservation créée
 */
export async function addReservation(userId, activityId) {
    if (!userId || !activityId) throw new Error('userId et activityId requis')

    const docRef = await addDoc(collection(db, 'reservations'), {
        userId,
        activityId,
        createdAt: serverTimestamp(),
    })
    return docRef.id
}

/**
 * Supprime une réservation
 * @param {string} reservationId - ID de la réservation
 * @returns {Promise<void>}
 */
export async function removeReservation(reservationId) {
    if (!reservationId) throw new Error('reservationId requis')

    await deleteDoc(doc(db, 'reservations', reservationId))
}

/**
 * Récupère toutes les réservations d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des réservations
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
