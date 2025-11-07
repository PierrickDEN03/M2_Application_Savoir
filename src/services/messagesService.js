// FILE: src/services/messagesService.js
import { db } from '../firebase-config'
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, or, and } from 'firebase/firestore'
import { getUserNotificationToken, sendNotification } from './notificationsService'
import { fetchUserById } from './userService'

/**
 * Envoie un message à un utilisateur + notifie le destinataire
 * @param {string} senderId
 * @param {string} receiverId
 * @param {string} text
 * @returns {Promise<string>} - ID du message créé
 */
export async function sendMessage(senderId, receiverId, text) {
    if (!senderId || !receiverId || !text) {
        throw new Error('senderId, receiverId et text sont requis')
    }

    const messagesRef = collection(db, 'messages')
    const docRef = await addDoc(messagesRef, {
        senderId,
        receiverId,
        text,
        createdAt: serverTimestamp(),
        read: false,
    })

    // Récupérer le nom de l'expéditeur avant d'envoyer la notification
    let senderName = 'Nouveau message'
    try {
        const senderProfile = await fetchUserById(senderId)
        if (senderProfile && senderProfile.displayName) {
            senderName = senderProfile.displayName
        }
    } catch (e) {
        console.warn('⚠️ Impossible de récupérer le nom de l’expéditeur, utilisation du texte par défaut.')
    }

    // Tenter d'envoyer une notification au destinataire
    try {
        const token = await getUserNotificationToken(receiverId)
        if (token) {
            await sendNotification(token, {
                title: senderName, // 👈 Nom de l'expéditeur
                body: text.length > 50 ? text.slice(0, 50) + '...' : text,
                url: `/user/send-message/${senderId}`, // lien vers la conversation
                senderId,
                receiverId,
            })
        } else {
            console.warn(`⚠️ Aucun token FCM trouvé pour l'utilisateur ${receiverId}`)
        }
    } catch (err) {
        console.error('Erreur lors de l’envoi de la notification FCM:', err)
    }

    return docRef.id
}

/**
 * Écoute les messages entre deux utilisateurs en temps réel
 * @param {string} userId1 - Premier utilisateur
 * @param {string} userId2 - Deuxième utilisateur
 * @param {function} callback - Fonction appelée à chaque mise à jour
 * @returns {function} - Fonction pour arrêter l'écoute
 */
export function listenToMessages(userId1, userId2, callback) {
    const messagesRef = collection(db, 'messages')

    // 🔥 FIX: Utiliser 'or' au lieu de 'in' pour respecter les règles de sécurité
    const q = query(
        messagesRef,
        or(
            and(where('senderId', '==', userId1), where('receiverId', '==', userId2)),
            and(where('senderId', '==', userId2), where('receiverId', '==', userId1))
        ),
        orderBy('createdAt', 'asc')
    )

    // 🔥 FIX: Gérer les erreurs de permission
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
            console.error('Erreur listener messages:', error)
            // En cas d'erreur, renvoyer un tableau vide
            callback([])
        }
    )
}

/**
 * Récupère tous les messages entre deux utilisateurs
 * @param {string} userId1 - Premier utilisateur
 * @param {string} userId2 - Deuxième utilisateur
 * @returns {Promise<Array>} - Liste des messages
 */
export async function getMessages(userId1, userId2) {
    if (!userId1 || !userId2) {
        throw new Error('userId1 et userId2 sont requis')
    }

    const messagesRef = collection(db, 'messages')

    const q = query(
        messagesRef,
        or(
            and(where('senderId', '==', userId1), where('receiverId', '==', userId2)),
            and(where('senderId', '==', userId2), where('receiverId', '==', userId1))
        ),
        orderBy('createdAt', 'asc')
    )

    try {
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
    } catch (error) {
        console.error('Erreur getMessages:', error)
        return []
    }
}

/**
 * Récupère les conversations de l'utilisateur (liste des personnes avec qui il a parlé)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des IDs d'utilisateurs avec qui il a conversé
 */
export async function getConversations(userId) {
    if (!userId) {
        throw new Error('userId requis')
    }

    const messagesRef = collection(db, 'messages')

    try {
        // Messages envoyés
        const sentQuery = query(messagesRef, where('senderId', '==', userId))
        const sentSnapshot = await getDocs(sentQuery)

        // Messages reçus
        const receivedQuery = query(messagesRef, where('receiverId', '==', userId))
        const receivedSnapshot = await getDocs(receivedQuery)

        // Extraire les IDs uniques
        const userIds = new Set()

        sentSnapshot.docs.forEach((doc) => {
            userIds.add(doc.data().receiverId)
        })

        receivedSnapshot.docs.forEach((doc) => {
            userIds.add(doc.data().senderId)
        })

        return Array.from(userIds)
    } catch (error) {
        console.error('Erreur getConversations:', error)
        return []
    }
}

/**
 * Récupère les conversations de l'utilisateur avec le dernier message
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des conversations : { contactId, lastMessage }
 */
export async function getConversationsWithLastMessage(userId) {
    if (!userId) throw new Error('userId requis')

    const messagesRef = collection(db, 'messages')

    // Messages envoyés
    const sentQuery = query(messagesRef, where('senderId', '==', userId))
    const sentSnapshot = await getDocs(sentQuery)

    // Messages reçus
    const receivedQuery = query(messagesRef, where('receiverId', '==', userId))
    const receivedSnapshot = await getDocs(receivedQuery)

    const allMessages = [...sentSnapshot.docs, ...receivedSnapshot.docs].map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))

    // Grouper par interlocuteur
    const conversationsMap = new Map()

    allMessages.forEach((msg) => {
        const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId

        if (!conversationsMap.has(contactId)) {
            conversationsMap.set(contactId, msg)
        } else {
            // garder le dernier message
            if (msg.createdAt?.toDate() > conversationsMap.get(contactId).createdAt?.toDate()) {
                conversationsMap.set(contactId, msg)
            }
        }
    })

    // Retourner sous forme tableau
    return Array.from(conversationsMap.entries()).map(([contactId, msg]) => ({
        contactId,
        lastMessage: msg.text,
        lastMessageDate: msg.createdAt?.toDate() || null,
    }))
}
