// Variable de entorno
const { VITE_API_KEY } = import.meta.env;
const apiKey = VITE_API_KEY;

// Variables HTML
const inputCiudad = document.querySelector('#ciudad');
const nombreCiudad = document.querySelector('#text-ciudad');
const temperatura = document.querySelector('#numero-grados');
const minClima = document.querySelector('#min-clima');
const maxClima = document.querySelector('#max-clima');
const feel = document.querySelector('#feel');
const humedad = document.querySelector('#humedad');
const viento = document.querySelector('#viento');
const presion = document.querySelector('#presion');
const estadoDiv = document.querySelector('#estado');
const fechaHora = document.querySelector('#fecha_hora');
const btnCelsius = document.querySelector('#celsius');
const btnFaren = document.querySelector('#faren');
const imgEstado = document.querySelector('#img_estado');
const section = document.querySelector('#section');
const loading = document.querySelector('#load');
const errorContainer = document.querySelector('#errorContainer');

const ctaSecundary = document.querySelector('.cta-secundary');
const ctaPrimary = document.querySelector('.cta-primary');
const unidades = document.querySelector('.unidad-termperatura');

const inputContainerCiudad = document.querySelector('#inputContainer');

const formulario = document.querySelector('#formulario');


// Eventos
document.addEventListener('DOMContentLoaded', () => {
  // Solicita permiso a la ubicacion al usuario al cargar la pagina
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

  // Al enviar el formulario llama la funcion del API
  formulario.addEventListener('submit', obtenerCiudad);

  // cuando deja de hacer focus al input tambien llama API
  inputCiudad.addEventListener('blur', obtenerCiudad);

})


// Funciones del GeoLocation
function successCallback(position) {
  const latitud = position.coords.latitude;
  const longitud = position.coords.longitude;

  llamarApiClima(latitud, longitud);
}

function errorCallback(error) {
  if (error.code === error.PERMISSION_DENIED) {
    erroDeBusqueda();
  }
}


// Funcion que llama API para obtener lat y lon
function obtenerCiudad(e) {
  e.preventDefault();

  // Validar que el in put no este vacio y no tenga numero ni espacios
  if (!inputCiudad.value) {
    inputContainerCiudad.classList.add('input-ciudad-container_error');

    setTimeout(() => {
      inputContainerCiudad.classList.remove('input-ciudad-container_error');
    }, 3000);
  } else {
    const formattedValue = inputCiudad.value.replace(/[^A-Za-zñáéíóúüÜÁÉÍÓÚ ]/g, '');
    inputCiudad.value = formattedValue;
    const inputValue = inputCiudad.value;

    llamarAPI(inputValue);
  }
}

// Funcion que me da lat y lon
function llamarAPI(ciudad) {

  const urlCiudad = `https://api.openweathermap.org/geo/1.0/direct?q=${ciudad}&appid=${apiKey}`;
  fetch(urlCiudad)
    .then(respuesta => {
      return respuesta.json();
    })
    .then(data => {
      const lat = data[0].lat;
      const lon = data[0].lon;
      const nombre = data[0].name;
      const estado = data[0].state;

      llamarApiClima(lat, lon, nombre, estado)
    })
    .catch(error => {
      loading.classList.remove('oculto');
      if (error) {
        loading.classList.add('oculto');
        erroDeBusqueda();
      }
    })
}


// Funcion que me datos del clima
function llamarApiClima(lat, lon, nombre, estado) {
  const urlClima = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  // ver si se estan mostrando y ocultar
  if (ctaPrimary.classList.contains('cta-primary-view') && ctaSecundary.classList.contains('cta-secundary-view')) {
    ctaPrimary.classList.remove('cta-primary-view');
    ctaSecundary.classList.remove('cta-secundary-view');
  }
  if (errorContainer.classList.contains('error-container-view')) {
    errorContainer.classList.remove('error-container-view');
  }


  // Mostra un loading
  loading.classList.remove('oculto');

  // Llamar api
  fetch(urlClima)
    .then(res => {
      return res.json();
    })
    .then(data => {
      // console.log(data);
      loading.classList.add('oculto');
      mostrarHtml(data, nombre, estado);
    })
    .catch(error => {
      console.log(error);
    })




}

