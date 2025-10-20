import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase-config.js'

const avisCollection = collection(db, 'avis')

// 🔹 Récupérer tous les avis d'une activité
export async function getAvisByActivityId(idActivity) {
    const q = query(avisCollection, where('idActivity', '==', idActivity))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// 🔹 Calculer la moyenne des avis
export async function getAverageNote(idActivity) {
    const avis = await getAvisByActivityId(idActivity)
    if (avis.length === 0) return 0
    const sum = avis.reduce((acc, a) => acc + a.note, 0)
    return sum / avis.length
}

// 🔹 Ajouter un avis
export async function addAvis({ idActivity, idUser, note, comment }) {
    await addDoc(avisCollection, { idActivity, idUser, note, comment, createdAt: new Date() })
}

// 🔹 Mettre à jour un avis existant
export async function updateAvis(avisId, { note, comment }) {
    const ref = doc(db, 'avis', avisId)
    await updateDoc(ref, { note, comment, updatedAt: new Date() })
}

// 🔹 Récupérer l’avis d’un utilisateur pour une activité donnée
export async function getUserAvis(idActivity, idUser) {
    const q = query(avisCollection, where('idActivity', '==', idActivity), where('idUser', '==', idUser))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const docSnap = snapshot.docs[0]
    return { id: docSnap.id, ...docSnap.data() }
}
