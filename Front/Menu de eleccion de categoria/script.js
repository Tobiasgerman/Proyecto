document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("jugar").addEventListener("click", function() {
        const wordleSelect = document.getElementById("Wordle");
        const deportistasSelect = document.getElementById("Gamedle");
        const selectedWordleOption = wordleSelect.options[wordleSelect.selectedIndex].value;
        const selectedDeportistasOption = deportistasSelect.options[deportistasSelect.selectedIndex].value;

        if (selectedWordleOption === "Normal") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20Wordle/";
        } else if (selectedWordleOption === "Fechas") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20Fechas/";
        } else if (selectedDeportistasOption === "Gamedle") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20Gamedle/";
        }
    });
});
