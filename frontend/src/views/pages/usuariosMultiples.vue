<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '../../api/axios'
import { useNotificationStore } from '../../stores/toastNotify'
import { connectSocket } from '../../services/socket'
import { setupLucide } from '../../assets/js/lucide'
import { useAuthStore } from '../../stores/auth'
import usuariosModal from '../../components/usuariosModal.vue'

const notif = useNotificationStore()
const usuarios = ref([])
const rol = ref([])
const search = ref('')
const filtroRol = ref('')
const filtroEstado = ref('')
const auth = useAuthStore()
const detalleVisible = ref(false)
const usuarioDetalle = ref(null)

let socket = null

async function getUsuarios() {
    try {
        const { data } = await api.get('/users/stats')
        usuarios.value = data
        nextTick(() => setupLucide())
    } catch (error) {
        notif.notify(error.response?.data?.message || 'Error al conectar con la base de datos', 'error')
    }
}

async function getRoles() {
    try {
        const { data } = await api.get('/roles')
        rol.value = data
        nextTick(() => setupLucide())
    } catch (error) {
        notif.notify(error.response?.data?.message || 'Error al conectar con la base de datos', 'error')
    }
}

function verDetalle(u) {
    usuarioDetalle.value = u
    detalleVisible.value = true
}

function cerrarDetalle() {
    detalleVisible.value = false
    usuarioDetalle.value = null
}
function onPresence({ id, online, ultimo_visto }) {
    const u = usuarios.value.find(x => x.id === id)
    if (!u) return
    u.online = online
    if (!online && ultimo_visto) u.ultimo_visto = ultimo_visto
}

onMounted(async () => {
    socket = connectSocket(auth.token)

    socket.on('presence:update', onPresence)
    socket.on('connect', getUsuarios) 

    await getUsuarios()
    await getRoles()
})
onUnmounted(() => {
    socket?.off('presence:update', onPresence)
    socket?.off('connect', getUsuarios)
})

// Estadísticas
const total = computed(() => usuarios.value.length)
const activos = computed(() => usuarios.value.filter(u => u.activo === 'A').length)
const inactivos = computed(() => total.value - activos.value)
const enLinea = computed(() => usuarios.value.filter(u => u.online).length)
const desconectados = computed(() => total.value - enLinea.value)

// Filtros
const opcionesRol = computed(() => {
    if (rol.value.length) return rol.value.map(r => r.nombre)
    return [...new Set(usuarios.value.map(u => u.rol))]
})

const filtrados = computed(() => {
    const q = search.value.trim().toLowerCase()
    return usuarios.value.filter(u =>
        (!q || [u.nombre, u.apellido, u.username, u.email].some(v => String(v ?? '').toLowerCase().includes(q))) &&
        (!filtroRol.value || u.rol === filtroRol.value) &&
        (!filtroEstado.value || u.activo === filtroEstado.value)
    )
})

