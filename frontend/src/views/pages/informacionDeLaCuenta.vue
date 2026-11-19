<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import api from '../../api/axios'
import { useNotificationStore } from '../../stores/toastNotify'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore();
const usuarios = ref([]);
const notif = useNotificationStore();

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

const ultimoAcceso = computed(() => {
    if (!usuarios.value?.ultimo_login) return 'Nunca'
    return new Date(usuarios.value.ultimo_login).toLocaleString('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
})

const estadoActivo = computed(() => usuarios.value?.activo === 'A')

const estiloRol = computed(() => {
    const c = usuarios.value?.color || '#8b5cf6'
    return { color: c,  backgroundColor: `${c}1A`, borderColor: `${c}33`,}
})

const expiraSesion = computed(() => {
    try {
        const payload = auth.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const { exp} = JSON.parse(atob(payload))
        return new Date(exp * 1000).toLocaleTimeString('es-EC', {timeStyle: 'short'})
    } catch {
        return null
    }
})
</script>
<template>
  <div class="min-h-screen p-5 md:p-8 text-white">
    <!-- Encabezado -->
    <div class="mb-8 animate-fade-in">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <i data-lucide="user-round-check" class="w-6 h-6 text-violet-400"></i>
        </div>

        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            Información de la cuenta
          </h1>
          <p class="text-sm text-gray-400 mt-1">
            Consulta los detalles y el estado de tu cuenta.
          </p>
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-violet-500/40 via-gray-700/40 to-transparent mt-6"></div>
    </div>

    <!-- Contenido -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Panel principal -->
      <div class="xl:col-span-2 space-y-6 animate-slide-up">

        <!-- Resumen de cuenta -->
        <div class="relative overflow-hidden bg-[#15151f] border border-white/[0.06] rounded-2xl p-6 md:p-8">

          <div class="absolute -right-16 -top-16 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl"></div>

          <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">

            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-purple-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <i data-lucide="user-round" class="w-10 h-10 text-violet-300"></i>
            </div>

            <div class="flex-1">
              <p class="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Cuenta de usuario
              </p>

              <h2 class="text-xl md:text-2xl font-bold">
              {{ usuarios.nombre }}
              </h2>

              <p class="text-sm text-gray-400 mt-1">
                {{ usuarios.email }}
              </p>

              <div class="flex flex-wrap gap-2 mt-4">
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-xs font-medium"
                :class="estadoActivo  ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' : 'bg-red-500/10 border-red-500/10 text-red-400'">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" :class="estadoActivo ? 'bg-emerald-400' : 'bg-red-400'"></span>
                  {{ estadoActivo ? 'Cuenta activa' : 'Cuenta inactiva' }}
                </span>

                <span v-if="usuarios" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/10 text-violet-400 text-xs font-medium" :style="estiloRol">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                  {{ usuarios.rol }}
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Información general -->
        <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6 md:p-8">

          <div class="flex items-center gap-3 mb-7">
            <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <i data-lucide="contact-round" class="w-5 h-5 text-violet-400"></i>
            </div>

            <div>
              <h3 class="text-lg font-semibold">
                Datos de la cuenta
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Identificación dentro del sistema
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Usuario -->
            <div class="account-item">
              <div class="account-icon">
                <i data-lucide="at-sign"></i>
              </div>
              <div class="min-w-0">
                <p class="account-label">Nombre de usuario</p>
                <p class="account-value">{{ usuarios.nombre }}</p>
              </div>
            </div>

            <!-- Correo -->
            <div class="account-item">
              <div class="account-icon">
                <i data-lucide="mail"></i>
              </div>
              <div class="min-w-0">
                <p class="account-label">Correo electrónico</p>
                <p class="account-value break-all">{{ usuarios.email }}</p>
              </div>
            </div>

            <!-- Rol -->
            <div class="account-item">
              <div class="account-icon">
                <i data-lucide="shield"></i>
              </div>
              <div class="min-w-0">
                <p class="account-label">Rol asignado</p>
                <p class="account-value">{{ usuarios.rol }}</p>
              </div>
            </div>

            <!-- Estado -->
            <div class="account-item">
              <div class="account-icon">
                <i data-lucide="activity"></i>
              </div>
              <div class="min-w-0">
                <p class="account-label">Estado de la cuenta</p>
                <p class="account-value text-emerald-400">{{ usuarios.activo }}</p>
              </div>
            </div>

            <!-- Último acceso -->
            <div class="account-item">
              <div class="account-icon">
                <i data-lucide="clock"></i>
              </div>
              <div class="min-w-0">
                <p class="account-label">Último acceso</p>
                <p class="account-value">{{ ultimoAcceso }}</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Seguridad de la cuenta -->
        <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6 md:p-8">

          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <i data-lucide="shield-check" class="w-5 h-5 text-violet-400"></i>
            </div>

            <div>
              <h3 class="text-lg font-semibold">
                Seguridad de la cuenta
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Información sobre la protección de tu acceso
              </p>
            </div>
          </div>

          <div class="space-y-4">

            <div class="security-item">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <i data-lucide="lock-keyhole" class="w-4 h-4 text-emerald-400"></i>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-200">
                    Contraseña
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Protegida mediante cifrado
                  </p>
                </div>
              </div>

              <span class="text-xs text-emerald-400">Protegida</span>
            </div>

            <div class="security-item">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <i data-lucide="key-round" class="w-4 h-4 text-emerald-400"></i>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-200">
                    Autenticación
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Acceso mediante credenciales
                  </p>
                </div>
              </div>

              <span class="text-xs text-emerald-400">Activa</span>
            </div>

            <div class="security-item">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <i data-lucide="fingerprint" class="w-4 h-4 text-blue-400"></i>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-200">
                    Sesión de usuario
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Validación mediante token
                  </p>
                </div>
              </div>

              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/10 text-amber-400 text-xs font-medium">
                <i data-lucide="clock" class="w-3 h-3"></i>
                   Próximamente
              </span>
            </div>

          </div>
        </div>

      </div>

      <!-- Panel lateral -->
      <div class="space-y-6 animate-slide-up-delay">

        <!-- Resumen -->
        <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6">

          <h3 class="font-semibold text-gray-200 flex items-center gap-2 mb-6">
            <i data-lucide="chart-no-axes-column" class="w-5 h-5 text-violet-400"></i>
            Resumen de cuenta
          </h3>

          <div class="space-y-5">

            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-400">Estado</span>
                <span class="text-xs text-emerald-400">Activo</span>
              </div>
              <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-400">Verificación de correo</span>
                <span class="text-xs text-gray-500">Consultar</span>
              </div>
              <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full w-3/4 bg-gradient-to-r from-violet-600 to-purple-400 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>

        <!-- Información -->
        <div class="relative overflow-hidden bg-[#15151f] border border-white/[0.06] rounded-2xl p-6">

          <div class="absolute -right-10 -top-10 w-36 h-36 bg-violet-600/10 rounded-full blur-3xl"></div>

          <div class="relative">
            <div class="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
              <i data-lucide="info" class="w-5 h-5 text-violet-400"></i>
            </div>

            <h3 class="font-semibold text-gray-200 mb-2">
              Información importante
            </h3>

            <p class="text-sm text-gray-400 leading-relaxed">
              Los datos de esta sección son de consulta. Para modificar tu información personal o contraseña, utiliza las opciones correspondientes de Mi Cuenta.
            </p>
          </div>
        </div>

        <!-- Aviso -->
        <div class="flex gap-3 p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/10">
          <i data-lucide="shield-check" class="w-5 h-5 text-blue-400 shrink-0 mt-0.5"></i>

          <p class="text-xs text-gray-400 leading-relaxed">
            No compartas tus credenciales ni permitas que otras personas utilicen tu cuenta.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.account-item {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  background: #101019;
  border: 1px solid rgba(255,255,255,0.055);
  border-radius: 13px;
  transition: all 0.3s ease;
}

.account-item:hover {
  background: #171724;
  border-color: rgba(139,92,246,0.3);
  transform: translateY(-2px);
}

.account-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: #a78bfa;
  background: rgba(139,92,246,0.10);
}

.account-icon :deep(svg) {
  width: 19px;
  height: 19px;
}

.account-label {
  color: #85859a;
  font-size: 11px;
  margin-bottom: 5px;
}

.account-value {
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #101019;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s ease;
}

.security-item:hover {
  border-color: rgba(139,92,246,0.25);
  background: #171724;
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

@media (max-width: 640px) {
  .security-item {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-up,
  .animate-slide-up-delay {
    animation: none;
  }

  .account-item {
    transition: none;
  }
}
</style>
