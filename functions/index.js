//FILE: /functions/index.js
const { onRequest } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })

admin.initializeApp()
const db = admin.firestore()

// ============================================================================
// 🔔 1. Envoi manuel d'une notification via requête HTTP
// ============================================================================
exports.sendUserNotification = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { token, title, body, url } = req.body

            if (!token) {
                return res.status(400).json({ error: 'Token FCM manquant.' })
            }

            const message = {
                token,
                notification: {
                    title: title || 'Nouvelle notification',
                    body: body || '',
                },
                data: { url: url || '/' },
            }

            const response = await admin.messaging().send(message)
            logger.info('✅ Notification envoyée :', response)

            res.status(200).json({ success: true, response })
        } catch (error) {
            logger.error('❌ Erreur lors de l’envoi de la notification :', error)
            res.status(500).json({ error: error.message })
        }
    })
})

// ============================================================================
// 🕒 2. Fonction planifiée : envoie un rappel la veille d'une activité
// ============================================================================
exports.sendActivityReminders = onSchedule(
    {
        schedule: '0 8 * * *', // Tous les jours à 8h (heure de Paris)
        timeZone: 'Europe/Paris',
    },
    async () => {
        logger.info('📅 Vérification des activités prévues pour demain...')

        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)

        const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString()
        const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString()

        try {
            const activitiesSnap = await db
                .collection('activities')
                .where('date', '>=', startOfTomorrow)
                .where('date', '<=', endOfTomorrow)
                .get()

            if (activitiesSnap.empty) {
                logger.info('🚫 Aucune activité prévue demain.')
                return null
            }

            for (const activityDoc of activitiesSnap.docs) {
                const activity = activityDoc.data()
                const activityId = activityDoc.id
                logger.info(`📌 Activité trouvée : ${activity.title}`)

                const reservationsSnap = await db.collection('reservations').where('activityId', '==', activityId).get()
                if (reservationsSnap.empty) continue

                for (const res of reservationsSnap.docs) {
                    const userId = res.data().userId
                    const tokenSnap = await db.collection('userTokens').doc(userId).get()

                    if (!tokenSnap.exists) {
                        logger.warn(`⚠️ Pas de token pour user ${userId}`)
                        continue
                    }

                    const token = tokenSnap.data().token

                    const message = {
                        token,
                        notification: {
                            title: '📢 Rappel : activité demain',
                            body: `${activity.title} — le ${new Date(activity.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}`,
                        },
                        data: {
                            url: `/user/activity/${activityId}`,
                            activityId,
                        },
                    }

                    try {
                        await admin.messaging().send(message)
                        logger.info(`✅ Notification envoyée à ${userId} pour ${activity.title}`)
                    } catch (err) {
                        logger.error(`❌ Erreur notification ${userId}:`, err)
                    }
                }
            }

            logger.info('🎉 Envoi des rappels terminé.')
            return null
        } catch (err) {
            logger.error('🔥 Erreur globale dans sendActivityReminders :', err)
            return null
        }
    }
)

// ============================================================================
// 🌟 3. Notifie les utilisateurs avec intérêts similaires
// ============================================================================
exports.notifyUsersWithSameInterest = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { activityId, categoryId } = req.body

            if (!activityId || !categoryId) {
                return res.status(400).json({ error: 'activityId et categoryId sont requis.' })
            }

            const activitySnap = await db.collection('activities').doc(activityId).get()
            if (!activitySnap.exists) {
                return res.status(404).json({ error: 'Activité non trouvée.' })
            }

            const activity = activitySnap.data()
            const usersSnap = await db.collection('users').where('interests_id', 'array-contains', categoryId).get()

            if (usersSnap.empty) {
                logger.info('🚫 Aucun utilisateur avec cet intérêt.')
                return res.status(200).json({ message: 'Aucun utilisateur trouvé.' })
            }

            const tokens = []
            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id
                const tokenSnap = await db.collection('userTokens').doc(userId).get()
                if (tokenSnap.exists && tokenSnap.data().token) {
                    tokens.push(tokenSnap.data().token)
                }
            }

            if (tokens.length === 0) {
                logger.warn('⚠️ Aucun token trouvé pour ces utilisateurs.')
                return res.status(200).json({ message: 'Aucun token disponible.' })
            }

            const payload = {
                notification: {
                    title: 'Nouvelle activité correspondant à vos intérêts !',
                    body: `L'activité "${activity.title}" correspond à vos centres d'intérêts`,
                },
                data: {
                    url: `/user/activity/${activityId}`,
                    activityId,
                    categoryId,
                },
            }

            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                ...payload,
            })

            logger.info(`✅ Notifications envoyées à ${tokens.length} utilisateurs.`)
            res.status(200).json({ success: true, count: tokens.length, response })
        } catch (error) {
            logger.error('❌ Erreur dans notifyUsersWithSameInterest :', error)
            res.status(500).json({ error: error.message })
        }
    })
})

