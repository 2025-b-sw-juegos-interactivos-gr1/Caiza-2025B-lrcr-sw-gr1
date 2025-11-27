(function () {
    window.addEventListener("DOMContentLoaded", function () {
        //Aumentar el contador de bolsas recolectadas
        window.incrementarBolsasRecolectadas = function () {
            if (typeof window.bolsasRecolectadas === 'undefined') {
                window.bolsasRecolectadas = 0;
            }
            window.bolsasRecolectadas++;
            console.log("✅ Bolsas recolectadas:", window.bolsasRecolectadas);

            const hudCounter = document.getElementById("hudCounter");
            if (hudCounter) {
                hudCounter.textContent = `${window.bolsasRecolectadas} / 6`;
                console.log("📊 HUD actualizado:", hudCounter.textContent);
            } else {
                console.error("❌ No se encontró el elemento hudCounter");
            }

            //notificación de juego terminado
            if (window.bolsasRecolectadas >= 6) {
                alert("¡Has recolectado toda la basura! Ciudad limpia. Juego terminado.");
                //reiniciar el juego
                window.location.reload();
            }
        };


    });
})();