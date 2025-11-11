// FILE: src/services/datas.js
import { db } from '../firebase-config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { addReservation } from '../services/reservationsService'

// ------------------------
// Catégories existantes
// ------------------------
const categories = [
    { id: '4IRMWhxiGFxgNOwVpg8r', description: 'Shopping' },
    { id: '4cJXqJo3V1KD7V996HuA', description: 'Cinéma' },
    { id: '5BpFGj2TAbxGKyoA2Vrd', description: 'Photographie' },
    { id: '6CWbnUWjsuxVq2isxhPX', description: 'Danse' },
    { id: '7f2uNuW0mwZFFY2uQjmx', description: 'Randonnées' },
    { id: '8hBkMbyOqyyboTOmzBxH', description: 'Cuisine' },
    { id: 'B6rLI1acZ8iKCIGM7zWy', description: 'Yoga' },
    { id: 'IjNoF0eXCjPOydfb9yyJ', description: 'Sport' },
    { id: 'Ilx5RrxAVNLW6zxs3pCp', description: 'Astronomie' },
    { id: 'Kzpzc3mI9M2SQo6JX1bw', description: 'Lecture' },
    { id: 'SX78JHJqyiEjj51KJAzy', description: 'Culture' },
    { id: 'Yc0OkTe9JdNUXZ4guC1K', description: 'Bricolage' },
    { id: 'ZBg92skofHoZV46Q34qn', description: 'Autres' },
    { id: 'jfUPqAX6im81lWevYmqL', description: 'Jeux de société' },
    { id: 'mRzfUJysJ9rCC0bKhsKy', description: 'Jeux vidéo' },
    { id: 'obDibFfne1UdxBg1mWLa', description: 'Running' },
    { id: 'pRe8oGc9j9Hx7LxQjb5h', description: 'Yoga' },
    { id: 'u1t0xiXVvL6NLa7fo49j', description: 'Théâtre' },
    { id: 'v3Mw9l31Y8Ff4eHITFDZ', description: 'Art' },
    { id: 'yRPnt0C9cenVpmw59041', description: 'Musique' },
]

const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c.description]))
const categoryIds = categories.map((c) => c.id)

