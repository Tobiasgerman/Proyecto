document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("jugar").addEventListener("click", function() {
        const wordleSelect = document.getElementById("Wordle");
        const selectedOption = wordleSelect.options[wordleSelect.selectedIndex].value;
  
        if (selectedOption === "Normal") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20Wordle/";
        }
        else if (selectedOption === "Fechas") {
            window.location.href = "http://127.0.0.1:5500/Front/Pantalla%20Fechas/";
  
        }
    });
  });
  
  
