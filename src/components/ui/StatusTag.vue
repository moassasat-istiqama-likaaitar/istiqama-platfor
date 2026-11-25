<template>
  <span class="st" :class="'st--' + (map[status]?.tone || 'gray')"><i v-if="map[status]?.icon" :class="map[status].icon" />{{ map[status]?.label || status }}</span>
</template>

<script setup>
defineProps({ status: String })
// الحالات الموحّدة في كل المنصة (لون + أيقونة + نص، لا اللون وحده)
const map = {
  active: { label: 'مفعّل', tone: 'green', icon: 'pi pi-check' },
  pending: { label: 'بانتظار التفعيل', tone: 'amber', icon: 'pi pi-clock' },
  content_pending: { label: 'قيد المراجعة', tone: 'amber', icon: 'pi pi-clock' },
  suspended: { label: 'موقوف', tone: 'red', icon: 'pi pi-ban' },
  archived: { label: 'مؤرشف', tone: 'gray', icon: 'pi pi-box' },
  approved: { label: 'معتمد', tone: 'green', icon: 'pi pi-check' },
  temp: { label: 'مؤقت', tone: 'blue', icon: 'pi pi-hourglass' },
  review: { label: 'قيد المراجعة', tone: 'amber', icon: 'pi pi-clock' },
  pending_review: { label: 'قيد المراجعة', tone: 'amber', icon: 'pi pi-clock' },
  draft: { label: 'مسودة', tone: 'gray', icon: 'pi pi-pencil' },
  rejected: { label: 'مرفوض', tone: 'red', icon: 'pi pi-times' },
  submitted: { label: 'بانتظار التصحيح', tone: 'amber', icon: 'pi pi-inbox' },
  graded: { label: 'مصحَّح', tone: 'green', icon: 'pi pi-check' },
  late: { label: 'متأخر', tone: 'red', icon: 'pi pi-exclamation-circle' },
  missing: { label: 'لم يُسلَّم', tone: 'gray', icon: 'pi pi-minus' },
  new: { label: 'جديد', tone: 'blue', icon: 'pi pi-circle-fill' },
  open: { label: 'مفتوح', tone: 'blue', icon: 'pi pi-circle' },
  in_progress: { label: 'قيد المعالجة', tone: 'amber', icon: 'pi pi-spinner' },
  waiting: { label: 'بانتظار المستخدم', tone: 'purple', icon: 'pi pi-user' },
  done: { label: 'مُغلق', tone: 'green', icon: 'pi pi-check' },
  resolved: { label: 'تم الحل', tone: 'green', icon: 'pi pi-check' },
  scheduled: { label: 'مجدول', tone: 'purple', icon: 'pi pi-calendar' },
  published: { label: 'منشور', tone: 'green', icon: 'pi pi-send' },
  investigating: { label: 'قيد التحقيق', tone: 'amber', icon: 'pi pi-search' },
  monitoring: { label: 'تحت المراقبة', tone: 'blue', icon: 'pi pi-eye' },
  closed: { label: 'منتهي', tone: 'gray', icon: 'pi pi-lock' }
}
</script>

<style scoped>
.st { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
.st i { font-size: 0.7rem; }
.st--green { background: #e6f6ec; color: #17733f; }
.st--amber { background: #fff3d6; color: #8a5a00; }
.st--red { background: #fde8e8; color: #b42318; }
.st--blue { background: #e7f0fe; color: #2350c8; }
.st--purple { background: #f0eafd; color: #6b3fc4; }
.st--gray { background: #eef0f4; color: #4b5565; }
</style>