// ------------------------
// Titres et descriptions par catégorie
// ------------------------
const activityTemplates = {
    Shopping: [
        {
            title: 'Balade shopping au centre-ville',
            description: 'Venez découvrir les nouvelles boutiques du quartier et partager vos bons plans mode !',
        },
        {
            title: 'Chasse aux bonnes affaires',
            description: 'Session shopping pour dénicher les meilleures pièces dans les friperies lyonnaises',
        },
        { title: 'Shopping déco et design', description: 'Exploration des boutiques de décoration pour trouver des objets uniques' },
    ],
    Cinéma: [
        { title: "Soirée cinéma d'auteur", description: "Projection suivie d'un débat autour d'un film indépendant récent" },
        { title: 'Ciné en VO', description: "Séance de cinéma en version originale, idéal pour pratiquer l'anglais" },
        { title: 'Classiques du 7ème art', description: 'Redécouvrons ensemble les grands classiques du cinéma français' },
    ],
    Photographie: [
        {
            title: 'Balade photo urbaine',
            description: "Capturez l'essence de Lyon à travers votre objectif lors d'une promenade photographique",
        },
        { title: 'Atelier photo portrait', description: 'Session pratique pour améliorer vos techniques de portrait en extérieur' },
        { title: 'Golden hour au parc', description: 'Profitons de la lumière dorée du coucher de soleil pour de magnifiques clichés' },
    ],
    Danse: [
        {
            title: 'Cours de salsa débutants',
            description: 'Initiation à la salsa dans une ambiance conviviale, aucune expérience requise !',
        },
        { title: 'Soirée danse latine', description: 'Venez danser sur des rythmes latinos, tous niveaux bienvenus' },
        { title: 'Atelier de danse contemporaine', description: 'Expression corporelle et mouvements fluides pour tous les passionnés' },
    ],
    Randonnées: [
        { title: "Rando au Mont d'Or", description: 'Randonnée accessible avec vue panoramique sur Lyon et les Alpes' },
        { title: 'Balade en forêt', description: 'Marche tranquille en pleine nature pour se ressourcer le weekend' },
        { title: 'Randonnée et pique-nique', description: "Sortie d'une journée avec pause déjeuner en plein air" },
    ],
    Cuisine: [
        { title: 'Atelier cuisine italienne', description: 'Préparons ensemble des pâtes fraîches et tiramisu maison' },
        { title: 'Cours de pâtisserie', description: 'Apprenez à réaliser de délicieux desserts français traditionnels' },
        { title: 'Cuisine du monde', description: 'Découverte des saveurs exotiques et partage de recettes internationales' },
    ],
    Yoga: [
        { title: 'Séance de yoga matinal', description: 'Commencez la journée en douceur avec une pratique revitalisante' },
        { title: 'Yoga et méditation', description: 'Session complète alliant postures et relaxation profonde' },
        { title: 'Yoga en plein air', description: 'Pratique du yoga dans un parc pour se connecter à la nature' },
    ],
    Sport: [
        { title: 'Match de foot amical', description: 'Partie de football conviviale, tous niveaux acceptés' },
        { title: 'Session fitness en groupe', description: 'Entraînement cardio et renforcement musculaire dans la bonne humeur' },
        { title: 'Badminton entre amis', description: 'Venez jouer au badminton, matériel fourni sur place' },
    ],
    Astronomie: [
        { title: 'Observation des étoiles', description: "Soirée d'observation du ciel nocturne avec télescope" },
        { title: 'Découverte de la Lune', description: 'Exploration de notre satellite naturel et de ses cratères' },
        { title: 'Nuit des étoiles filantes', description: 'Contemplons ensemble la pluie de météores dans un lieu préservé' },
    ],
    Lecture: [
        { title: 'Club de lecture', description: "Échangeons autour de nos dernières lectures autour d'un café" },
        { title: 'Lecture en bibliothèque', description: 'Après-midi lecture partagée dans un cadre calme et inspirant' },
        { title: "Atelier d'écriture créative", description: "Stimulons notre imagination à travers des exercices ludiques d'écriture" },
    ],
    Culture: [
        { title: 'Visite de musée', description: "Découverte guidée d'une exposition temporaire au musée des Beaux-Arts" },
        { title: 'Balade patrimoine', description: "Circuit à la découverte de l'histoire et de l'architecture lyonnaise" },
        { title: 'Conférence culturelle', description: "Assistons à une conférence sur l'art contemporain" },
    ],
    Bricolage: [
        { title: 'Atelier menuiserie débutants', description: 'Apprenons les bases du travail du bois ensemble' },
        { title: 'DIY déco maison', description: 'Créons des objets déco personnalisés pour embellir nos intérieurs' },
        { title: 'Atelier recyclage créatif', description: 'Donnons une seconde vie à des objets du quotidien' },
    ],
    'Jeux de société': [
        { title: 'Soirée jeux de plateau', description: 'Découverte de nouveaux jeux modernes dans une ambiance conviviale' },
        { title: 'Tournoi de jeux stratégiques', description: 'Affrontement amical sur des jeux de stratégie et réflexion' },
        { title: 'Jeux coopératifs', description: 'Saurons-nous relever ensemble les défis des jeux collaboratifs ?' },
    ],
    'Jeux vidéo': [
        { title: 'Tournoi Mario Kart', description: 'Compétition amicale sur le célèbre jeu de course' },
        { title: 'LAN party rétro', description: 'Redécouvrons les classiques du jeu vidéo des années 90' },
        { title: 'Session jeux indépendants', description: 'Explorons ensemble des pépites du jeu vidéo indé' },
    ],
    Running: [
        { title: 'Run matinal au parc', description: 'Footing en groupe à allure modérée pour bien commencer la journée' },
        { title: 'Sortie running 10km', description: 'Parcours urbain de 10km pour coureurs réguliers' },
        { title: 'Running et étirements', description: "Course suivie d'une session d'étirements et récupération" },
    ],
    Théâtre: [
        { title: "Atelier d'improvisation", description: "Exercices d'impro théâtrale pour libérer sa créativité" },
        { title: 'Sortie spectacle', description: 'Allons voir une pièce de théâtre contemporain ensemble' },
        { title: 'Lecture de scènes', description: 'Atelier de lecture vivante de textes théâtraux classiques' },
    ],
    Art: [
        { title: 'Atelier peinture acrylique', description: 'Session de peinture libre pour exprimer sa créativité' },
        { title: "Visite d'atelier d'artiste", description: "Découverte du travail d'un artiste local dans son atelier" },
        { title: 'Dessin en plein air', description: 'Croquis et esquisses dans les rues pittoresques de Lyon' },
    ],
    Musique: [
        { title: 'Jam session acoustique', description: 'Session musicale improvisée, apportez vos instruments !' },
        { title: 'Concert découverte', description: 'Allons voir un groupe local en concert dans une petite salle' },
        { title: 'Atelier chant collectif', description: 'Chantons ensemble dans la joie et la bonne humeur' },
    ],
    Autres: [
        { title: 'Rencontre conviviale', description: "Moment d'échange et de partage autour d'un verre" },
        { title: 'Activité surprise', description: 'Venez découvrir une activité originale en toute convivialité' },
        { title: 'Sortie découverte', description: 'Explorons ensemble quelque chose de nouveau' },
    ],
}

