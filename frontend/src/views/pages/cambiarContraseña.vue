<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useNotificationStore } from '../../stores/toastNotify'
import { useAuthStore } from '../../stores/auth'
import { puedeEditar } from '../../helper/permisos'
import { setupLucide } from '../../assets/js/lucide'

const router = useRouter()
const auth = useAuthStore()
const notif = useNotificationStore()
const showPass = ref(false);

const form = reactive({ actual: '', nueva: '', confirmar: '' })
const ver = reactive({ actual: false, nueva: false, confirmar: false })
const guardando = ref(false)

onMounted(() => setupLucide())

const requisitos = computed(() => [
    { texto: 'Al menos 8 caracteres', ok: form.nueva.length >= 8 },
    { texto: 'Una letra mayuscula', ok: /[A-Z]/.test(form.nueva) },
    { texto: 'Una letra minúscula', ok: /[a-z]/.test(form.nueva) },
    { texto: 'Un número', ok: /\d/.test(form.nueva) },
    { texto: 'Distinta a la contraseña actual', ok: !!form.nueva && form.nueva !== form.actual },
])

const coinciden = computed(() => !!form.confirmar && form.nueva === form.confirmar)

const fuerza = computed(() => requisitos.value.filter(r => r.ok).length)

const fuerzaInfo = computed(() => {
    if (!form.nueva) return { texto: '', clase: 'bg-gray-600', ancho: '0%' }
    if (fuerza.value <= 2) return { texto: 'Débil', clase: 'bg-red-500', ancho: '33%' }
    if (fuerza.value <= 4) return { texto: 'Media', clase: 'bg-amber-400', ancho: '66%' }
    return { texto: 'Fuerte', clase: 'bg-emerald-500', ancho: '100%' }
})

const formularioValido = computed(() => !!form.actual && requisitos.value.every(r => r.ok) && coinciden.value)

function togglePassword() {
    showPass.value = !showPass.value;
}

