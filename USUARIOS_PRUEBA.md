// Usuarios de prueba en DummyJSON

/*
USUARIOS ADMINISTRADORES (role: "admin"):
- ID: 1
  username: "emilys"
  password: "emilyspass"
  name: "Emily Simmons"

- ID: 5
  username: "grady"
  password: "gradypass"
  name: "Grady Head"

USUARIOS PACIENTES (role: "user" o sin role):
- ID: 2
  username: "michaelw"
  password: "michaelwpass"
  name: "Michael Williams"

- ID: 3
  username: "atuny0"
  password: "9uQFF56WdV"
  name: "Aiden Tuny"

- ID: 4
  username: "abernathy12"
  password: "pass12345"
  name: "Terry Abernathy"

Nota: El login ahora obtiene el role desde:
1. POST /auth/login - obtiene accessToken e id
2. GET /users/{id} - obtiene el role del usuario

Si el usuario tiene role="admin", se redirige a admin-medicos.html
Si el usuario tiene role="user", se redirige a paciente-agendar.html
*/
