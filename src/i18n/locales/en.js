export default {
  app: { name: 'Al-Istiqama Digital Platform', short: 'Al-Istiqama', tagline: 'A unified learning platform for in-person and remote education' },
  common: {
    save: 'Save', cancel: 'Cancel', send: 'Send', search: 'Search', back: 'Back', close: 'Close', all: 'All',
    unread: 'Unread', loading: 'Loading...', required: 'Required', saved: 'Saved',
    comingSoon: 'Available once connected to the backend', yes: 'Yes', no: 'No', open: 'Open', new: 'New', details: 'Details'
  },
  roles: {
    super_admin: 'Director General', admin: 'General Supervisor', editor: 'Editor', school_manager: 'School Manager',
    teacher: 'Teacher', student: 'Student', parent: 'Parent', support: 'Technical Support'
  },
  themes: { staff: 'Staff', kids: 'Little ones', juniors: 'Explorers', teens: 'Youth' },
  menu: {
    teaching: 'My classes', 'my-library': 'Class library',
    home: 'Home', users: 'Users', 'users-list': 'User list', 'users-import': 'Bulk import',
    'users-duplicates': 'Duplicate accounts', 'activity-log': 'Activity log', notices: 'Announcements', library: 'Library', content: 'Content', review: 'Review & approval', banks: 'Assessment banks', production: 'My production',
    'library-manage': 'Central library', 'lesson-opening': 'Lesson opening', 'activities-review': 'Activities review', 'library-review': 'Review & approval', activities: 'Activities & assessments',
    'activities-group': 'Activities & assessments', reports: 'Reports', 'reports-general': 'General reports',
    'reports-schools': 'School performance', 'reports-files': 'File statistics', 'reports-engagement': 'Engagement quality',
    settings: 'Settings', schools: 'Schools', levels: 'Cycles & levels', seasons: 'School years',
    'classes-all': 'Classes', subjects: 'Subjects & lessons', permissions: 'Roles & permissions',
    customization: 'Customization', announcements: 'Announcements', calendar: 'Calendar', communication: 'Communication',
    'import-export': 'Import / Export', tickets: 'Tickets', 'quiz-builder': 'Assessment builder',
    'editor-reports': 'Reports', teachers: 'Teachers', students: 'Students', parents: 'Parents',
    activation: 'Account activation', 'login-sheets': 'Login sheets', 'school-classes': 'Classes', 'teacher-files-review': 'Teacher files review',
    'content-follow': 'Content follow-up', performance: 'Performance reports', 'school-notice': 'School notice', 'school-identity': 'School identity', 'branding-requests': 'Identity approvals',
    'my-classes': 'My classes', 'class-library': 'Class library', submissions: 'Submissions & grading',
    'central-library': 'Central library', 'upload-content': 'Upload content', 'new-homework': 'New homework',
    'my-files': 'My files', 'offline-tests': 'In-class tests', 'my-lessons': 'My lessons',
    'my-assignments': 'My assignments', 'my-progress': 'My progress', children: 'My children',
    'child-report': 'Children reports', incidents: 'Incident log', 'support-team': 'Support team',
    feedback: 'Reports & suggestions', profile: 'Profile', notifications: 'Notifications', messages: 'Messages'
  },
  layout: {
    switchRole: 'Switch role', currentRole: 'Current role', myRoles: 'My roles', profile: 'Profile',
    logout: 'Log out', language: 'Language', openMenu: 'Menu', demoMode: 'Prototype',
    allSchools: 'All schools', viewAll: 'View all', allNotices: 'All announcements', noNotifications: 'No notifications'
  },
  auth: {
    welcome: 'Welcome', loginTitle: 'Sign in', loginHint: 'Sign in to access your space',
    login: 'Username or email', password: 'Password', remember: 'Remember me',
    forgot: 'Forgot password?', submit: 'Sign in', or: 'or', google: 'Sign in with Google',
    demoTitle: 'Demo accounts', demoHint: 'Click any account to sign in (password: 1234)',
    forgotTitle: 'Reset password', forgotHint: 'Enter your email or phone and we will send a reset link',
    contact: 'Email or phone', sendLink: 'Send link', sent: 'Sent',
    sentHint: 'If the account exists, you will receive a message shortly.', backToLogin: 'Back to sign in',
    chooseTitle: 'Choose your role', chooseHint: 'You have more than one role. Which one do you want to use?',
    hello: 'Hello {name}', switchLater: 'You can switch roles at any time from the top of the page.'
  },
  assignment: {
    classes: 'Classes: {list}', class: 'Class: {name}', children: 'Children: {list}', subjects: 'Subjects: {list}',
    allPlatform: 'All schools', levels: 'Levels: {list}'
  },
  home: {
    greeting: 'Peace be upon you, {name}', as: 'Current role: {role}', quickAccess: 'Quick access',
    phaseNote: 'The dashboard for this role is built in phase {phase}. Preliminary version.'
  },
  profile: {
    title: 'Profile', personal: 'Personal information', lastName: 'Last name', firstName: 'First name',
    email: 'Email', phone: 'Phone', username: 'Username', photo: 'Photo',
    changePhoto: 'Change photo', security: 'Password', currentPassword: 'Current password',
    newPassword: 'New password', confirmPassword: 'Confirm password', changePassword: 'Change password',
    mismatch: 'Passwords do not match', passwordChanged: 'Password changed', myRoles: 'My roles'
  },
  notifications: {
    title: 'Notifications', markAll: 'Mark all as read', empty: 'No notifications here', general: 'General',
    types: {
      lesson: 'Lesson', content: 'Content', assignment: 'Assignment', result: 'Result', message: 'Message',
      comment: 'Comment', submission: 'Submission', announcement: 'Announcement', report: 'Report'
    }
  },
  messages: {
    title: 'Messages', newMessage: 'New message', search: 'Search conversations', empty: 'No conversations',
    select: 'Select a conversation', placeholder: 'Type your message...', to: 'To', subject: 'Subject', body: 'Message',
    as: 'As', noContacts: 'No contacts available for this role', you: 'You', start: 'Start conversation'
  },
  feedback: {
    title: 'Reports & suggestions', newTab: 'New report', mineTab: 'My reports', type: 'Type',
    subject: 'Title', description: 'Description', attach: 'Attach a file', submit: 'Submit',
    sent: 'Your report was sent, thank you', empty: 'No reports yet',
    types: { content: 'Content', technical: 'Technical issue', suggestion: 'Suggestion' },
    status: { new: 'New', in_progress: 'In progress', done: 'Done' }
  },
  placeholder: {
    title: 'Under construction', body: 'This screen belongs to phase {phase}.', codes: 'Screen codes: {codes}',
    phases: { 1: 'Foundation', 2: 'Student', 3: 'Parent', 4: 'Teacher', 5: 'Editor', 6: 'School manager', 7: 'Administration', 8: 'Support' }
  },
  errors: {
    notFound: 'Page not found', notFoundHint: 'The link may have changed.',
    forbidden: 'Access denied', forbiddenHint: 'This page is not available for your current role.', goHome: 'Back to home'
  },
  student: {
    nav: { home: 'Home', lessons: 'My lessons', assignments: 'My assignments', progress: 'My progress' },
    stars: 'stars', points: 'points', streak: 'day streak', streakShort: 'days',
    hello: { kids: 'Hello champion!', juniors: 'Hi explorer!', teens: 'Welcome back' },
    continue: 'Continue where you left off', mySubjects: 'My subjects', upcoming: 'Up next', badges: 'My badges', todayGoal: "Today's goal",
    types: { video: 'Video', slides: 'Slides', pdf: 'Document', image: 'Image', quiz: 'Quiz', homework: 'Homework' },
    classification: { main: 'Core', enrichment: 'Enrichment', activity: 'Activity' }
  },
  library: {
    title: 'Central library', subtitle: 'All content and activities by level, subject and lesson',
    search: 'Search', level: 'Level', subject: 'Subject', type: 'Type', classification: 'Category', status: 'Status', all: 'All',
    results: '{n} items', empty: 'No results', reset: 'Clear filters',
    statuses: { approved: 'Approved', temp: 'Temporarily approved', pending: 'In review', draft: 'Draft', rejected: 'Rejected' },
    stats: { total: 'items', videos: 'videos', pending: 'pending review' },
    addToClass: 'Add to my class', added: 'Added (demo)', author: 'Author', views: '{n} views', lesson: 'Lesson', preview: 'Preview', questions: '{n} questions'
  },
  time: { now: 'Just now', minutes: '{n} min ago', hours: '{n} h ago', days: '{n} d ago' }
}
