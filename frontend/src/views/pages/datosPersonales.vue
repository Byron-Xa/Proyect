<script setup>
import { ref, onMounted, nextTick  } from 'vue'
import api from '../../api/axios'
import { useNotificationStore } from '../../stores/toastNotify'
import { useAuthStore } from '../../stores/auth'
import {puedeEditar} from '../../helper/permisos'
import { toUpperCase, toCapitalize } from '../../helper/textHelper'

const auth = useAuthStore();
const usuarios = ref({ nombre: '', apellido: '', email: '', username: '' })
const notif = useNotificationStore();
const guardando = ref(false)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function getUsuarios() {
    try {
        const { data } = await api.get('/users/me');
        usuarios.value = data;
        notif.notify('Usuarios recibidos exitosamente', 'success');
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getUsuarios();
})

async function Actualizar(data) {

    const datos = {
        nombre: String(usuarios.value.nombre ?? '').trim(),
        apellido: String(usuarios.value.apellido ?? '').trim(),
        username: String(usuarios.value.username ?? '').trim(),
        email: String(usuarios.value.email ?? '').trim().toLowerCase(),
    }

    if (!datos.nombre || !datos.apellido || !datos.username) {
        notif.notify('Completa todos los campos', 'warning')
        return
    }

    if (!EMAIL_REGEX.test(datos.email)){
        notif.notify('Ingrese un correo electrónico válido', 'warning')
        return
    }

    try {
        guardando.value = true
        await api.put('/users/me', datos) 
        await getUsuarios()
        usuarios.value = { ...usuarios.value, ...datos }
        auth.user = { ...auth.user, username: datos.username }
        localStorage.setItem('user', JSON.stringify(auth.user))
        notif.notify('Se actualizo tus datos', 'success')
    } catch (error) {
        notif.notify('Error en el servidor', 'error')
    } finally {
        guardando.value = false
    }
}
</script>
<template>
<div class="min-h-screen p-5 md:p-8 text-white">
    <!--Encabezado-->
    <div class="mb-8 animate-fade-in">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <i data-lucide="contact" class="w-6 h-6 text-violet-400"></i>
            </div>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Datos personales</h1>
                <p class="text-sm text-gray-400 mt-1">
                    Actualizar tu informacion personal
                </p>
            </div>
        </div>
        <div class="h-px bg-gradient-to-r from-violet-500/40 via-gray-700/40 to-transparent mt-6"></div>
    </div>
        <!-- Formulario principal -->
        <div class="xl:col-span-2 animate-slide-up">
            <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-xl">
                <div class="flex items-center justify-between mb-7">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <i data-lucide="user-round" class="w-5 h-5 text-violet-400"></i>
                        </div>
                        <div>
                            <h2 class="font-semibold text-lg">Información personal</h2>
                            <p class="text-xs text-gray-500 mt-1">
                            Datos genarles de tu perfil
                            </p>
                        </div>
                    </div>
                    <span class="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5 rounded-lg">
                        Mi perfil
                    </span>
                </div>
                <!-- Campos -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Nombres -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-300">
                        Nombres
                        </label>
                        <div class="relative group">
                            <i data-lucide="user" class="field-icon"></i>
                            <input v-model="usuarios.nombre" v-if="puedeEditar('usuarios')" @input="usuarios.nombre = toUpperCase($event.target.value)" type="text" placeholder="Ingresa tus nombres" class="personal-input">
                        </div>
                    </div>
                    <!-- Apellidos -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-300">
                        Apellidos
                        </label>
                        <div class="relative group">
                            <i data-lucide="users" class="field-icon"></i>
                            <input v-model="usuarios.apellido" v-if="puedeEditar('usuarios')" @input="usuarios.apellido = toUpperCase($event.target.value)" type="text" placeholder="Ingresa tus apellidos" class="personal-input">
                        </div>
                    </div>
                    <!-- Correo -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-300">
                        Correo electronico
                        </label>
                        <div class="relative group">
                            <i data-lucide="mail" class="field-icon"></i>
                            <input v-model="usuarios.email" v-if="puedeEditar('usuarios')" type="email" placeholder="ejemplo@correo.com" autocomplete="email" class="personal-input">
                        </div>
                        <p class="text-xs text-gray-500">
                        Utiliza un correo electronico valido
                        </p>
                    </div>
                    <!-- Username -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-300">
                        Apodo
                        </label>
                        <div class="relative group">
                            <i data-lucide="users" class="field-icon"></i>
                            <input v-model="usuarios.username" v-if="puedeEditar('usuarios')" @input="usuarios.username = toCapitalize($event.target.value)" type="text" placeholder="Ingresa tu nombre o apodo" class="personal-input">
                        </div>
                    </div>
                </div>
                <!-- Separador -->
                <div class="h-px bg-white/[0.06] my-8"></div>
                <!-- Informacion adicional -->
                <div class="flex items-start gap-3 p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/10">
                    <i data-lucide="info" class="w-5 h-5 text-violet-400 shrink-0 mt-0.5"></i>
                    <div>
                        <h3 class="text-sm font-medium text-gray-200">
                            Mante tus datos Actualizados
                        </h3>
                        <p class="text-xs text-gray-400 mt-1 leading-relaxed">
                            Tu información personal permite identificarte correctamente dentro del sistema.
                        </p>
                    </div>
                </div>
                <!-- Botones -->
                <div class="flex flex-col sm:flex-row justify-end gap-3 mt-7">
                    <button @click="Actualizar" :disabled="guardando" v-if="puedeEditar('usuarios')" type="button" class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-900/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>
        </div>
        <!-- Panel lateral -->
        <div class="space-y-6 animate-slide-up-delay">
            <!-- Identidad -->
            <div class="relative overflow-hidden bg-[#15151f] border border-white/[0.06] rounded-2xl p-6">
                <div class="absolute -right-10 -top-10 w-36 h-36 bg-violet-600/10 rounded-full blur-3xl"></div>
                <div class="relative">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center mb-5">
                        <i data-lucide="user-round" class="w-7 h-7 text-violet-400"></i>
                    </div>
                        <h3 class="text-lg font-semibold">{{ usuarios.nombre }}</h3>
                        <p class="text-sm text-gray-400 mt-2 leading-relaxed">
                            Esta información representa tu identidad dentro de la plataforma. Procura mantenerla correcta y actualizada.
                        </p>
                </div>
            </div>
            <!-- Recomendaciones -->
            <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6">
                <h3 class="font-semibold text-gray-200 mb-5 flex items-center gap-2">
                    <i data-lucide="clipboard-check" class="w-5 h-5 text-violet-400"></i>
                    Consideraciones
                </h3>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400 shrink-0"></i>
                        <p class="text-sm text-gray-400">
                            Utiliza tus nombres apellidos reales.
                        </p>
                    </div>
                    <div class="flex items-start gap-3">
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400 shrink-0"></i>
                        <p class="text-sm text-gray-400">
                            Verifica que tu correo este escrito correctamente.
                        </p>
                    </div>
                    <div class="flex items-start gap-3">
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400 shrink-0"></i>
                        <p class="text-sm text-gray-400">
                            Revisa tu informacion antes de guardar.
                        </p>
                    </div>
                </div>
            </div>
            <!-- Privacidad -->
            <div class="flex gap-3 p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/10">
                <i data-lucide="shield-check" class="w-5 h-5 text-blue-400 shrink-0 mt-0.5"></i>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Tus datos personales están protegidos mediante los controles de seguridad del sistema.
                </p>
            </div>
        </div>
</div>
</template>

<style scoped>
.field-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 19px;
  height: 19px;
  color: #77778c;
  transition: color 0.3s ease;
  pointer-events: none;
}

.group:focus-within .field-icon {
  color: #a78bfa;
}

.personal-input {
  width: 100%;
  height: 50px;
  padding: 0 16px 0 48px;
  background: #101019;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.personal-input::placeholder {
  color: #646477;
}

.personal-input:hover {
  border-color: rgba(139,92,246,0.3);
}

.personal-input:focus {
  border-color: rgba(139,92,246,0.7);
  background: #141421;
  box-shadow: 0 0 0 3px rgba(139,92,246,0.10);
}

.animate-fade-in {
  animation: fadeIn 0.6s ease both;
}

.animate-slide-up {
  animation: slideUp 0.6s ease both;
}

.animate-slide-up-delay {
  animation: slideUp 0.7s ease 0.12s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-up,
  .animate-slide-up-delay {
    animation: none;
  }
}
</style>

  