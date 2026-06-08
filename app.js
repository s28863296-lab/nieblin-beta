// =========================
// VARIABLES
// =========================

let climaActual = {};

// =========================
// NAVEGACION
// =========================

function mostrar(id){

    document
    .querySelectorAll(".pantalla")
    .forEach(p=>p.classList.add("oculto"));

    document
    .getElementById(id)
    .classList.remove("oculto");
}

// =========================
// UTILIDADES
// =========================

function aleatorio(lista){

    return lista[
        Math.floor(
            Math.random() * lista.length
        )
    ];
}

// =========================
// VOZ
// =========================

function hablar(texto){

    speechSynthesis.cancel();

    const voz =
    new SpeechSynthesisUtterance(texto);

    voz.lang = "es-AR";
    voz.rate = 1;

    speechSynthesis.speak(voz);
}

function escuchar(){

    const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

    if(!SpeechRecognition){

        alert(
            "Tu navegador no soporta reconocimiento de voz"
        );

        return;
    }

    const reconocimiento =
    new SpeechRecognition();

    reconocimiento.lang = "es-ES";
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    document
    .getElementById("textoEscuchado")
    .innerHTML =
    "🎤 Escuchando...";

    reconocimiento.start();

    reconocimiento.onresult =
    function(event){

        const texto =
        event.results[0][0]
        .transcript;

        document
        .getElementById("textoEscuchado")
        .innerHTML =
        "Vos: " + texto;

        responderIA(texto,true);
    };

    reconocimiento.onerror =
    function(event){

        document
        .getElementById("respuestaVoz")
        .innerHTML =
        "Error: " +
        event.error;
    };
}

// =========================
// CHAT IA
// =========================

function preguntarIA(){

    const input =
    document.getElementById(
        "pregunta"
    );

    const texto =
    input.value.trim();

    if(texto === ""){
        return;
    }

    responderIA(texto,false);

    input.value = "";
}

function responderIA(texto,desdeVoz){

    const chat =
    document.getElementById(
        "chatMensajes"
    );

    chat.innerHTML += `
    <div class="mensaje-usuario">
        ${texto}
    </div>
    `;

    let pregunta =
    texto.toLowerCase();

    let respuesta =
    "No entendí la pregunta. Mi diploma es de meteorología, no de adivinación 😅";

    // SALUDO

    if(
        pregunta.includes("hola") ||
        pregunta.includes("buenas")
    ){

        respuesta =
        aleatorio([
            "Hola Santiago 😎",
            "Hola. Estoy vigilando las nubes.",
            "Buen día. La niebla todavía no tomó el control.",
            "Hola. Mis sensores meteorológicos están activos."
        ]);
    }

    // NIEBLA

    else if(
        pregunta.includes("niebla")
    ){

        respuesta =
        aleatorio([
            `El riesgo actual es ${climaActual.riesgo}% 🌫️`,
            `Mis cálculos indican ${climaActual.riesgo}% de probabilidad de niebla.`,
            `La niebla está considerando aparecer. Riesgo: ${climaActual.riesgo}%`
        ]);
    }

    // TEMPERATURA

    else if(
        pregunta.includes("temperatura")
    ){

        respuesta =
        aleatorio([
            `La temperatura actual es ${climaActual.temp}°C.`,
            `Ahora mismo tenemos ${climaActual.temp} grados.`,
            `${climaActual.temp}°C. Bastante razonable para un planeta habitable 😄`
        ]);
    }

    // HUMEDAD

    else if(
        pregunta.includes("humedad")
    ){

        respuesta =
        aleatorio([
            `La humedad actual es ${climaActual.humedad}%.`,
            `${climaActual.humedad}% de humedad.`,
            `La atmósfera reporta ${climaActual.humedad}% de humedad.`
        ]);
    }

    // VIENTO

    else if(
        pregunta.includes("viento")
    ){

        respuesta =
        aleatorio([
            `El viento sopla a ${climaActual.viento} km/h.`,
            `${climaActual.viento} km/h.`,
            `El aire decidió moverse a ${climaActual.viento} km/h 😄`
        ]);
    }

    // CLIMA

    else if(
        pregunta.includes("clima")
    ){

        respuesta =
        `Actualmente tenemos ${climaActual.temp}°C, humedad ${climaActual.humedad}% y viento ${climaActual.viento} km/h.`;
    }

    chat.innerHTML += `
    <div class="mensaje-ia">
        ${respuesta}
    </div>
    `;

    chat.scrollTop =
    chat.scrollHeight;

    document
    .getElementById(
        "respuestaVoz"
    )
    .innerHTML =
    respuesta;

    hablar(respuesta);
}

