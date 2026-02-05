# Análisis del Problema de Autenticación y Visualización de Saldo

## Resumen
El problema principal es que la barra de navegación superior no muestra la información del usuario ni sus saldos porque el sistema de autenticación no está funcionando correctamente. En lugar de mostrar la información del usuario, se muestra un menú de invitado con opciones de login y registro.

## Análisis Detallado

### 1. Flujo de Autenticación
- El componente `TopBar.js` intenta obtener la información del usuario desde `/api/auth/me`
- Si la llamada falla o devuelve un error 401 (no autenticado), `user` se establece como `null`
- Cuando `user` es `null`, se renderiza `GuestMenu` en lugar de `UserProfile`
- También se ocultan los componentes `TokenBalances` y `PotentialEarnings`

### 2. Problemas Identificados

#### A. Middleware Incorrecto
En `middleware.js`, el matcher no incluye adecuadamente la ruta `/api/auth/me`, lo que podría impedir que esta API funcione correctamente para verificar la autenticación.

```javascript
export const config = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico).)*',
  ],
};
```

Este matcher excluye todas las rutas que comienzan con `api`, lo que significa que `/api/auth/me` no pasa por el middleware. Sin embargo, el problema puede estar en otro lugar.

#### B. Implementación del Endpoint `/api/auth/me`
El endpoint en `app/api/auth/me/route.js` intenta extraer el token de autorización y cookies, pero la implementación puede tener inconsistencias con la forma en que se almacena y envía el token.

#### C. Inconsistencia entre App Router y Pages Router
El proyecto mezcla ambos sistemas de ruteo de Next.js, lo que crea problemas de coherencia:

- El formulario de login está en `app/auth/login/page.js` (App Router)
- El endpoint de login está en `pages/api/auth/login.js` (Pages Router)
- El endpoint de verificación de usuario está en `app/api/auth/me/route.js` (App Router)

#### D. Almacenamiento Incorrecto del Token
El problema principal es una inconsistencia en el manejo del token de autenticación:

- El formulario de login en `app/auth/login/page.js` guarda el token en `localStorage` (línea 43):
  ```javascript
  localStorage.setItem('token', data.token);
  ```
  
- Pero el sistema de autenticación en `lib/auth.js` y el endpoint `/api/auth/me` esperan el token en las cookies:
  ```javascript
  export const getUserFromRequest = async (req) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    // ...
  };
  ```

Esta inconsistencia significa que aunque el usuario inicie sesión exitosamente, el token no estará disponible para las APIs que necesitan verificar la autenticación, ya que están buscando el token en las cookies mientras que el cliente lo ha almacenado en `localStorage`.

### 3. Componentes Afectados
- `components/TopBar.js` - Punto principal donde se verifica la autenticación
- `components/topbar/UserActions.js` - Decide qué componente mostrar según el estado de autenticación
- `components/topbar/GuestMenu.js` - Se muestra cuando el usuario no está autenticado
- `components/topbar/TokenBalances.js` - Muestra los saldos del usuario (no visible sin autenticación)
- `app/api/auth/me/route.js` - Endpoint que verifica la autenticación
- `lib/auth.js` - Funciones de autenticación
- `app/auth/login/page.js` - Formulario de inicio de sesión
- `pages/api/auth/login.js` - Endpoint de inicio de sesión (Pages Router)

## Recomendaciones

### 1. Solución Principal: Sincronizar el Manejo del Token
La solución más directa es hacer que el cliente envíe el token almacenado en localStorage como parte de las solicitudes a la API. Para ello, hay varias opciones:

#### Opción A: Modificar el cliente para usar cookies
Actualizar el código de login para almacenar el token en una cookie en lugar de localStorage:

```javascript
// En lugar de:
localStorage.setItem('token', data.token);

// Usar una función para establecer la cookie
document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`; // 24 horas
```

#### Opción B: Configurar Axios para incluir el token en cada solicitud
Configurar el cliente para incluir el token de localStorage en cada solicitud a las APIs:

```javascript
// En TopBar.js y otros componentes que hacen solicitudes
import axios from 'axios';

// Interceptor para incluir el token en cada solicitud
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

Y luego modificar el endpoint `/api/auth/me` para leer tanto de cookies como del header Authorization.

### 2. Arquitectura Consistente
Considerar migrar completamente a App Router para mantener consistencia en el manejo de autenticación y estado.

### 3. Verificar Almacenamiento del Token
Después del login, asegurarse de que el token JWT se esté almacenando correctamente y accesible para las solicitudes posteriores.

## Acción Inmediata Sugerida
Implementar la Opción B (configurar Axios con interceptor) para que el token almacenado en localStorage se envíe como header de autorización en las solicitudes a la API. Esta es la solución más rápida y menos invasiva para resolver el problema actual.