// ------------------------
// Données aléatoires
// ------------------------
const firstNames = ['Lucas', 'Emma', 'Léo', 'Chloé', 'Gabriel', 'Manon', 'Louis', 'Camille', 'Arthur', 'Julie', 'Raphaël', 'Sarah']
const lastNames = [
    'Bernier',
    'Dubois',
    'Moreau',
    'Lefevre',
    'Roux',
    'Faure',
    'Garnier',
    'Chevalier',
    'Martinez',
    'Blanc',
    'Fournier',
    'Gauthier',
]
const streets = [
    'Cours Charlemagne',
    'Rue de la République',
    'Rue Garibaldi',
    'Rue Victor Hugo',
    'Rue Mercière',
    'Place Bellecour',
    'Quai Saint-Antoine',
    'Rue Président Édouard Herriot',
    'Rue des Marronniers',
    'Rue Sainte-Catherine',
    'Rue Paul Cazeneuve',
    'Rue de la Barre',
]

// Codes postaux réels de Lyon (1er au 9ème arrondissement)
const lyonPostalCodes = ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009']

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomPhone = () => `06${Math.floor(10 + Math.random() * 90)}${Math.floor(1000000 + Math.random() * 9000000)}`

// ------------------------
// Génération d'un utilisateur
// ------------------------
const generateUser = (index) => {
    const firstName = sample(firstNames)
    const lastName = sample(lastNames)
    const displayName = `${firstName} ${lastName}`
    const shuffledCategories = [...categoryIds].sort(() => 0.5 - Math.random())
    const interests_id = shuffledCategories.slice(0, 3)

    return {
        uid: `user_${String(index).padStart(3, '0')}`,
        city: 'Lyon',
        createdAt: new Date().toISOString(),
        description: '',
        displayName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        firstName,
        lastName,
        phone: randomPhone(),
        photoUrl: '/avatar_default.jpg',
        postalCode: sample(lyonPostalCodes),
        street: `${Math.floor(Math.random() * 200) + 1} ${sample(streets)}`,
        interests_id,
    }
}

export const generatedUsers = Array.from({ length: 30 }, (_, i) => generateUser(i + 1))

export async function insertGeneratedUsers() {
    for (const user of generatedUsers) {
        const { uid, ...payload } = user
        await setDoc(doc(db, 'users', uid), payload, { merge: false })
    }
    console.log('✅ 30 utilisateurs insérés dans Firestore')
}

// ------------------------
// Adresses possibles pour les activités (toutes à Lyon)
// ------------------------
const addresses = Array.from({ length: 30 }, () => ({
    city: 'Lyon',
    postalCode: sample(lyonPostalCodes),
    street: `${Math.floor(Math.random() * 200) + 1} ${sample(streets)}`,
}))

// ------------------------
// Dates aléatoires cohérentes (13 nov 2025 -> 3 janv 2026)
// ------------------------
const generateRandomDate = () => {
    const start = new Date('2025-11-13T18:00:00')
    const end = new Date('2026-01-03T23:00:00')
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
    const date = new Date(randomTime)

    // Heures "rondes" : 18h, 19h, 20h, 21h, 22h avec minutes 0, 15, 30, 45
    const hours = [18, 19, 20, 21, 22]
    const minutes = [0, 15, 30, 45]
    date.setHours(sample(hours))
    date.setMinutes(sample(minutes))
    date.setSeconds(0)
    return date.toISOString()
}

