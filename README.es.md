# gti-commit-generator: Una herramienta para generar mensajes de commit basados en cambios preparados utilizando IA

💻 ¿Te resulta tedioso escribir mensajes de commit? ¡gti-commit-generator está aquí para ayudarte!

Este paquete aprovecha el modelo gemini-1.5-flash de Google para analizar los cambios en tu código y crear mensajes de commit claros y significativos. Ya sea que trabajes solo o en equipo, gti-commit-generator te ayuda a mantener un historial de commits profesional y pulido.

## Cómo Funciona

1. Instala gti-commit-generator usando `npm install -g gcg`
2. Genera una clave de API de Google [aquí](https://makersuite.google.com/app/apikey)
3. Configura tu variable de entorno `GOOGLE_GENERATIVE_AI_API_KEY` con tu clave de API
4. Realiza tus cambios de código y añádelos al stage con `git add .`
5. Escribe `gcg` en tu terminal
6. gti-commit-generator analizará tus cambios y generará un mensaje de commit
7. Aprueba el mensaje de commit y gti-commit-generator creará el commit por ti ✅

## Opciones

- `--list`: Selecciona uno de 5 mensajes generados (o regenera la lista)
- `--force`: Crea automáticamente un commit sin pedirte seleccionar un mensaje (no se puede usar con `--list`)
- `--apiKey`: Tu clave de API de OpenAI. No se recomienda pasar `apiKey` aquí; es mejor usar una variable de entorno
- `--template`: Especifica una plantilla personalizada para el mensaje de commit. Ej. `--template "Modificado {GIT_BRANCH} | {COMMIT_MESSAGE}"`
- `--language`: Especifica el idioma a usar para el mensaje de commit (por defecto: `english`). Ej. `--language spanish`
- `--commit-type`: Especifica el tipo de commit a generar. Se usará como el tipo en el mensaje de commit. Ej. `--commit-type feat`

## Contribuir

¡Eres bienvenido a contribuir a gti-commit-generator! Para contribuir, sigue estos pasos:

1. Haz un fork del repositorio y clónalo localmente.
2. Crea una nueva rama para tu funcionalidad o corrección de errores: `git checkout -b feature/nombre-de-tu-funcionalidad`.
3. Realiza tus cambios y asegúrate de que funcionen como se espera.
4. Haz commit de tus cambios: `git commit -am 'Agregar alguna funcionalidad'`.
5. Haz push a la rama: `git push origin feature/nombre-de-tu-funcionalidad`.
6. Envía un pull request detallando los cambios y por qué son beneficiosos.
7. Espera comentarios o aprobación. ¡Gracias por contribuir!

## Orígenes del Proyecto

gti-commit-generator es un fork de [ai-commit](https://github.com/insulineru/ai-commit), desarrollado originalmente por [insulineru](https://github.com/insulineru). Hemos construido sobre su trabajo para crear una herramienta que aprovecha el modelo gemini-1.5-flash de Google para generar mensajes de commit basados en cambios preparados en tu repositorio Git.

## Licencia

gti-commit-generator está bajo la Licencia MIT.
