document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("jugar").addEventListener("click", function() {
        // Obtener el valor seleccionado del menú "Wordle"
        const wordleSelect = document.getElementById("Wordle");
        const Opcionwordle = wordleSelect.options[wordleSelect.selectedIndex].value;

        // Verificar la opción seleccionada en "Wordle"
        if (Opcionwordle === "Normal") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20de%20inicio-Wordle/";
        }
        else if (Opcionwordle === "Fechas") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20Fechas/";
        }

        // Obtener el valor seleccionado del menú "Deportistas"
        const GamedleSelect = document.getElementById("Deportistas");
        const OpcionGamedle = GamedleSelect.options[GamedleSelect.selectedIndex].value;

        // Verificar la opción seleccionada en "Deportistas" y redirigir
        if (OpcionGamedle === "Basket") {
            window.location.href = "http://127.0.0.1:5500/Back/Gamedle%202/Gamedle/public/basquet/";
        }
        else if (OpcionGamedle === "Formula 1") {
            window.location.href = "http://127.0.0.1:5500/Back/Gamedle%202/Gamedle/public/formula1";
        }
    });
});
