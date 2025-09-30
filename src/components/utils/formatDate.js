// FILE: src/utils/formatDate.js
import { format, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatActivityDate(dateString) {
    const date = new Date(dateString)

    if (isToday(date)) {
        return `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`
    }
    if (isTomorrow(date)) {
        return `Demain à ${format(date, 'HH:mm', { locale: fr })}`
    }
    return format(date, 'EEEE d MMMM à HH:mm', { locale: fr })
}