// Helpers de presentación
const iniciales = (u) => `${u.nombre?.[0] ?? ''}${u.apellido?.[0] ?? ''}`.toUpperCase()

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
function haceCuanto(fecha) {
    if (!fecha) return 'Nunca'
    const seg = Math.round((new Date(fecha) - Date.now()) / 1000)
    const tramos = [['day', 86400], ['hour', 3600], ['minute', 60]]
    for (const [unidad, s] of tramos) {
        if (Math.abs(seg) >= s) return rtf.format(Math.round(seg / s), unidad)
    }
    return 'hace un momento'
}
</script>
<template>
    <div class="space-y-6 animate-page">

        <!-- ENCABEZADO -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>

                <h1 class="text-2xl font-bold text-white tracking-tight">
                    Administración de usuarios
                </h1>

                <p class="text-sm text-gray-400 mt-1">
                    Control y supervisión de las cuentas del sistema.
                </p>
            </div>

            <div class="flex items-center gap-3">
                <button class="btn-secondary">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    Exportar
                </button>

                <button class="btn-primary">
                    <i data-lucide="user-plus" class="w-4 h-4"></i>
                    Nuevo usuario
                </button>
            </div>
        </div>

        <!-- ESTADÍSTICAS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            <div class="stat-card">
                <div class="flex justify-between items-start">
                    <div class="stat-icon bg-violet-500/10 text-violet-400">
                        <i data-lucide="users"></i>
                    </div>
                    <span class="stat-tag text-violet-400 bg-violet-500/10">
                        General
                    </span>
                </div>

                <p class="stat-label">Total de usuarios</p>
                <h2 class="stat-number">{{ total }}</h2>
                <p class="stat-description">Usuarios registrados en el sistema</p>
            </div>

            <div class="stat-card">
                <div class="flex justify-between items-start">
                    <div class="stat-icon bg-emerald-500/10 text-emerald-400">
                        <i data-lucide="user-check"></i>
                    </div>
                    <span class="stat-tag text-emerald-400 bg-emerald-500/10">
                        Habilitados
                    </span>
                </div>

                <p class="stat-label">Usuarios activos</p>
                <h2 class="stat-number text-emerald-400">{{ activos }}</h2>
                <p class="stat-description">Cuentas habilitadas para acceder</p>
            </div>

            <div class="stat-card">
                <div class="flex justify-between items-start">
                    <div class="stat-icon bg-red-500/10 text-red-400">
                        <i data-lucide="user-x"></i>
                    </div>
                    <span class="stat-tag text-red-400 bg-red-500/10">
                        Deshabilitados
                    </span>
                </div>

                <p class="stat-label">Usuarios inactivos</p>
                <h2 class="stat-number text-red-400">{{ inactivos }}</h2>
                <p class="stat-description">Cuentas deshabilitadas</p>
            </div>

            <div class="stat-card">
                <div class="flex justify-between items-start">
                    <div class="stat-icon bg-sky-500/10 text-sky-400">
                        <i data-lucide="activity"></i>
                    </div>
                    <span class="stat-tag text-sky-400 bg-sky-500/10">
                        Tiempo real
                    </span>
                </div>

                <p class="stat-label">Usuarios en línea</p>
                <h2 class="stat-number text-sky-400">{{ enLinea }}</h2>
                <p class="stat-description">Conexiones activas</p>
            </div>

        </div>

        <!-- ACTIVIDAD Y CONEXIONES -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div class="lg:col-span-2 panel-card">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h2 class="text-base font-semibold text-white">
                            Actividad de usuarios
                        </h2>
                        <p class="text-xs text-gray-500 mt-1">
                            Resumen de conexiones
                        </p>
                    </div>

                    <span class="live-indicator">
                        <span></span>
                        Monitoreo
                    </span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    <div class="activity-box">
                        <div class="flex items-center gap-2">
                            <span class="connection-dot bg-emerald-400"></span>
                            <span class="text-xs text-gray-400">En línea</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white mt-3">{{ enLinea }}</h3>
                        <p class="text-xs text-gray-500 mt-1">Conectados ahora</p>
                    </div>

                    <div class="activity-box">
                        <div class="flex items-center gap-2">
                            <span class="connection-dot bg-gray-500"></span>
                            <span class="text-xs text-gray-400">Desconectados</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white mt-3">{{ desconectados }}</h3>
                        <p class="text-xs text-gray-500 mt-1">Sin conexión</p>
                    </div>
                </div>
            </div>

            <!-- INFORMACIÓN -->
            <div class="panel-card flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                            <i data-lucide="shield-check" class="w-5 h-5"></i>
                        </div>
                        <h2 class="text-sm font-semibold text-white">
                            Seguridad de cuentas
                        </h2>
                    </div>

                    <p class="text-xs text-gray-400 leading-relaxed">
                        Supervisa los accesos, estados de las cuentas y actividad
                        de los usuarios registrados en tu plataforma.
                    </p>
                </div>

                <div class="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span class="text-xs text-gray-500">Control de accesos</span>
                    <span class="text-xs text-emerald-400 flex items-center gap-1">
                        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                        Habilitado
                    </span>
                </div>
            </div>

        </div>

        <!-- TABLA DE USUARIOS -->
        <div class="panel-card p-0 overflow-hidden">

            <!-- CABECERA -->
            <div class="p-5 border-b border-white/5">
                <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                    <div>
                        <h2 class="text-base font-semibold text-white">
                            Directorio de usuarios
                        </h2>
                        <p class="text-xs text-gray-500 mt-1">
                            Consulta y administra las cuentas registradas.
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3">

                        <div class="search-box">
                            <i data-lucide="search" class="w-4 h-4 text-gray-500"></i>
                            <input v-model="search" type="text" placeholder="Buscar usuario..." >
                        </div>

                        <select v-model="filtroRol" class="filter-select">
                            <option value="">Todos los roles</option>
                            <option v-for="nombre  in opcionesRol" :key="nombre" :value="nombre">{{ nombre }}</option>
                        </select>

                        <select v-model="filtroEstado" class="filter-select">
                            <option value="">Todos los estados</option>
                            <option value="A">Activo</option>
                            <option value="I">Inactivo</option>
                        </select>

                    </div>
                </div>
            </div>
            <!-- TABLA -->
            <div class="overflow-x-auto">
                <table class="users-table">

                    <thead>
                        <tr>
                            <th>USUARIO</th>
                            <th>ROL</th>
                            <th>CUENTA</th>
                            <th>CONEXIÓN</th>
                            <th>ÚLTIMO ACCESO</th>
                            <th class="text-right">ACCIÓN</th>
                        </tr>
                    </thead>

                    <tbody>

                        <!-- USUARIO 1 -->
                        <tr v-for="u in filtrados" :key="u.id">
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="user-avatar" :style="{background: u.color + '33', color: u.color}">{{ iniciales(u) }}</div>
                                    <div>
                                        <p class="text-sm font-semibold text-gray-200">
                                            {{ u.nombre }} {{ u.apellido }}
                                        </p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            @{{ u.username }} · {{ u.email }}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td>
                                <span class="role-badge" :style="{ color: u.color, background: u.color + '1A' }">
                                    {{ u.rol }}
                                </span>
                            </td>

                            <td>
                                <span class="status-badge status-active" :class="u.activo === 'A' ? 'status-active' : 'status-inactive'">
                                    <span></span> {{ u.activo === 'A' ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>

                            <td>
                                <span class="connection-status online" :class="u.online ? 'online' : 'offline'">
                                    <span></span> {{ u.online ? 'En linea' : 'Desconectado' }}
                                </span>
                            </td>

                            <td class="text-xs text-gray-400">
                                {{ u.online ? 'Ahora' : haceCuanto(u.ultimo_visto || u.ultimo_login) }}
                            </td>

                            <td class="text-right">
                                <button @click="verDetalle(u)" class="action-button" title="Ver detalles">
                                    <i data-lucide="eye"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filtrados.length === 0">
                            <td colspan="6" class="text-center text-sm text-gray-500 py-8">
                                No se encontraron usuarios
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
    <usuariosModal v-if="detalleVisible && usuarioDetalle" :user="usuarioDetalle" @close="cerrarDetalle"/>
</template>

<style scoped>
/* ANIMACIONES */
.animate-page {
    animation: pageEnter .45s ease both;
}

@keyframes pageEnter {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* TARJETAS */
.stat-card,
.panel-card {
    background: #151520;
    border: 1px solid rgba(255,255,255,.055);
    border-radius: 15px;
}

.stat-card {
    padding: 19px;
    transition: transform .3s ease, border-color .3s ease,
                box-shadow .3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    border-color: rgba(139,92,246,.3);
    box-shadow: 0 10px 30px rgba(0,0,0,.18);
}

.stat-icon {
    width: 43px;
    height: 43px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.stat-icon :deep(svg) {
    width: 21px;
    height: 21px;
}

.stat-tag {
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
}

.stat-label {
    color: #9ca3af;
    font-size: 12px;
    margin-top: 18px;
}

.stat-number {
    font-size: 29px;
    font-weight: 750;
    color: #f9fafb;
    margin-top: 3px;
}

.stat-description {
    color: #6b7280;
    font-size: 11px;
    margin-top: 3px;
}

/* ACTIVIDAD */
.activity-box {
    padding: 16px;
    border: 1px solid rgba(255,255,255,.055);
    border-radius: 12px;
    background: rgba(255,255,255,.015);
}

.connection-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
}

.live-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #34d399;
    background: rgba(16,185,129,.08);
    border: 1px solid rgba(16,185,129,.15);
    border-radius: 20px;
    padding: 6px 10px;
    font-size: 10px;
}

.live-indicator span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #34d399;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(52,211,153,.4);
    }
    50% {
        opacity: .65;
        box-shadow: 0 0 0 5px rgba(52,211,153,0);
    }
}