// =========================
// CLIMA REAL
// =========================
async function cargarClima(){

    try{

        const lat = -26.83;
        const lon = -65.14;

        const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

        const respuesta =
        await fetch(url);

        const data =
        await respuesta.json();

        const temp =
        Math.round(
            data.current.temperature_2m
        );

        const humedad =
        Math.round(
            data.current.relative_humidity_2m
        );

        const viento =
        Math.round(
            data.current.wind_speed_10m
        );

        let riesgo = 0;

        if(humedad >= 70) riesgo += 20;
        if(humedad >= 80) riesgo += 20;
        if(humedad >= 90) riesgo += 20;

        if(viento < 15) riesgo += 10;
        if(viento < 8) riesgo += 15;

        if(temp < 18) riesgo += 10;
        if(temp < 12) riesgo += 15;

        if(riesgo > 100){
            riesgo = 100;
        }

        climaActual = {
            temp,
            humedad,
            viento,
            riesgo
        };

        document.getElementById("temp").innerHTML =
        temp + "°C";

        document.getElementById("humedad").innerHTML =
        humedad + "%";

        document.getElementById("viento").innerHTML =
        viento + " km/h";

        document.getElementById("riesgo").innerHTML =
        riesgo + "%";

        // ESTADO

        const estado =
        document.getElementById(
            "estadoNiebla"
        );

        if(estado){

            estado.classList.remove(
                "alto",
                "medio",
                "bajo"
            );

            if(riesgo >= 70){

                estado.innerHTML =
                "ALTO";

                estado.classList.add(
                    "alto"
                );

            }
            else if(riesgo >= 40){

                estado.innerHTML =
                "MEDIO";

                estado.classList.add(
                    "medio"
                );

            }
            else{

                estado.innerHTML =
                "BAJO";

                estado.classList.add(
                    "bajo"
                );

            }
        }

        // DESCRIPCION

        const descripcion =
        document.getElementById(
            "descripcionRiesgo"
        );

        if(descripcion){

            if(riesgo >= 70){

                descripcion.innerHTML =
                "Condiciones muy favorables para la formación de niebla.";

            }
            else if(riesgo >= 40){

                descripcion.innerHTML =
                "Existe una posibilidad moderada de formación de niebla.";

            }
            else{

                descripcion.innerHTML =
                "Las condiciones actuales no favorecen la formación de niebla.";

            }

        }

        document.getElementById("mensaje").innerHTML =
        `Analizando condiciones atmosféricas en Estación Aráoz. Temperatura ${temp}°C, humedad ${humedad}% y viento ${viento} km/h.`;

        document.getElementById("pronosticoHoy").innerHTML =
        `Máx ${Math.round(data.daily.temperature_2m_max[0])}°C<br>Mín ${Math.round(data.daily.temperature_2m_min[0])}°C`;

        document.getElementById("pronosticoManana").innerHTML =
        `Máx ${Math.round(data.daily.temperature_2m_max[1])}°C<br>Mín ${Math.round(data.daily.temperature_2m_min[1])}°C`;

        // HORA PROBABLE DE NIEBLA

        let mejorHora = "--:--";
        let mejorIndice = -1;

        for(let i = 0; i < data.hourly.time.length; i++){

            const hum =
            data.hourly.relative_humidity_2m[i];

            const vientoHora =
            data.hourly.wind_speed_10m[i];

            const tempHora =
            data.hourly.temperature_2m[i];

            let puntaje = 0;

            if(hum >= 80) puntaje += 40;
            if(hum >= 90) puntaje += 20;

            if(vientoHora < 10) puntaje += 20;
            if(vientoHora < 5) puntaje += 20;

            if(tempHora < 15) puntaje += 20;

            if(puntaje > mejorIndice){

                mejorIndice = puntaje;

                mejorHora =
                data.hourly.time[i]
                .split("T")[1];

            }
        }

        const horaElemento =
        document.getElementById(
            "horaNiebla"
        );

        if(horaElemento){

            horaElemento.innerHTML =
            mejorHora;

        }

        const info =
        document.getElementById(
            "infoGrafico"
        );

        if(info){

            info.innerHTML =
            `🕒 Mayor probabilidad estimada alrededor de las ${mejorHora}`;

        }

        crearGrafico(riesgo);

    }
    catch(error){

        console.error(error);

        document.getElementById("mensaje").innerHTML =
        "No se pudo obtener el clima.";

    }
}


