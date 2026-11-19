<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toUpperCase } from '../helper/textHelper'
import { setupLucide } from '../assets/js/lucide'
import api from '../api/axios'

const emit = defineEmits(['close', 'save', 'update'])
const notif = useNotificationStore()
const roles = ref([])
const username = ref('')
const password = ref('')
const rol = ref('')
const activo = ref('')
const nombre = ref('')
const apellido = ref('')
const email = ref('')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD = 8

async function getRols() {
    try {
        const { data } = await api.get('/roles');
        roles.value = data;
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

const rolesFiltrados = computed(() => {
    return roles.value.filter(rol => rol.id !== 1)
})

onMounted(() => {
    setupLucide(),
    getRols()
})

function guardar() {
    const emailLimpio = email.value.trim().toLowerCase()
    const esCrear = ! props

    if (!nombre || !apellido || !username.value || !rol.value || !activo.value) {
        notif.notify('Campos obligatorios', 'warning');
        return;
    }

    if (!EMAIL_REGEX.test(emailLimpio)){
        notif.notify('Ingrese un correo electronico')
    }

    if (esCrear && !password.user)
    {
        notif.notify('La contraseña es obligatorio', 'warning')
    }

    if (password.value && password.value.length < MIN_PASSWORD) {
        notif.notify(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`, 'warning')
    }
    const data = {
        nombre: nombre.value,
        apellido: apellido.value,
        username: username.value,
        email: emailLimpio,
        password: password.value,
        rol_id: rol.value,
        activo: activo.value
    }

    if (password.value) data.password = password.value

    if (props.user) {
        emit('update', { id: props.user.id, ...data })
    } else {
        emit('save', data)
    }
}

const props = defineProps({
    user: Object
})

const idEdit = computed(() => {
    return props.user ? props.user.id : null;
})

watch(() => props.user, (newUser) => {

    if (newUser) {
        username.value = newUser.username;
        email.value = newUser.email;
        nombre.value = newUser.nombre;
        apellido.value = newUser.apellido;
        password.value = '';
        rol.value = Number(newUser.rol_id);
        activo.value = newUser.activo ?? '';
    } else {
        // 👉 CREAR → limpiar
        username.value = '';
        password.value = '';
        rol.value = '';
        activo.value = '';
        nombre.value = '';
        apellido.value = '';
        email.value = '';
    }

}, { immediate: true })

function cerrarmodal(){
  username.value = '';
  password.value = '';
  rol.value = '';
  activo.value = '';
  nombre.value = '';
  apellido.value = '';
  email.value = '';

  emit('close');
}
</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 720px;">
            
            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">{{ idEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
                    <p class="text-xs modal-sub">Completa los campos para {{ idEdit ? 'editar el usuario' : 'crear el usuario' }}</p>
                </div>
                <button @click="cerrarmodal"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <!-- Campos -->
            <div class="flex flex-col gap-4 flex-1">

                <!-- Nombres -->
                <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Nombres <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="user" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="nombre" @input="nombre = toUpperCase($event.target.value)" type="text" placeholder="Ej: xavier..."
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                    <p class="text-xs field-hint">Sin espacios, puede incluir guion bajo</p>
                </div>
                <!-- Apellidos -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Apellidos <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="user" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="apellido" @input="apellido = toUpperCase($event.target.value)" type="text" placeholder="Ej: Toapanta..."
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                    <p class="text-xs field-hint">Sin espacios, puede incluir guion bajo</p>
                </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                <!-- email -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Email <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="mail" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="email" type="email" placeholder="Ej: xavierdev23@gmail.com"
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                    <p class="text-xs field-hint">Sin espacios, puede incluir guion bajo</p>
                </div>
                <!-- Username -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Username <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="user" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="username" type="text" placeholder="Ej: xavier_ec"
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                    <p class="text-xs field-hint">Sin espacios, puede incluir guion bajo</p>
                </div>
                </div>
                <!-- Password -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Contraseña <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="lock" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="password" type="password" :placeholder="props.user ? 'Nueva contraseña (opcional)' : '••••••••'"
                            class="bg-transparent outline-none text-sm w-full" />
                        <i data-lucide="eye" class="w-4 h-4 text-gray-400 shrink-0 cursor-pointer"></i>
                    </div>
                    <p class="text-xs field-hint">Mínimo 8 caracteres</p>
                </div>

                <!-- Rol -->
                <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Rol <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="shield" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <select v-model="rol" class="bg-transparent outline-none text-sm w-full cursor-pointer" style="color:#9490b0;">
                            <option value="">Selecciona un rol</option>
                            <option v-for="rol in rolesFiltrados" :key="rol.id" :value="rol.id">{{ rol.nombre }}</option>
                        </select>
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        ACTIVO <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="sparkle" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <select v-model="activo" class="bg-transparent outline-none text-sm w-full cursor-pointer" style="color:#9490b0;">
                            <option value="">Selecciona el activo</option>
                            <option value="A">A</option>
                            <option value="I">I</option>
                        </select>
                    </div>
                </div>
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3">
                <button @click="cerrarmodal" class="btn-cancel px-4 py-2 rounded-xl text-sm border">Cancelar</button>
                <button @click="guardar" class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                    <i data-lucide="save" class="btn-icon w-4 h-4"></i> {{ idEdit ? 'Actualizar' : 'Guardar' }}
                </button>
            </div>

        </div>
    </div>
</template>