// Modo claro/oscuro
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
function setTheme(dark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (dark) {
        body.classList.add('dark-mode');
        document.querySelectorAll('.navbar, .bg-light, .card, .btn-success').forEach(el => el.classList.add('dark-mode'));
        // Icono sol para modo claro
        themeIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' class='bi bi-sun' viewBox='0 0 16 16'><path d='M8 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7zm0-3a.5.5 0 0 1 .5.5V3a.5.5 0 0 1-1 0V2A.5.5 0 0 1 8 1.5zm0 13a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 1 0v1a.5.5 0 0 1-.5.5zm6.5-6.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5zm-13 0a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 1 0v1a.5.5 0 0 1-.5.5zm10.364-5.364a.5.5 0 0 1 .707 0l.707.707a.5.5 0 0 1-.707.707l-.707-.707a.5.5 0 0 1 0-.707zm-8.485 8.485a.5.5 0 0 1 0 .707l-.707.707a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707 0zm8.485 0a.5.5 0 0 1 .707.707l-.707.707a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707 0zm-8.485-8.485a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707.707l-.707.707a.5.5 0 0 1-.707 0z'/></svg><span id='themeText' class='ms-1'>Claro</span>`;
    } else {
        body.classList.remove('dark-mode');
        document.querySelectorAll('.navbar, .bg-light, .card, .btn-success').forEach(el => el.classList.remove('dark-mode'));
        // Icono luna para modo oscuro
        themeIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' class='bi bi-moon' viewBox='0 0 16 16'><path d='M6 0a6 6 0 0 0 0 12c3.314 0 6-2.686 6-6a6 6 0 0 0-6-6zm0 1a5 5 0 0 1 0 10A5 5 0 0 1 6 1z'/></svg><span id='themeText' class='ms-1'>Oscuro</span>`;
    }
}
// Guardar preferencia en localStorage
themeToggle.addEventListener('click', () => {
    const isDark = !body.classList.contains('dark-mode');
    setTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
// Inicializar según preferencia
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'dark');
});