// ============================================================================
// 💬 4. Notification automatique : nouvel avis → créateur de l’activité
// ============================================================================
exports.notifyActivityCreatorOnNewAvis = onDocumentCreated('avis/{avisId}', async (event) => {
    const newAvis = event.data.data()
    if (!newAvis) return null

    const { idActivity, idUser, note } = newAvis
    logger.info(`🆕 Nouvel avis sur activité ${idActivity} par ${idUser}`)

    try {
        const activitySnap = await db.collection('activities').doc(idActivity).get()
        if (!activitySnap.exists) {
            logger.warn(`⚠️ Activité introuvable: ${idActivity}`)
            return null
        }

        const activity = activitySnap.data()
        const creatorId = activity.createdBy

        // 🚫 Pas de notif si le créateur laisse un avis sur sa propre activité
        if (creatorId === idUser) {
            logger.info(`ℹ️ Le créateur a laissé un avis sur sa propre activité, aucune notif envoyée.`)
            return null
        }

        const tokenSnap = await db.collection('userTokens').doc(creatorId).get()
        if (!tokenSnap.exists) {
            logger.warn(`⚠️ Pas de token FCM pour le créateur ${creatorId}`)
            return null
        }

        const token = tokenSnap.data().token

        const message = {
            token,
            notification: {
                title: 'Nouvel avis reçu !',
                body: `Un utilisateur a noté "${activity.title}" ${note}/5.`,
            },
            data: {
                url: `/user/activity/${idActivity}`,
                idActivity,
            },
        }

        await admin.messaging().send(message)
        logger.info(`✅ Notification envoyée à ${creatorId} pour activité ${activity.title}`)
    } catch (error) {
        logger.error('❌ Erreur lors de notifyActivityCreatorOnNewAvis:', error)
    }

    return null
})

// ============================================================================
// 💖 5. Fonction planifiée : notification pour les favoris (veille de l’activité)
// ============================================================================
exports.sendFavoriteActivityReminders = onSchedule(
    {
        schedule: '0 8 * * *', // Tous les jours à 8h (heure de Paris)
        timeZone: 'Europe/Paris',
    },
    async () => {
        logger.info('💖 Vérification des activités en favoris prévues pour demain...')

        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)

        const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString()
        const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString()

        try {
            // 🔹 On récupère les activités prévues demain
            const activitiesSnap = await db
                .collection('activities')
                .where('date', '>=', startOfTomorrow)
                .where('date', '<=', endOfTomorrow)
                .get()

            if (activitiesSnap.empty) {
                logger.info('🚫 Aucune activité favorite prévue demain.')
                return null
            }

            // Pour chaque activité prévue demain
            for (const activityDoc of activitiesSnap.docs) {
                const activity = activityDoc.data()
                const activityId = activityDoc.id

                // 🔹 Trouver les utilisateurs qui ont cette activité en favoris
                const favSnap = await db.collection('favoris').where('activityId', '==', activityId).get()
                if (favSnap.empty) continue

                for (const favDoc of favSnap.docs) {
                    const favData = favDoc.data()
                    const userId = favData.userId

                    // 🔹 Récupération du token FCM de l’utilisateur
                    const tokenSnap = await db.collection('userTokens').doc(userId).get()
                    if (!tokenSnap.exists || !tokenSnap.data().token) {
                        logger.warn(`⚠️ Pas de token pour user ${userId} (favoris).`)
                        continue
                    }

                    const token = tokenSnap.data().token

                    // 🔹 Message personnalisé
                    const message = {
                        token,
                        notification: {
                            title: 'Activité en favoris bientôt terminée',
                            body: `"${activity.title}" se déroule demain.`,
                        },
                        data: {
                            url: `/user/activity/${activityId}`,
                            activityId,
                        },
                    }

                    try {
                        await admin.messaging().send(message)
                        logger.info(`✅ Notification "favori" envoyée à ${userId} pour ${activity.title}`)
                    } catch (err) {
                        logger.error(`❌ Erreur notification favoris ${userId}:`, err)
                    }
                }
            }

            logger.info('🎉 Envoi des rappels favoris terminé.')
            return null
        } catch (err) {
            logger.error('🔥 Erreur globale dans sendFavoriteActivityReminders :', err)
            return null
        }
    }
)

