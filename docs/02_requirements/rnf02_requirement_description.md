# RNF-02. Control de acceso básico y privacidad en UI

## Descripción
El sistema deberá implementar un mecanismo de acceso básico en la interfaz que permita identificar al usuario mediante correo o nombre de usuario y contraseña.

Cada usuario tendrá un rol predefinido (secretaria o coordinador), el cual determinará las vistas, módulos y acciones que podrá visualizar y ejecutar dentro del sistema.

El sistema deberá restringir el acceso a las pantallas principales si el usuario no ha iniciado sesión y permitir el cierre de sesión regresando a la pantalla de acceso.

Asimismo, la interfaz deberá evitar mostrar información sensible innecesaria de los pacientes en búsquedas, listados, mensajes y rutas visibles, limitando los datos únicamente a los necesarios para la operación.

El alcance de este requisito se limita al control de acceso en frontend, sin contemplar autenticación robusta en backend.

---

## Categoría
Seguridad (control de acceso) y privacidad de datos

---

## Objetivo del requisito
Implementar control de acceso básico basado en roles y reducir la exposición de información sensible en la interfaz del sistema.

---

## Escenario de calidad

**Contexto:**  
Usuario accede al sistema web de la clínica  

**Estímulo:**  
El usuario intenta iniciar sesión o acceder a una vista del sistema  

**Respuesta esperada:**  
- Si las credenciales son correctas, el sistema permite el acceso  
- El sistema muestra únicamente las vistas y acciones correspondientes al rol del usuario  
- Si no hay sesión activa, el acceso a las pantallas principales es bloqueado  
- La interfaz muestra únicamente información necesaria, evitando datos sensibles innecesarios  

---

## Criterios de aceptación

- El sistema solicita usuario o correo y contraseña para ingresar  
- Cada cuenta tiene un rol predefinido: secretaria o coordinador  
- Al iniciar sesión, el sistema muestra solo los módulos, vistas y acciones permitidas para ese rol  
- Sin iniciar sesión no se puede acceder a las pantallas principales del sistema  
- Existe opción de cerrar sesión  
- Al cerrar sesión, el sistema regresa a la pantalla de acceso  
- La interfaz evita mostrar información sensible innecesaria en búsquedas, listados y mensajes  
- No se exponen datos sensibles en rutas visibles (URL)  
- El control de acceso se limita a frontend (no incluye seguridad backend)  

---

## Verificación

El cumplimiento del requisito se verificará mediante:

- Pruebas de inicio de sesión con credenciales válidas e inválidas  
- Intentos de acceso a rutas protegidas sin autenticación  
- Validación de visibilidad de módulos según el rol del usuario  
- Revisión de datos mostrados en listados y búsquedas  
- Pruebas de cierre de sesión y redirección al login  

---

## Consistencia

Este requisito es consistente con los requisitos funcionales de gestión de citas (creación, consulta, modificación y cancelación), así como con los requisitos no funcionales de integridad de datos y minimización de exposición de información.

No presenta contradicciones con otros requisitos del sistema.

---

## Métricas de cumplimiento

- El 100% de las rutas protegidas requieren sesión activa  
- El 100% de los usuarios visualizan únicamente módulos permitidos por su rol  
- No se muestra información sensible innecesaria en listados y búsquedas  
- El sistema redirige correctamente al login al cerrar sesión  