import { defineStore } from 'pinia'
import * as notificationsApi from '@/api/notifications'
import * as messagesApi from '@/api/messages'

/** صندوق الإشعارات والرسائل — موحّد لكل أدوار الشخص */
export const useInboxStore = defineStore('inbox', {
  state: () => ({
    notifications: [],
    conversations: [],
    loaded: false
  }),

  getters: {
    unreadNotifications: (s) => s.notifications.filter((n) => !n.read).length,
    unreadMessages: (s) => s.conversations.filter((c) => c.unread).length
  },

  actions: {
    async load(personId, force = false) {
      if (this.loaded && !force) return
      const [n, c] = await Promise.all([notificationsApi.list(personId), messagesApi.listConversations(personId)])
      this.notifications = n
      this.conversations = c
      this.loaded = true
    },
    async refreshConversations(personId) {
      this.conversations = await messagesApi.listConversations(personId)
    },
    async markRead(id) {
      const n = this.notifications.find((x) => x.id === id)
      if (n && !n.read) {
        n.read = true
        await notificationsApi.markRead(id, n.personId)
      }
    },
    async markAllRead(personId) {
      this.notifications.forEach((n) => (n.read = true))
      await notificationsApi.markAllRead(personId)
    },
    reset() {
      this.notifications = []
      this.conversations = []
      this.loaded = false
    }
  }
})
