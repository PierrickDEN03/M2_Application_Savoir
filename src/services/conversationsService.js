// FILE: src/services/conversationsService.js
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    updateDoc,
    setDoc,
    serverTimestamp,
    onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase-config'

/**
 * 🔹 Crée ou récupère une conversation liée à une activité
 */
export async function getOrCreateActivityConversation(activityId, participantIds = [], currentUserId) {
    if (!activityId) throw new Error('activityId requis')

    const allParticipants = Array.from(new Set([...participantIds, currentUserId]))
    const convRef = doc(db, 'conversations', activityId)

    try {
        const convSnap = await getDoc(convRef)

        if (!convSnap.exists()) {
            await setDoc(convRef, {
                activityId,
                participants: allParticipants,
                createdAt: serverTimestamp(),
                lastMessage: '',
                lastMessageAt: serverTimestamp(),
            })
        } else {
            const existing = convSnap.data().participants || []
            const merged = Array.from(new Set([...existing, ...allParticipants]))
            if (merged.length !== existing.length) {
                await updateDoc(convRef, { participants: merged })
            }
        }

        return activityId
    } catch (error) {
        console.error('Erreur getOrCreateActivityConversation:', error)
        throw error
    }
}

/**
 * 💬 Envoie un message d'activité
 */
export async function sendActivityMessage(activityId, senderId, text) {
    if (!activityId || !senderId || !text.trim()) throw new Error('Paramètres manquants')

    try {
        const messagesRef = collection(db, 'messagesActivity')
        const messageDoc = await addDoc(messagesRef, {
            activityId,
            senderId,
            text: text.trim(),
            createdAt: serverTimestamp(),
            readBy: [senderId],
        })

        // Met à jour le dernier message
        const convRef = doc(db, 'conversations', activityId)
        await updateDoc(convRef, {
            lastMessage: text.trim(),
            lastMessageAt: serverTimestamp(),
        })

        return messageDoc.id
    } catch (error) {
        console.error('Erreur sendActivityMessage:', error)
        throw error
    }
}

/**
 * 🔁 Écoute les messages d'une activité
 */
export function listenToActivityMessages(activityId, callback) {
    if (!activityId) throw new Error('activityId requis')

    const q = query(collection(db, 'messagesActivity'), where('activityId', '==', activityId), orderBy('createdAt', 'asc'))

    // 🔥 FIX: Ajouter un gestionnaire d'erreur
    return onSnapshot(
        q,
        (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            callback(messages)
        },
        (error) => {
            console.error('Erreur listener messages activité:', error)
            // En cas d'erreur de permission, renvoyer un tableau vide
            callback([])
        }
    )
}

/**
 * 🔹 Récupère toutes les conversations d'activité auxquelles un utilisateur participe
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des conversations d'activité
 */
export async function getUserActivityConversations(userId) {
    if (!userId) throw new Error('userId requis')

    try {
        const conversationsRef = collection(db, 'conversations')
        const q = query(conversationsRef, where('participants', 'array-contains', userId))
        const snapshot = await getDocs(q)

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
    } catch (error) {
        console.error('Erreur getUserActivityConversations:', error)
        return []
    }
}
