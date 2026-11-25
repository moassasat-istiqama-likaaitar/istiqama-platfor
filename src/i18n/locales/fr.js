export default {
  app: { name: 'Plateforme numérique Al-Istiqama', short: 'Al-Istiqama', tagline: 'Une plateforme éducative unifiée, en présentiel et à distance' },
  common: {
    save: 'Enregistrer', cancel: 'Annuler', send: 'Envoyer', search: 'Rechercher', back: 'Retour', close: 'Fermer', all: 'Tout',
    unread: 'Non lu', loading: 'Chargement...', required: 'Champ obligatoire', saved: 'Enregistré',
    comingSoon: 'Disponible après la connexion au serveur', yes: 'Oui', no: 'Non', open: 'Ouvrir', new: 'Nouveau', details: 'Détails'
  },
  roles: {
    super_admin: 'Directeur général', admin: 'Superviseur général', editor: 'Éditeur', school_manager: "Directeur d'école",
    teacher: 'Enseignant', student: 'Élève', parent: 'Parent', support: 'Support technique'
  },
  themes: { staff: 'Personnel', primary: 'Primaire', middle: 'Moyen', secondary: 'Secondaire' },
  menu: {
    home: 'Accueil', users: 'Utilisateurs', 'users-list': 'Liste des utilisateurs', 'users-import': 'Import groupé',
    'users-duplicates': 'Comptes en double', 'activity-log': "Journal d'activité", library: 'Bibliothèque',
    'library-manage': 'Contenu numérique', 'library-review': 'Révision et validation', activities: 'Activités et évaluations',
    'activities-group': 'Activités et évaluations', reports: 'Rapports', 'reports-general': 'Rapports généraux',
    'reports-schools': 'Performance des écoles', 'reports-files': 'Statistiques des fichiers', 'reports-engagement': "Qualité de l'interaction",
    settings: 'Paramètres généraux', schools: 'Écoles', levels: 'Cycles et niveaux', seasons: 'Années scolaires',
    'classes-all': 'Classes', subjects: 'Matières et leçons', permissions: 'Rôles et permissions',
    customization: 'Personnalisation', announcements: 'Annonces', calendar: 'Calendrier', communication: 'Communication',
    'import-export': 'Import / Export', tickets: 'Signalements', 'quiz-builder': 'Créateur de quiz',
    'editor-reports': 'Rapports', teachers: 'Enseignants', students: 'Élèves', parents: 'Parents',
    activation: 'Activation des comptes', 'school-classes': 'Classes', 'teacher-files-review': 'Validation des fichiers',
    'content-follow': 'Suivi du contenu', performance: 'Rapports de performance', 'school-notice': "Notification à l'école",
    'my-classes': 'Mes classes', 'class-library': 'Bibliothèque de classe', submissions: 'Rendus et correction',
    'central-library': 'Bibliothèque centrale', 'upload-content': 'Téléverser un contenu', 'new-homework': 'Nouveau devoir',
    'my-files': 'Mes fichiers', 'offline-tests': 'Tests en présentiel', 'my-lessons': 'Mes leçons',
    'my-assignments': 'Mes devoirs et tests', 'my-progress': 'Mon suivi', children: 'Mes enfants',
    'child-report': 'Rapports des enfants', incidents: 'Journal des pannes', 'support-team': 'Équipe support',
    feedback: 'Signalements et suggestions', profile: 'Profil', notifications: 'Notifications', messages: 'Messages'
  },
  layout: {
    switchRole: 'Changer de rôle', currentRole: 'Rôle actuel', myRoles: 'Mes rôles', profile: 'Profil',
    logout: 'Déconnexion', language: 'Langue', openMenu: 'Menu', demoMode: 'Prototype',
    allSchools: 'Toutes les écoles', viewAll: 'Tout voir', noNotifications: 'Aucune notification'
  },
  auth: {
    welcome: 'Bienvenue', loginTitle: 'Connexion', loginHint: 'Connectez-vous pour accéder à votre espace',
    login: "Nom d'utilisateur ou e-mail", password: 'Mot de passe', remember: 'Se souvenir de moi',
    forgot: 'Mot de passe oublié ?', submit: 'Se connecter', or: 'ou', google: 'Se connecter avec Google',
    demoTitle: 'Comptes de démonstration', demoHint: 'Cliquez sur un compte pour vous connecter (mot de passe : 1234)',
    forgotTitle: 'Récupérer le mot de passe', forgotHint: 'Saisissez votre e-mail ou téléphone pour recevoir un lien',
    contact: 'E-mail ou téléphone', sendLink: 'Envoyer le lien', sent: 'Envoyé',
    sentHint: 'Si le compte existe, vous recevrez un message dans quelques minutes.', backToLogin: 'Retour à la connexion',
    chooseTitle: 'Choisissez votre rôle', chooseHint: 'Vous avez plusieurs rôles. Avec lequel voulez-vous entrer ?',
    hello: 'Bonjour {name}', switchLater: 'Vous pouvez changer de rôle à tout moment depuis le haut de la page.'
  },
  assignment: {
    classes: 'Classes : {list}', class: 'Classe : {name}', children: 'Enfants : {list}', subjects: 'Matières : {list}',
    allPlatform: 'Toutes les écoles', levels: 'Niveaux : {list}'
  },
  home: {
    greeting: 'Assalamou alaykoum, {name}', as: 'Rôle actuel : {role}', quickAccess: 'Accès rapide',
    phaseNote: 'Le tableau de bord de ce rôle sera construit en phase {phase}. Version provisoire.'
  },
  profile: {
    title: 'Profil', personal: 'Informations personnelles', lastName: 'Nom', firstName: 'Prénom',
    email: 'E-mail', phone: 'Téléphone', username: "Nom d'utilisateur", photo: 'Photo',
    changePhoto: 'Changer la photo', security: 'Mot de passe', currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe', confirmPassword: 'Confirmer', changePassword: 'Changer le mot de passe',
    mismatch: 'Les mots de passe ne correspondent pas', passwordChanged: 'Mot de passe modifié', myRoles: 'Mes rôles'
  },
  notifications: {
    title: 'Notifications', markAll: 'Tout marquer comme lu', empty: 'Aucune notification', general: 'Général',
    types: {
      lesson: 'Leçon', content: 'Contenu', assignment: 'Devoir', result: 'Résultat', message: 'Message',
      comment: 'Commentaire', submission: 'Rendu', announcement: 'Annonce', report: 'Signalement'
    }
  },
  messages: {
    title: 'Messages', newMessage: 'Nouveau message', search: 'Rechercher', empty: 'Aucune conversation',
    select: 'Choisissez une conversation', placeholder: 'Écrivez votre message...', to: 'À', subject: 'Objet', body: 'Message',
    as: 'En tant que', noContacts: 'Aucun contact disponible pour ce rôle', you: 'Vous', start: 'Démarrer'
  },
  feedback: {
    title: 'Signalements et suggestions', newTab: 'Nouveau', mineTab: 'Mes signalements', type: 'Type',
    subject: 'Titre', description: 'Description', attach: 'Joindre un fichier', submit: 'Envoyer',
    sent: 'Signalement envoyé, merci', empty: 'Aucun signalement',
    types: { content: 'Contenu', technical: 'Panne technique', suggestion: 'Suggestion' },
    status: { new: 'Nouveau', in_progress: 'En cours', done: 'Traité' }
  },
  placeholder: {
    title: 'En construction', body: 'Cet écran fait partie de la phase {phase}.', codes: 'Codes : {codes}',
    phases: { 1: 'Base', 2: 'Élève', 3: 'Parent', 4: 'Enseignant', 5: 'Éditeur', 6: "Directeur d'école", 7: 'Administration', 8: 'Support' }
  },
  errors: {
    notFound: 'Page introuvable', notFoundHint: 'Le lien a peut-être changé.',
    forbidden: 'Accès refusé', forbiddenHint: "Cette page n'est pas disponible pour votre rôle.", goHome: "Retour à l'accueil"
  },
  time: { now: "À l'instant", minutes: 'il y a {n} min', hours: 'il y a {n} h', days: 'il y a {n} j' }
}
