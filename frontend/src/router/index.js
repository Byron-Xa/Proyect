import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import index from '../views/pages/index.vue'
import Dashboard from '../views/Dashboard.vue'
import Rol from '../views/pages/rol.vue'
import Permisos from '@/views/pages/permisos.vue'
import usuarios from '@/views/pages/usuarios.vue'
import { useAuthStore } from '../stores/auth'
import menu from '@/views/pages/menu.vue'
import categoria from '@/views/pages/categoria.vue'
import producto from '@/views/pages/producto.vue'
import movimiento from '@/views/pages/movimiento.vue'
import proveedores from '@/views/pages/proveedor.vue'
import compras from '@/views/pages/compras.vue'
import ventas from '@/views/pages/ventas.vue'
import estadisticasMovimientos from '@/views/pages/estadisticasMovimientos.vue'
import estadisticasProductos from '@/views/pages/estadisticasProductos.vue'
import estadisticasStock from '@/views/pages/estadisticasStock.vue'
import cambiarContraseña from '@/views/pages/cambiarContraseña.vue'
import datosPersonales from '@/views/pages/datosPersonales.vue'
import informacionPersonal from '@/views/pages/informacionDeLaCuenta.vue'
import usuariosMultiples from '@/views/pages/usuariosMultiples.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: {public: true},
    },
    {
      path: '/',
      component: Dashboard,
      meta: {requiresAuth: true},
      children: [
        {
          path: '/index',
          component: index,
        },
        {
          path: '/roles',
          component: Rol,
        },
        {
          path: '/permiso',
          component: Permisos,
        },
        {
          path: '/usuarios',
          component: usuarios,
        },
        {
          path: '/menu',
          component: menu,
        },
        {
          path: '/categorias',
          component: categoria,
        },
        {
          path: '/productos',
          component: producto,
        },
        {
          path: '/movimientos',
          component: movimiento,
        },
        {
          path: '/proveedores',
          component: proveedores,
        },
        {
          path: '/compras',
          component: compras,
        },
        {
          path: '/ventas',
          component: ventas,
        },
        {
          path: '/repmovimientos',
          component: estadisticasMovimientos,
        },
        {
          path: '/repproductos',
          component: estadisticasProductos,
        },
        {
          path: '/stocks',
          component: estadisticasStock,
        },
        {
          path: '/cambiar_contraseña',
          component: cambiarContraseña,
        },
        {
          path: '/dato_personal',
          component: datosPersonales,
        },
        {
          path: '/informacion_cuenta',
          component: informacionPersonal,
        },
        {
          path: '/users',
          component: usuariosMultiples,
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    }
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.public){
    if (auth.isAuthenticated){
      return next('/index');
    }
    return next();
  }
  if (!auth.isAuthenticated){
    return next('/');
  }
  
  if (Number(auth.user?.rol_id === 1)){
    return next();
  }

  const rutaActual = to.path.replace(/\/+$/, '') || '/';

  
  const tieneAcceso = auth.menus.some(menu => menu.subMenus.some(sub => {
    const rutaSubmenu = ('/' + sub.ruta).replace(/\/+/g, '/').replace(/\/+$/, '');
    return rutaSubmenu === rutaActual;
  })
);

  if (!tieneAcceso){
    return next('/index');
  }
  next();
});

export default router
