# Guía de Configuración Local - Sistema de Agenda de Citas

## Requisitos Previos

Elige **una de estas dos opciones** según tu preferencia:

### Opción A: Sin Docker (Rápido, recomendado para desarrollo)
- **Java 17+** (descargar de https://adoptium.net)
- **Maven 3.8+** (descargar de https://maven.apache.org)
- **Git** (descargar de https://git-scm.com)
- **Base de datos**: H2 (incluida en el proyecto)

### Opción B: Con Docker (Completo, similar a producción)
- **Docker** (descargar de https://www.docker.com)
- **Docker Compose** (incluido en Docker Desktop)
- **Git**
- **Base de datos**: PostgreSQL en contenedor

---

## OPCIÓN A: Ejecución Sin Docker (Usando H2)

### Paso 1: Verificar Java y Maven

Abre terminal/cmd y ejecuta:

```bash
java -version
```

Debe mostrar Java 17 o superior. Ejemplo:
```
openjdk version "17.0.x"
```

Verifica Maven:

```bash
mvn -version
```

Debe mostrar Maven 3.8 o superior.

### Paso 2: Clonar o acceder al proyecto

Si aún no tienes el proyecto:

```bash
cd /ruta/donde/quieras/el/proyecto
git clone https://github.com/tu-usuario/agenda-citas-cambranes.git
cd agenda-citas-cambranes
```

O si ya tienes la carpeta:

```bash
cd backend
```

### Paso 3: Descargar dependencias y compilar

```bash
mvn clean compile
```

**Primera ejecución**: Descargará todas las dependencias (~200MB). Espera 3-5 minutos.

Si ves "BUILD SUCCESS" al final: ✅ Listo para ejecutar.

Si ves "BUILD FAILURE": Revisa el error en consola. Asegúrate de tener Java 17+ y Maven 3.8+.

### Paso 4: Ejecutar la aplicación

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

Alternativamente, con Maven wrapper (si existe):

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

**Esperado en consola** (después de ~20 segundos):

```
...
INFO 12345 --- [main] org.springframework.boot.web.embedded.tomcat.TomcatWebServer
  : Tomcat started on port(s): 8080 (http)
INFO 12345 --- [main] com.clinica.agenda.AgendaApplication
  : Started AgendaApplication in 18.234 seconds
```

### Paso 5: Acceder a la aplicación

Abre navegador e ingresa:

```
http://localhost:8080
```

**Esperado**: Se redirige automáticamente a `/login`.

### Paso 6: Iniciar sesión

Usa cualquiera de estos usuarios de demo:

| Email | Contraseña | Rol |
|---|---|---|
| `secretaria@clinica.local` | `password123` | Secretaria |
| `coordinador@clinica.local` | `password123` | Coordinador |

Ingresa y presiona "Entrar". Si funciona correctamente, verás el dashboard con las citas de ejemplo.

### Paso 7: Verificar que funciona

En el dashboard deberías ver:

- ✅ "Resumen de la agenda"
- ✅ Tarjeta con "Citas en los próximos 7 días"
- ✅ Tabla con citas de ejemplo
- ✅ Botones "Nueva cita" y "Nuevo paciente"

### Detener la aplicación

En la terminal, presiona `Ctrl+C` para detener el servidor.

---

## OPCIÓN B: Ejecución Con Docker (PostgreSQL)

### Paso 1: Verificar Docker y Docker Compose

Abre terminal/cmd:

```bash
docker --version
```

Debe mostrar versión 20.10 o superior.

```bash
docker compose version
```

Debe mostrar versión 2.0 o superior.

Si alguno no está instalado, descarga Docker Desktop desde https://www.docker.com/products/docker-desktop

### Paso 2: Acceder a la carpeta del proyecto

```bash
cd /ruta/del/proyecto/agenda-citas-cambranes
```

Verifica que exista el archivo `docker-compose.yml`:

```bash
ls docker-compose.yml
```

(En Windows: `dir docker-compose.yml`)

### Paso 3: Iniciar los servicios

```bash
docker compose up
```

**Primera ejecución**: Descargará imágenes de Docker y compilará la aplicación (~500MB, 5-10 minutos).

**Esperado en consola** (después de ~1 minuto):

```
app-1  | ... INFO ... Tomcat started on port(s): 8080 (http)
app-1  | ... INFO ... Started AgendaApplication in XX.XXX seconds
```

### Paso 4: Acceder a la aplicación

Abre navegador e ingresa:

```
http://localhost:8080
```

**Esperado**: Redirige a `/login`.

### Paso 5: Iniciar sesión (igual que OPCIÓN A)

Usa credenciales demo:
- Email: `secretaria@clinica.local`
- Contraseña: `password123`

### Paso 6: Verificar funcionalidad

- Dashboard con KPIs y citas
- Botón "Nueva cita" funciona
- Botón "Nuevo paciente" funciona

### Detener los servicios

En la terminal donde corre `docker compose up`, presiona `Ctrl+C`.

**Opcional**: Eliminar datos (reset de base de datos):

```bash
docker compose down -v
```

Luego `docker compose up` nuevamente creará BDD limpia.

---

## Pruebas Rápidas de Funcionalidad

Una vez que la app esté en ejecución, prueba estos flujos:

### Test 1: Ver Citas (RF-07 - Citas Atrasadas)

1. Ingresa a `/appointments`
2. Observa la tabla con citas de ejemplo
3. Citas pasadas deberían tener badge rojo "Atrasada"

**Esperado**: ✅ Citas con fechas pasadas se destacan en rojo

### Test 2: Crear Nueva Cita (RF-02 - Resumen)

1. Click en "Nueva cita" desde dashboard
2. Selecciona "Evaluacion inicial"
3. Rellena paciente, terapeuta, sala, fecha/hora, duración
4. Click "Siguiente"
5. **Pantalla de resumen**: Verifica que se muestren todos los datos
6. Click "Confirmar cita"

**Esperado**: ✅ Redirige a detalle de cita, se ve en listado

### Test 3: Reprogramar Cita (RF-08)

1. Ingresa a `/appointments/{id}` de una cita existente
2. Scroll hacia abajo, sección "Reprogramar"
3. Cambia fecha/hora, terapeuta u otra sala
4. Click "Guardar cambios"

**Esperado**: ✅ Cita original marcada RESCHEDULED, nueva cita creada con nuevos datos

### Test 4: Cancelar Cita (RF-09)

1. Ingresa a detalle de cita
2. Scroll hacia abajo, sección "Cancelar"
3. Escribe una razón (obligatorio)
4. Click "Cancelar"

**Esperado**: ✅ Cita pasa a status CANCELLED, aparece razón

### Test 5: Health Check (Observabilidad)

Abre navegador:

```
http://localhost:8080/actuator/health
```

**Esperado**: Respuesta JSON con `"status":"UP"` y componentes (db, livenessState, etc.)

---

## Troubleshooting

### Error: "Java not found" o "Maven not found"

**Solución**: 
- Instala Java 17 desde https://adoptium.net
- Instala Maven desde https://maven.apache.org
- Reinicia terminal/cmd después de instalar
- Verifica: `java -version` y `mvn -version`

### Error: "Port 8080 already in use"

**Solución** (Mac/Linux):
```bash
lsof -i :8080
kill -9 <PID>
```

**Solución** (Windows):
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Error: "Cannot connect to database" (Con Docker)

**Solución**:
```bash
docker ps
```

Verifica que PostgreSQL esté corriendo. Si no:

```bash
docker compose down
docker compose up
```

### Error: "H2 schema error" (Sin Docker)

**Solución**: Asegúrate de ejecutar con:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

No olvides el parámetro `--spring.profiles.active=local`

### La app arranca pero `/login` muestra error 500

**Solución**:
- Revisa logs en consola para ver el error exacto
- Común: Classpath no incluye templates. Ejecuta `mvn clean compile` nuevamente
- Si persiste: Sube el error a GitHub Issues

---

## Estructura de Carpetas Relevantes

```
agenda-citas-cambranes/
├── backend/                      ← App Spring Boot
│   ├── pom.xml                  ← Dependencias Maven
│   ├── Dockerfile               ← Para Docker
│   ├── src/main/java/...        ← Código Java
│   ├── src/main/resources/
│   │   ├── templates/           ← HTML Thymeleaf
│   │   ├── static/styles.css    ← Estilos
│   │   └── db/migration/        ← SQL (Flyway)
│   └── target/                  ← Compilado (generado por Maven)
├── docker-compose.yml           ← Configuración Docker (Opción B)
├── DEVELOPMENT.md               ← Documentación técnica (este archivo)
└── SETUP_LOCAL.md              ← Esta guía
```

---

## Variables de Entorno (Avanzado)

Si necesitas personalizar la configuración:

### Sin Docker
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/agenda
export SPRING_DATASOURCE_USERNAME=agenda
export SPRING_DATASOURCE_PASSWORD=mi_contraseña
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

### Con Docker (en docker-compose.yml)
```yaml
services:
  app:
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/agenda
      SPRING_DATASOURCE_USERNAME: agenda
      SPRING_DATASOURCE_PASSWORD: mi_contraseña
```

---

## Recursos Adicionales

- **Documentación técnica**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Código fuente**: `backend/src/`
- **Tests**: `backend/src/test/` (cuando agregues)
- **Base de datos**: `backend/src/main/resources/db/migration/`

---

## Contacto y Soporte

Si encuentras problemas:

1. Verifica los [Requisitos Previos](#requisitos-previos)
2. Revisa el [Troubleshooting](#troubleshooting)
3. Abre un issue en GitHub con:
   - Tu SO (Windows/Mac/Linux)
   - Versión de Java/Maven/Docker
   - Captura de pantalla del error
   - Primeras 50 líneas del log de error

---

## Próximos Pasos Después de Ejecutar

1. **Explorar la interfaz**: Crea una cita, prueba reprogramación
2. **Revisar el código**: `backend/src/main/java/`
3. **Entender la BD**: `backend/src/main/resources/db/migration/V1__schema.sql`
4. **Leer documentación**: [DEVELOPMENT.md](./DEVELOPMENT.md)
5. **Customizar**: Modifica `application.yml` para cambiar horarios o límites

¡Éxito! 🎉
