<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { setupLucide } from '../assets/js/lucide'

const props = defineProps ({
    user: {type: Object, required: true},
})

const emit = defineEmits([close]);

const iniciales = computed(() =>
    `${props.user.nombre?.[0] ?? ''}${props.user.apellido?.[0] ?? ''}`.toUpperCase()
)
const color = computed(() => props.user.color || '#8b5cf6')
const activo = computed(() => props.user.activo === 'A')

function fecha(f) {
    if (!f) return 'Nunca'
    return new Date(f).toLocaleString('es-EC', {dateStyle: 'medium', timeStyle: 'short'})
}

const detalles = computed (() => [
    { label: 'Correo',        valor: props.user.email || '—' },
    { label: 'Usuario',       valor: '@' + props.user.username },
    { label: 'Último acceso', valor: fecha(props.user.ultimo_login) },
    { label: 'Contraseña cambiada', valor: fecha(props.user.password_changed_at) }, 
])

function onKey(e) {
    if (e.key === 'Escape') emit ('close')
}

onMounted(() => {
    window.addEventListener('keydown', onKey)
    nextTick(() => setupLucide())
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4"
         @click.self="emit('close')">

        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 480px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">Detalles del usuario</h2>
                    <p class="text-xs modal-sub">Información de la cuenta</p>
                </div>
                <button @click="emit('close')"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <!-- Identidad -->
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                     :style="{ background: color + '33', color: color }">
                    {{ iniciales }}
                </div>
                <div class="min-w-0">
                    <p class="text-base font-semibold text-gray-100 truncate">
                        {{ user.nombre }} {{ user.apellido }}
                    </p>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-md"
                              :style="{ color: color, background: color + '1A' }">
                            {{ user.rol }}
                        </span>
                        <span class="text-xs font-medium px-2.5 py-1 rounded-md"
                              :class="activo ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'">
                            {{ activo ? 'Cuenta activa' : 'Cuenta inactiva' }}
                        </span>
                        <span class="text-xs font-medium px-2.5 py-1 rounded-md"
                              :class="user.online ? 'text-sky-400 bg-sky-500/10' : 'text-gray-400 bg-gray-500/10'">
                            {{ user.online ? 'En línea' : 'Desconectado' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Detalles -->
            <div class="flex flex-col divide-y divide-white/5">
                <div v-for="d in detalles" :key="d.label"
                     class="flex items-center justify-between gap-4 py-3">
                    <span class="text-xs text-gray-500">{{ d.label }}</span>
                    <span class="text-sm text-gray-200 text-right break-all">{{ d.valor }}</span>
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end">
                <button @click="emit('close')" class="btn-cancel px-4 py-2 rounded-xl text-sm border">Cerrar</button>
            </div>
        </div>
    </div>
</template>