/* BOTONES */
.btn-primary,
.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 10px 15px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    transition: all .25s ease;
}

.btn-primary {
    background: #7c3aed;
    color: white;
}

.btn-primary:hover {
    background: #8b5cf6;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(124,58,237,.25);
}

.btn-secondary {
    color: #d1d5db;
    background: #1c1c29;
    border: 1px solid rgba(255,255,255,.08);
}

.btn-secondary:hover {
    background: #252536;
    border-color: rgba(255,255,255,.15);
}

/* BUSCADOR */
.search-box {
    min-width: 210px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    border: 1px solid rgba(255,255,255,.08);
    background: #1c1c29;
    border-radius: 9px;
    transition: border-color .2s;
}

.search-box:focus-within {
    border-color: #8b5cf6;
}

.search-box input {
    width: 100%;
    background: transparent;
    outline: none;
    border: none;
    color: #e5e7eb;
    font-size: 11px;
    padding: 11px 0;
}

.search-box input::placeholder {
    color: #6b7280;
}

.filter-select {
    min-width: 145px;
    padding: 10px 12px;
    border-radius: 9px;
    background: #1c1c29;
    border: 1px solid rgba(255,255,255,.08);
    color: #d1d5db;
    font-size: 11px;
    outline: none;
}

.filter-select:focus {
    border-color: #8b5cf6;
}