async function actualizarPassword() {
    if (!formularioValido.value) {
        notif.notify('Revisa los requisitos de la contraseña', 'warning')
        return
    }

    try {
        guardando.value = true
        await api.put('/users/me/password', { actual: form.actual, nueva: form.nueva })

        notif.notify('Contraseña actualizada. Inicia sesión nuevamente.', 'success')
        auth.logout()
        router.push('/')
    } catch (error) {
        notif.notify(error.response?.data?.message || 'Error en el servidor', 'error')
    } finally {
        guardando.value = false
        form.actual = form.nueva = form.confirmar = ''
    }
}
</script>
<template>
    <div class="p-6 text-white flex flex-col gap-6">
        <!--Encabezado-->
        <div class="mb-8 animate-fade-in">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-11 h-11 rounded-xl bg-violet-500/10 border-violet-500/20 flex items-center justify-center">
                    <i data-lucide="shield-check" class="w-6 h-6 text-violet-400"></i>
                </div>

                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Cambiar contraseña
                    </h1>
                    <p class="text-sm text-gray-400 mt-1">
                        Actualiza tu contraseña para mantener segura tu cuenta
                    </p>
                </div>
            </div>
            <div class="h-px bg-gradient-to-r from-violet-500/40 via-gray-700/40 to-transparent mt-6"></div>
        </div>
        <!--Contenido-->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!--Formulario-->
            <div class="xl:col-span-2">
                <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-xl animate-slide-up">
                    <div class="flex items-center gap-3 mb-7">
                        <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <i data-lucide="lock-keyhole" class="w-5 h-5 text-violet-400"></i>
                        </div>
                        <div>
                            <h2 class="font-semibold text-lg">Seguridad de acceso</h2>
                            <p class="text-xs text-gray-500">
                                Complete los siguientes campos
                            </p>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <!-- Contraseña actual -->
                        <div class="relative group">
                            <i data-lucide="key-round" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors"></i>
                            <input v-model="form.actual" :type="ver.actual ? 'text' : 'password'" :disabled="puedeEditar('cambiar_contraseña')" placeholder="Ingresa tu contraseña actual" autocomplete="current-password" class="password-input">
                            <button type="button" class="field-eye" tabindex="-1" :aria-label="ver.actual ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver.actual = !ver.actual">
                                <span v-show="!ver.actual"><i data-lucide="eye"></i></span>
                                <span v-show="ver.actual"><i data-lucide="eye-off"></i></span>
                            </button>
                        </div>
                        <!-- Nueva contraseña -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-300">
                                Nueva contraseña
                            </label>
                            <div class="relative group">
                                <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors"></i>
                                <input v-model="form.nueva" :type="ver.nueva ? 'text' : 'password'" :disabled="puedeEditar('cambiar_contraseña')" placeholder="Ingresa tu nueva contraseña" autocomplete="new-password" class="password-input ">
                            <button type="button" class="field-eye"  tabindex="-1" :aria-label="ver.nueva ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver.nueva = !ver.nueva" >
                                <span v-show="!ver.nueva"><i data-lucide="eye"></i></span>
                                <span v-show="ver.nueva"><i data-lucide="eye-off"></i></span>
                            </button>
                        </div>
                            <div v-if="form.nueva" class="mt-2">
                                <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div class="h-full rounded-full transition-all duration-300" :class="fuerzaInfo.clase" :style="{ width: fuerzaInfo.ancho }"></div>
                                </div>
                                <p class="text-xs text-gray-400 mt-1">Seguridad: {{ fuerzaInfo.texto }}</p>
                            </div>

                            <ul class="mt-3 space-y-1">
                                <li v-for="r in requisitos" :key="r.texto" class="text-xs flex items-center gap-2" :class="r.ok ? 'text-emerald-400' : 'text-gray-500'">
                                    <span>{{ r.ok ? '✓' : '○' }}</span> {{ r.texto }}
                                </li>
                            </ul>
                        </div>
                        <!-- Confirmar contraseña -->
                        <div class="space-y-2">
                            <div class="space-y-2">
                                <label class="text-sm font-medium text-gray-300">Confirmar nueva contraseña</label>
                                <div class="relative group">
                                    <i data-lucide="shield-check" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors"></i>
                                    <input v-model="form.confirmar" :type="ver.confirmar ? 'text' : 'password'" :disabled="puedeEditar('cambiar_contraseña')" placeholder="Confirma tu contraseña" autocomplete="new-password" class="password-input">
                                    <button type="button" class="field-eye" tabindex="-1" :aria-label="ver.confirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver.confirmar = !ver.confirmar">
                                        <span v-show="!ver.confirmar"><i data-lucide="eye"></i></span>
                                        <span v-show="ver.confirmar"><i data-lucide="eye-off"></i></span>
                                    </button>
                                </div>
                                <p v-if="form.confirmar" class="text-xs" :class="coinciden ? 'text-emerald-400' : 'text-red-400'"> {{ coinciden ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden' }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <!-- Acciones -->
                    <div class="flex flex-col sm:flex-row justify-end gap-3 mt-9 pt-6 border-t border-white/[0.06]">
                        <button type="button" @click="actualizarPassword" :disabled="!formularioValido || guardando" class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-900/20 hover:shadow-violet-700/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                           {{ guardando ? 'Actualizando...' : 'Actualizar contraseña' }}
                        </button>
                    </div>
                </div>
            </div>
            <!-- Panel Lateral -->
            <div class="space-y-6 animate-slide-up-delay">
                <!-- Seguridad -->
                <div class="relative overflow-hidden bg-[#15151f] border border-white/[0.06] rounded-2xl p-6">
                    <div class="absolute -right-10 -top-10 w-36 h-36 bg-violet-600/10 rounded-full blur-3xl"></div>
                    <div class="relative">
                        <div
                            class="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                            <i data-lucide="shield-check" class="w-6 h-6 text-violet-400"></i>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">
                            Protege tu cuenta
                        </h3>
                        <p class="text-sm text-gray-400 leading-relaxed">
                            Una contraseña segura ayuda a proteger tu informacion personal y evita accesos no
                            autorizados.
                        </p>
                    </div>
                </div>
                <!-- Recomendaciones -->
                <div class="bg-[#15151f] border border-white/[0.06] rounded-2xl p-6">
                    <h3 class="font-semibold text-gray-200 mb-5 flex items-center gap-2">
                        <i data-lucide="list-checks" class="w-5 h-5 text-violet-400"></i>
                        Recomendaciones
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-200">Mínimo 8 caracteres</p>
                                <p class="text-xs text-gray-500 mt-1">Utiliza una longitud adecuada.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-200">Letras mayúsculas y minúsculas</p>
                                <p class="text-xs text-gray-500 mt-1">Combina diferentes caracteres.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-200">No reutilices contraseñas</p>
                                <p class="text-xs text-gray-500 mt-1">Utiliza una contraseña exclusiva.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Aviso -->
                <div class="flex gap-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/10">
                    <i data-lucide="info" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5"></i>
                    <p class="text-xs text-gray-400 leading-relaxed">
                        Por seguridad, al actualizar tu contraseña se cerrarán las demás sesiones activas de tu cuenta.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.password-input {
    width: 100%;
    height: 50px;
    padding: 0 16px 0 48px;
    background: #101019;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
}

.password-input::placeholder {
    color: #646477;
}

.password-input:hover {
    border-color: rgba(139, 92, 246, 0.3);
}

.password-input:focus {
    border-color: rgba(139, 92, 246, 0.7);
    background: #141421;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.10);
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
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
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

.password-input {
    padding-right: 52px;
}

.field-eye {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    padding: 0;
    color: #77778c;
    cursor: pointer;
    transition: color 0.3s ease;
}

.field-eye:hover {
    color: #a78bfa;
}

.field-eye span {
    display: flex;
    align-items: center;
    justify-content: center;
}

.field-eye svg {
    width: 18px;
    height: 18px;
}
</style>