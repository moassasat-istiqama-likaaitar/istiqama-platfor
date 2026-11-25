import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import { storage } from '@/utils/storage'
import { applyTheme } from '@/config/theme'

const STAFF_ROLES = ['super_admin', 'admin', 'editor', 'school_manager', 'teacher', 'parent', 'support']

/**
 * الجلسة: الشخص + صفاته + الصفة النشطة.
 * الصفة النشطة تحدد القائمة الجانبية والصلاحيات والثيم.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: storage.get('ist.token'),
    person: null,
    assignments: [],
    activeAssignmentId: storage.get('ist.active'),
    ready: false
  }),

  getters: {
    isAuthenticated: (s) => !!s.person,
    active: (s) => s.assignments.find((a) => a.id === s.activeAssignmentId) || null,
    role: (s) => s.assignments.find((a) => a.id === s.activeAssignmentId)?.role || null,
    hasManyAssignments: (s) => s.assignments.length > 1,
    fullName: (s) => (s.person ? `${s.person.firstName} ${s.person.lastName}` : ''),
    initials: (s) => (s.person ? s.person.firstName.charAt(0) : ''),
    /** الثيم: التلميذ حسب طوره، والبقية ثيم الطاقم */
    themeKey() {
      const a = this.active
      if (a?.role === 'student') return a.level?.phase || 'primary'
      return 'staff'
    }
  },

  actions: {
    async restore() {
      if (this.ready) return
      if (this.token) {
        try {
          this._setSession(await authApi.me(this.token))
          if (!this.active && this.assignments.length === 1) this.activeAssignmentId = this.assignments[0].id
        } catch {
          this._clear()
        }
      }
      this.ready = true
      this._applyTheme()
    },

    async login(loginValue, password, remember = true) {
      const data = await authApi.login(loginValue, password)
      this._setSession(data)
      if (remember) storage.set('ist.token', data.token)
      this.activeAssignmentId = this.assignments.length === 1 ? this.assignments[0].id : null
      this._persistActive()
      this._applyTheme()
      return data
    },

    selectAssignment(id) {
      if (!this.assignments.some((a) => a.id === id)) return
      this.activeAssignmentId = id
      this._persistActive()
      this._applyTheme()
    },

    logout() {
      this._clear()
      this._applyTheme()
    },

    updatePerson(person) {
      this.person = person
    },

    isStaff(role = this.role) {
      return STAFF_ROLES.includes(role)
    },

    _setSession({ token, person, assignments }) {
      this.token = token
      this.person = person
      this.assignments = assignments
    },
    _persistActive() {
      if (this.activeAssignmentId) storage.set('ist.active', this.activeAssignmentId)
      else storage.remove('ist.active')
    },
    _clear() {
      this.token = null
      this.person = null
      this.assignments = []
      this.activeAssignmentId = null
      storage.remove('ist.token')
      storage.remove('ist.active')
    },
    _applyTheme() {
      applyTheme(this.themeKey)
    }
  }
})
