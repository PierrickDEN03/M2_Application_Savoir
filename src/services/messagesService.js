// FILE: src/services/messagesService.js
import { db } from '../firebase-config'
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, or, and } from 'firebase/firestore'

/**
 * Envoie un message à un utilisateur
 * @param {string} senderId - ID de l'expéditeur
 * @param {string} receiverId - ID du destinataire
 * @param {string} text - Contenu du message
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

    const q = query(
        messagesRef,
        where('senderId', 'in', [userId1, userId2]),
        where('receiverId', 'in', [userId1, userId2]),
        orderBy('createdAt', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(
                (msg) =>
                    (msg.senderId === userId1 && msg.receiverId === userId2) || (msg.senderId === userId2 && msg.receiverId === userId1)
            )
        callback(messages)
    })
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

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
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
}