// =========================
// GRAFICO
// =========================

function crearGrafico(riesgo){

    const canvas =
    document.getElementById(
        "graficoNiebla"
    );

    if(!canvas){
        return;
    }

    new Chart(canvas,{

        type:"line",

        data:{

            labels:[
                "00",
                "03",
                "06",
                "09",
                "12",
                "15",
                "18",
                "21"
            ],

            datasets:[{

                label:
                "Probabilidad",

                data:[
                    20,
                    40,
                    riesgo,
                    50,
                    25,
                    15,
                    10,
                    20
                ]

            }]
        }
    });
}

// =========================
// TEMA
// =========================

function cambiarTema(){

    document.body.classList.toggle(
        "oscuro"
    );
}

// =========================
// INICIO
// =========================
window.onload = function(){

    cargarUsuario();

    cargarClima();

};

if("serviceWorker" in navigator){

    navigator.serviceWorker.register(
        "./service-worker.js"
    );

}

// =========================
// MENU LATERAL
// =========================

function toggleMenu(){

    document
    .getElementById(
        "menuLateral"
    )
    .classList.toggle(
        "abierto"
    );

}

// =========================
// USUARIO
// =========================

function cargarUsuario(){

    let nombre =
    localStorage.getItem(
        "nombreUsuario"
    );

    if(!nombre){

        nombre =
        prompt(
            "¿Cómo te llamás?"
        );

        if(
            nombre &&
            nombre.trim() !== ""
        ){

            localStorage.setItem(
                "nombreUsuario",
                nombre
            );

        }
        else{

            nombre =
            "Usuario";

        }

    }

    const saludo =
    document.getElementById(
        "saludoUsuario"
    );

    if(saludo){

        saludo.innerHTML =
        `¡Hola ${nombre}! 👋`;

    }

}

function cambiarNombre(){

    const nuevo =
    prompt(
        "Ingresá tu nombre"
    );

    if(
        nuevo &&
        nuevo.trim() !== ""
    ){

        localStorage.setItem(
            "nombreUsuario",
            nuevo
        );

        cargarUsuario();

    }

}

// ==== V9 EXTRA ====
function actualizarConduccion(){
 if(!window.climaActual) return;
 const e=document.getElementById('estadoConduccion');
 const c=document.getElementById('consejoConduccion');
 if(!e||!c) return;
 if(climaActual.riesgo>=70){e.innerHTML='🔴 Riesgoso'; c.innerHTML='Evitar conducir si es posible';}
 else if(climaActual.riesgo>=40){e.innerHTML='🟡 Precaución'; c.innerHTML='Usar luces bajas';}
 else {e.innerHTML='🟢 Seguro'; c.innerHTML='Buenas condiciones';}
}

const localidades={
'Estación Aráoz':{lat:-26.83,lon:-65.14},
'Tacanas':{lat:-26.58,lon:-65.33},
'Ranchillos':{lat:-26.87,lon:-65.15},
'Lastenia':{lat:-26.85,lon:-65.20}
};

document.addEventListener('DOMContentLoaded',()=>{
 const s=document.getElementById('selectorLocalidad');
 if(s){
   s.value=localStorage.getItem('localidadSeleccionada')||'Estación Aráoz';
   s.onchange=()=>localStorage.setItem('localidadSeleccionada',s.value);
 }
 const pr=document.getElementById('predictorBox');
 if(pr) pr.innerHTML='🧠 Inicio probable 03:00 | Fin 08:00 | Confianza 85%';
 const mp=document.getElementById('mapaNiebla');
 if(mp) mp.innerHTML='🔴 Estación Aráoz 85%<br>🟡 Tacanas 55%<br>🟢 Ranchillos 20%';
});
alert("APP.JS CARGADO");