.filter-select option {
    background: #1c1c29;
}

/* TABLA */
.users-table {
    width: 100%;
    min-width: 950px;
    border-collapse: collapse;
}

.users-table thead {
    background: rgba(255,255,255,.02);
}

.users-table th {
    color: #6b7280;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .07em;
    text-align: left;
    padding: 15px 20px;
}

.users-table td {
    padding: 15px 20px;
    border-top: 1px solid rgba(255,255,255,.045);
}

.users-table tbody tr {
    transition: background .2s ease;
}

.users-table tbody tr:hover {
    background: rgba(139,92,246,.045);
}

/* AVATARES */
.user-avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
}

.avatar-purple {
    color: #c4b5fd;
    background: rgba(139,92,246,.17);
}

.avatar-blue {
    color: #93c5fd;
    background: rgba(59,130,246,.17);
}

.avatar-orange {
    color: #fdba74;
    background: rgba(249,115,22,.17);
}

/* ETIQUETAS */
.role-badge,
.status-badge,
.connection-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
}

.role-badge {
    color: #c4b5fd;
    background: rgba(139,92,246,.1);
    border: 1px solid rgba(139,92,246,.15);
}

.role-blue {
    color: #93c5fd;
    background: rgba(59,130,246,.1);
    border-color: rgba(59,130,246,.15);
}

.role-green {
    color: #6ee7b7;
    background: rgba(16,185,129,.1);
    border-color: rgba(16,185,129,.15);
}

.status-active {
    color: #34d399;
    background: rgba(16,185,129,.09);
}

.status-inactive {
    color: #f87171;
    background: rgba(239,68,68,.09);
}

.status-badge span,
.connection-status span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.status-active span {
    background: #34d399;
}

.status-inactive span {
    background: #f87171;
}

.online {
    color: #34d399;
    background: rgba(16,185,129,.08);
}

.online span {
    background: #34d399;
    animation: pulse 1.5s infinite;
}

.offline {
    color: #9ca3af;
    background: rgba(107,114,128,.1);
}

.offline span {
    background: #6b7280;
}

/* ACCIONES */
.action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 33px;
    height: 33px;
    margin-left: 5px;
    border-radius: 8px;
    color: #9ca3af;
    background: rgba(255,255,255,.035);
    transition: all .2s ease;
}

.action-button:hover {
    color: #c4b5fd;
    background: rgba(139,92,246,.15);
}

.action-button :deep(svg) {
    width: 15px;
    height: 15px;
}

/* PAGINACIÓN */
.pagination-button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    color: #9ca3af;
    background: rgba(255,255,255,.035);
    font-size: 11px;
    transition: .2s;
}

.pagination-button :deep(svg) {
    width: 14px;
    height: 14px;
}

.pagination-button:hover,
.pagination-button.active {
    color: white;
    background: #7c3aed;
}

/* RESPONSIVE */
@media (max-width: 640px) {
    .stat-card {
        padding: 15px;
    }

    .stat-number {
        font-size: 25px;
    }

    .search-box {
        min-width: 100%;
    }

    .filter-select {
        width: 100%;
    }
}
</style>