// ------------------------
// Fonction pour récupérer full et placeId via Google Maps API
// ------------------------
async function fetchPlaceDetails(address) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        console.error("⚠️ REACT_APP_GOOGLE_MAPS_API_KEY non définie dans les variables d'environnement")
        return {
            full: `${address.street}, ${address.postalCode} ${address.city}, France`,
            placeId: '',
        }
    }

    const query = encodeURIComponent(`${address.street}, ${address.postalCode} ${address.city}, France`)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`

    try {
        console.log(`🔍 Recherche Google Maps pour: ${address.street}, ${address.city}`)
        const response = await fetch(url)
        const data = await response.json()

        if (data.status === 'OK' && data.results.length > 0) {
            console.log(`✅ Adresse trouvée: ${data.results[0].formatted_address}`)
            return {
                full: data.results[0].formatted_address,
                placeId: data.results[0].place_id,
            }
        } else {
            console.warn(`⚠️ Google Maps API status: ${data.status} pour ${address.street}`)
            if (data.error_message) {
                console.error(`Erreur API: ${data.error_message}`)
            }
        }
    } catch (err) {
        console.error('❌ Erreur Google Maps API:', err)
    }

    // Fallback si l'API échoue
    return {
        full: `${address.street}, ${address.postalCode} ${address.city}, France`,
        placeId: '',
    }
}

// ------------------------
// Génération d'activités
// ------------------------
const generateActivity = async (index) => {
    const categoryId = sample(categoryIds)
    const categoryName = categoriesMap[categoryId]
    const user = sample(generatedUsers)
    const address = sample(addresses)

    // Récupération des détails Google Maps
    const placeDetails = await fetchPlaceDetails(address)

    // Sélection d'un template aléatoire pour cette catégorie
    const templates = activityTemplates[categoryName] || activityTemplates['Autres']
    const template = sample(templates)

    return {
        userId: user.uid,
        createdBy: user.uid,
        title: template.title,
        description: template.description,
        categoryId,
        date: generateRandomDate(),
        duration: Math.floor(Math.random() * 3) + 1,
        participants: Math.floor(Math.random() * 10) + 1,
        address: {
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            full: placeDetails.full,
            placeId: placeDetails.placeId,
        },
        placeId: placeDetails.placeId, // ✅ AUSSI À LA RACINE (comme tes activités manuelles)
        photoUrl: null,
    }
}

// ------------------------
// Insertion de 50 activités
// ------------------------
export async function insertGeneratedActivities() {
    console.log('🚀 Début de la génération de 50 activités...')

    for (let i = 0; i < 50; i++) {
        const activityId = `activity_${String(i + 1).padStart(3, '0')}`
        const activity = await generateActivity(i)
        const docRef = doc(db, 'activities', activityId)
        await setDoc(docRef, { ...activity, createdAt: serverTimestamp() })
        console.log(`✅ Activité ${activityId} insérée: "${activity.title}" par ${activity.userId}`)

        // Pause de 200ms entre chaque appel pour éviter de surcharger l'API
        await new Promise((resolve) => setTimeout(resolve, 200))
    }

    console.log('🎉 50 activités insérées avec succès !')
}

// ------------------------
// Génération de messages réalistes
// ------------------------
const conversationSamples = [
    'Salut !',
    'Ça va ?',
    'Oui, et toi ?',
    'On se voit ce week-end ?',
    'Parfait, à samedi !',
    'Merci pour ton aide !',
    'Tu as vu le dernier film ?',
    'On pourrait organiser ça ensemble.',
    "Peux-tu m'envoyer le document ?",
    "C'était super sympa hier.",
    'À quelle heure on se retrouve ?',
    'Bonne journée !',
    'Tu es dispo demain ?',
    "J'ai pensé à toi pour ce projet.",
    'On se fait un café cette semaine ?',
    "Tu as fini le travail que je t'ai envoyé ?",
    'Je suis en retard, désolé !',
    'Ça marche, je note.',
    'On change de lieu pour la réunion ?',
    'Tu viens à la soirée vendredi ?',
    'Je te rappelle plus tard.',
    'As-tu reçu mon mail ?',
    'On peut décaler la réunion ?',
    'Merci pour ton retour rapide.',
    "C'est noté, merci !",
    "Super, j'adore cette idée.",
    "Tu veux qu'on fasse ça ensemble ?",
    "J'ai une question pour toi.",
    'Ça te dérange si je passe plus tard ?',
    'Je suis coincé dans les transports.',
    "Peux-tu m'aider avec ce fichier ?",
    'On se retrouve au parc ?',
    "Je n'ai pas compris, peux-tu répéter ?",
    'Tu as des nouvelles de Paul ?',
    'Je suis en train de préparer le projet.',
    'Ça serait génial si tu pouvais venir.',
    'On se fait un déjeuner demain ?',
    'Tu es libre ce soir ?',
    'Merci pour le partage.',
    'Je confirme notre rendez-vous.',
    "Peux-tu m'envoyer le lien ?",
    "J'ai adoré notre dernière sortie.",
    'On peut reporter ça à lundi ?',
    'Je te tiens au courant.',
    "C'est urgent ?",
    'Je passe chez toi vers 18h.',
    'Tu veux participer au groupe ?',
    'Je suis pris toute la journée.',
    'On fait ça la semaine prochaine ?',
    "Tu m'expliques comment faire ?",
    'Merci beaucoup pour tout !',
]

/**
 * Génère des messages cohérents entre certaines paires
 */
export async function insertCohesiveMessages() {
    console.log('🚀 Début de la génération de messages cohérents...')

    // Sélection de 5 paires d'utilisateurs
    const pairs = []
    const shuffledUsers = [...generatedUsers].sort(() => 0.5 - Math.random())
    for (let i = 0; i < 5; i++) {
        pairs.push([shuffledUsers[i].uid, shuffledUsers[i + 5].uid])
    }

    let messageCount = 0

    for (const [userA, userB] of pairs) {
        // Générer entre 10 et 15 messages par paire
        const numMessages = 10 + Math.floor(Math.random() * 6)
        let currentDate = new Date()
        currentDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 20)) // Commencer il y a 0-20 jours

        for (let i = 0; i < numMessages; i++) {
            const senderId = i % 2 === 0 ? userA : userB
            const receiverId = senderId === userA ? userB : userA
            const text = conversationSamples[Math.floor(Math.random() * conversationSamples.length)]

            // Ajouter quelques minutes entre chaque message
            currentDate = new Date(currentDate.getTime() + Math.floor(Math.random() * 120) * 60 * 1000)

            const messageId = `message_${String(messageCount + 1).padStart(3, '0')}`
            const docRef = doc(db, 'messages', messageId)
            await setDoc(docRef, {
                senderId,
                receiverId,
                text,
                read: Math.random() > 0.3, // ~70% lus
                createdAt: currentDate,
            })

            messageCount++
        }

        console.log(`✅ Conversation insérée entre ${userA} ↔ ${userB} (${numMessages} messages)`)
    }

    console.log(`🎉 ${messageCount} messages cohérents insérés avec succès !`)
}

// ------------------------
// IDs utilisateurs et activités
// ------------------------
const userIds = Array.from({ length: 30 }, (_, i) => `user_${String(i + 1).padStart(3, '0')}`)
const activityIds = Array.from({ length: 30 }, (_, i) => `activity_${String(i + 1).padStart(3, '0')}`)

// ------------------------
// Génération d'une réservation aléatoire
// ------------------------
const generateRandomReservation = () => {
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    const activityId = activityIds[Math.floor(Math.random() * activityIds.length)]
    return { userId, activityId }
}

// ------------------------
// Fonction pour insérer N réservations
// ------------------------
export async function insertGeneratedReservations(count = 150) {
    console.log(`🚀 Génération de ${count} réservations...`)

    for (let i = 0; i < count; i++) {
        const { userId, activityId } = generateRandomReservation()

        try {
            await addReservation(userId, activityId)
        } catch (err) {
            console.warn(`⚠️ Réservation déjà existante ou erreur pour user=${userId}, activity=${activityId}`)
        }
    }

    console.log(`🎉 ${count} réservations insérées avec succès !`)
}