// ============================================================================
// 🛠️ 6. Notification automatique : activité mise à jour → utilisateurs inscrits
// ============================================================================
const { onDocumentUpdated } = require('firebase-functions/v2/firestore')

exports.notifyUsersOnActivityUpdate = onDocumentUpdated('activities/{activityId}', async (event) => {
    const beforeData = event.data.before.data()
    const afterData = event.data.after.data()
    const activityId = event.params.activityId

    if (!beforeData || !afterData) return null

    // Ignorer les changements sans impact significatif
    const fieldsToWatch = ['title', 'description', 'date', 'address']
    const hasRelevantChange = fieldsToWatch.some((field) => beforeData[field] !== afterData[field])

    if (!hasRelevantChange) {
        logger.info(`ℹ️ Aucune modification pertinente sur ${activityId}`)
        return null
    }

    try {
        // 🔹 Récupérer les réservations liées à cette activité
        const reservationsSnap = await db.collection('reservations').where('activityId', '==', activityId).get()
        if (reservationsSnap.empty) {
            logger.info(`🚫 Aucune réservation trouvée pour l'activité ${activityId}`)
            return null
        }

        logger.info(`📢 Envoi de notifications pour la mise à jour de ${afterData.title}`)

        for (const reservationDoc of reservationsSnap.docs) {
            const userId = reservationDoc.data().userId

            // 🔹 Récupérer le token FCM de l’utilisateur
            const tokenSnap = await db.collection('userTokens').doc(userId).get()
            if (!tokenSnap.exists || !tokenSnap.data().token) {
                logger.warn(`⚠️ Aucun token pour user ${userId}`)
                continue
            }

            const token = tokenSnap.data().token

            const message = {
                token,
                notification: {
                    title: `Activité mise à jour : ${afterData.title}`,
                    body: `Des informations ont été modifiées pour "${afterData.title}".`,
                },
                data: {
                    url: `/user/activity/${activityId}`,
                    activityId,
                },
            }

            try {
                await admin.messaging().send(message)
                logger.info(`✅ Notification envoyée à ${userId} pour ${afterData.title}`)
            } catch (err) {
                logger.error(`❌ Erreur notification pour ${userId} :`, err)
            }
        }

        logger.info(`🎉 Notifications envoyées pour ${activityId}`)
        return null
    } catch (error) {
        logger.error('🔥 Erreur dans notifyUsersOnActivityUpdate :', error)
        return null
    }
})

// ============================================================================
// 🗑️ 7. Notification automatique : activité supprimée → utilisateurs inscrits
// ============================================================================
const { onDocumentDeleted } = require('firebase-functions/v2/firestore')

exports.notifyUsersOnActivityDelete = onDocumentDeleted('activities/{activityId}', async (event) => {
    const deletedData = event.data?.data()
    const activityId = event.params.activityId

    if (!deletedData) {
        logger.warn(`⚠️ Aucune donnée trouvée pour l'activité supprimée ${activityId}`)
        return null
    }

    try {
        // 🔹 Récupère les utilisateurs ayant réservé cette activité
        const reservationsSnap = await db.collection('reservations').where('activityId', '==', activityId).get()

        if (reservationsSnap.empty) {
            logger.info(`🚫 Aucune réservation trouvée pour l'activité supprimée ${activityId}`)
            return null
        }

        logger.info(`📢 Envoi de notifications pour la suppression de ${deletedData.title}`)

        for (const reservationDoc of reservationsSnap.docs) {
            const userId = reservationDoc.data().userId

            // 🔹 Récupère le token de notification
            const tokenSnap = await db.collection('userTokens').doc(userId).get()
            if (!tokenSnap.exists || !tokenSnap.data().token) {
                logger.warn(`⚠️ Aucun token trouvé pour l'utilisateur ${userId}`)
                continue
            }

            const token = tokenSnap.data().token

            const message = {
                token,
                notification: {
                    title: `Activité annulée : ${deletedData.title}`,
                    body: `L'activité "${deletedData.title}" a été supprimée.`,
                },
                data: {
                    url: '/user/',
                    activityId,
                },
            }

            try {
                await admin.messaging().send(message)
                logger.info(`✅ Notification de suppression envoyée à ${userId} pour ${deletedData.title}`)
            } catch (err) {
                logger.error(`❌ Erreur d'envoi à ${userId} :`, err)
            }
        }

        logger.info(`🎯 Notifications envoyées pour la suppression de ${activityId}`)
        return null
    } catch (error) {
        logger.error('🔥 Erreur dans notifyUsersOnActivityDelete :', error)
        return null
    }
})
