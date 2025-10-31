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
import { fetchActivityById } from './activitiesService'
import { getUserNotificationToken, sendNotification } from './notificationsService'

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
                type: 'activity',
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
 * 💬 Envoie un message d'activité + envoie une notification aux autres participants
 */
export async function sendActivityMessage(activityId, senderId, text) {
    if (!activityId || !senderId || !text.trim()) throw new Error('Paramètres manquants')

    try {
        // Récupère la conversation
        const convRef = doc(db, 'conversations', activityId)
        const convSnap = await getDoc(convRef)

        if (!convSnap.exists()) {
            console.warn('⚠️ Conversation inexistante pour cette activité, création automatique...')
            await setDoc(convRef, {
                activityId,
                participants: [senderId],
                createdAt: serverTimestamp(),
                type: 'activity',
                lastMessage: '',
                lastMessageAt: serverTimestamp(),
            })
        }

        // Récupère les participants
        const conversationData = (await getDoc(convRef)).data()
        const participants = conversationData?.participants || []

        // Sauvegarde le message
        const messagesRef = collection(db, 'messagesActivity')
        const messageDoc = await addDoc(messagesRef, {
            activityId,
            senderId,
            text: text.trim(),
            createdAt: serverTimestamp(),
            readBy: [senderId],
        })

        // Met à jour la conversation
        await updateDoc(convRef, {
            lastMessage: text.trim(),
            lastMessageAt: serverTimestamp(),
        })

        // 🔔 Notifications aux autres participants
        const activity = await fetchActivityById(activityId)
        const activityTitle = activity?.title || 'Nouvelle activité'
        const notificationBody = text.length > 80 ? text.slice(0, 80) + '…' : text

        // Envoie à chaque participant sauf l'expéditeur
        for (const uid of participants) {
            if (uid === senderId) continue

            const token = await getUserNotificationToken(uid)
            if (token) {
                await sendNotification(token, {
                    title: activityTitle,
                    body: notificationBody,
                    url: `/user/activity-message/${activityId}`,
                    activityId,
                })
            } else {
                console.warn(`⚠️ Aucun token FCM trouvé pour ${uid}`)
            }
        }

        console.log('✅ Message envoyé + notifications dispatchées')
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
            callback([])
        }
    )
}

/**
 * 🔹 Récupère toutes les conversations d'activité auxquelles un utilisateur participe
 */
export async function getUserActivityConversations(userId) {
    if (!userId) throw new Error('userId requis')

    try {
        const conversationsRef = collection(db, 'conversations')
        const q = query(conversationsRef, where('participants', 'array-contains', userId))
        const snapshot = await getDocs(q)

        const conversations = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data()
                const activity = await fetchActivityById(data.activityId)
                return {
                    id: docSnap.id,
                    ...data,
                    activityTitle: activity?.title || 'Activité',
                }
            })
        )

        return conversations
    } catch (error) {
        console.error('Erreur getUserActivityConversations:', error)
        return []
    }
}