// Generar HTMl
function mostrarHtml(data, nombre, estado) {
  ctaPrimary.classList.add('cta-primary-view');
  ctaSecundary.classList.add('cta-secundary-view');
  unidades.classList.add('unidad-termperatura-view');


  const { feels_like, humidity, pressure, temp, temp_max, temp_min } = data.main;
  const { speed } = data.wind;
  const description = data.weather[0].main;

  obtenerFecha(data.dt);

  if (nombre && estado) {
    nombreCiudad.textContent = `${nombre}, ${estado} `;
  } else {
    nombreCiudad.textContent = `${data.name}`;
  }



  // Ingresamos la temperatura, maxima y minima
  temperatura.innerHTML = `
    ${Math.round(temp)}<sup>o</sup>
    `;

  minClima.innerHTML = `
    
    Min: ${Math.round(temp_min)}<sup>o</sup>
    
    `;

  maxClima.innerHTML = `
    
    Max: ${Math.round(temp_max)}<sup>o</sup>
    
    `;


  // Datos del real feel
  feel.innerHTML = `
    
    ${Math.round(feels_like)}<sup>o</sup>
    
    `;


  // Humedad
  humedad.innerHTML = `
    
    ${humidity}%
    
    `;

  // Viento
  viento.innerHTML = `

    ${speed}m/s

` ;

  // presion
  presion.innerHTML = `

${pressure}hPa

`;


  estadoDiv.innerHTML = `

${description}

`;

  switch (description) {
    case 'Clouds':
      imgEstado.src = '/Icons/cloudy.svg';
      break;
    case 'Rain':
      imgEstado.src = '/Icons/droplets.svg';
      break;

    case 'Clear':
      imgEstado.src = '/Icons/sun.svg';
      break;
    case 'Mist':
      imgEstado.src = '/Icons/foggy.svg';
      break;

    default:
      break;
  }

  //Funciones para convertir a celsius y faren
  btnCelsius.addEventListener('click', () => {
    const temp_celsius = temp - 273.15;
    const temp_celsius_min = temp_min - 273.15;
    const temp_celsius_max = temp_max - 273.15;
    const tempCelRoundtemp_celsius = Math.round(temp_celsius);
    const tempCelRoundmin_celsius = Math.round(temp_celsius_min);
    const tempCelRoundmax_celsius = Math.round(temp_celsius_max);

    temperatura.innerHTML = `${tempCelRoundtemp_celsius}<sup>o</sup>`;
    minClima.innerHTML = `Max: ${tempCelRoundmin_celsius}<sup>o</sup>`;
    maxClima.innerHTML = `Min: ${tempCelRoundmax_celsius}<sup>o</sup>`;


    const feel_celsius = feels_like - 273.15;
    const feel_celsius_round = Math.round(feel_celsius);

    feel.innerHTML = `
        
        ${feel_celsius_round}<sup>o</sup>
        
        `;
  });

  btnFaren.addEventListener('click', () => {
    const temp_faren = 1.8 * (temp - 273.15) + 32;
    const temp_faren_min = 1.8 * (temp_min - 273.15) + 32;
    const temp_faren_max = 1.8 * (temp_max - 273.15) + 32;

    const temp_faren_round = Math.round(temp_faren);
    const temp_faren_min_round = Math.round(temp_faren_min);
    const temp_faren_max_round = Math.round(temp_faren_max);

    temperatura.innerHTML = `${temp_faren_round}<sup>o</sup>`;
    minClima.innerHTML = `Max: ${temp_faren_min_round}<sup>o</sup>`;
    maxClima.innerHTML = `Min: ${temp_faren_max_round}<sup>o</sup>`;


    const feel_faren = 1.8 * (feels_like - 273.15) + 32;
    const feel_faren_round = Math.round(feel_faren);

    feel.innerHTML = `
        
        ${feel_faren_round}<sup>o</sup>
        
        `;


  })

}

// Obtener fecha de la ciudad
function obtenerFecha(dt) {

  let timeNumber = dt;
  let date = new Date(timeNumber * 1000);

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  const formattedDate = date.toLocaleString('en-US', options);


  fechaHora.innerHTML = formattedDate;
}

// Funcion en caso de error
function erroDeBusqueda() {
  if (unidades.classList.contains('unidad-termperatura-view') && ctaPrimary.classList.contains('cta-primary-view') &&
    ctaSecundary.classList.contains('cta-secundary-view')) {
    unidades.classList.remove('unidad-termperatura-view');
    ctaPrimary.classList.remove('cta-primary-view');
    ctaSecundary.classList.remove('cta-secundary-view');
    // console.log('se ve');
  }



  errorContainer.classList.add('error-container-view');
}



