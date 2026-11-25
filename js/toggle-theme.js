function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode', !isDark);
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) { }
}

// The theme itself is applied by an inline script at the top of <body> (before first paint).
// Here we only sync the switch and fill in the year.
document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.getElementById('checkbox');
    if (checkbox) {
        checkbox.checked = document.body.classList.contains('dark-mode');
    }

    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
