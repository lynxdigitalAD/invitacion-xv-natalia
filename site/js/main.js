const invitationData = {
  nombre: "Natalia Angelique González Martínez",
  papas: ["Israel Eduardo González Mares", "Itzel Martínez Rodríguez"],
  fecha: "21 de noviembre de 2026",
  contador: {
    zonaHoraria: "America/Mexico_City",
    objetivo: {
      year: 2026,
      month: 11,
      day: 21,
      hour: 11,
      minute: 0,
      second: 0
    }
  },
  ceremonia: {
    label: "Ceremonia",
    hora: "11:00 a.m.",
    direccion: "Ubicación de la ceremonia",
    mapsLink: "https://maps.app.goo.gl/AuUFA5xw62xt8yoh7?g_st=aw",
    embedUrl: "https://www.google.com/maps?q=19.5960712,-98.9392929&z=17&output=embed"
  },
  recepcion: {
    label: "Recepción",
    hora: "2:00 p.m.",
    direccion: "Ubicación de la Recepción",
    mapsLink: "https://maps.app.goo.gl/PWB9MEtzxtxfiRw68",
    embedUrl: "https://www.google.com/maps?q=Av.%20Independencia%2052%2C%20Santa%20Isabel%20Ixtapan%2C%20Estado%20de%20M%C3%A9xico&z=17&output=embed"
  }
};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);
let coverLockScrollY = 0;

const [firstName, ...lastNameParts] = invitationData.nombre.split(" ");
const displayFirstName = `${firstName} ${lastNameParts.shift()}`;
const displayLastName = lastNameParts.join(" ");

const setText = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
};

setText('[data-field="firstName"]', displayFirstName);
setText('[data-field="lastName"]', displayLastName);
setText('[data-field="father"]', invitationData.papas[0]);
setText('[data-field="mother"]', invitationData.papas[1]);
setText('[data-field="date"]', invitationData.fecha);

const tabs = Array.from(document.querySelectorAll("[data-location]"));
const mapFrame = document.querySelector("[data-map-frame]");
const mapTime = document.querySelector("[data-map-time]");
const mapAddress = document.querySelector("[data-map-address]");
const mapsLink = document.querySelector("[data-maps-link]");

function setActiveMap(locationKey) {
  const location = invitationData[locationKey];
  if (!location) return;

  tabs.forEach((tab) => {
    const isActive = tab.dataset.location === locationKey;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  mapTime.textContent = location.hora;
  mapAddress.textContent = location.direccion;
  mapsLink.href = location.mapsLink;
  mapsLink.setAttribute("aria-label", `Abrir ubicación de ${location.label.toLowerCase()} en Google Maps`);
  mapFrame.src = location.embedUrl;
  mapFrame.title = `Mapa de ${location.label.toLowerCase()}`;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveMap(tab.dataset.location));
});

setActiveMap("ceremonia");

const countdown = document.querySelector("[data-countdown]");
const countdownFields = {
  days: document.querySelector("[data-countdown-days]"),
  hours: document.querySelector("[data-countdown-hours]"),
  minutes: document.querySelector("[data-countdown-minutes]"),
  seconds: document.querySelector("[data-countdown-seconds]")
};

function getTimeZoneOffset(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const values = {};
  parts.forEach((part) => {
    values[part.type] = part.value;
  });
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return zonedAsUtc - date.getTime();
}

function zonedTimeToUtc(parts, timeZone) {
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let utcTime = localAsUtc;

  for (let index = 0; index < 3; index += 1) {
    utcTime = localAsUtc - getTimeZoneOffset(new Date(utcTime), timeZone);
  }

  return utcTime;
}

function startCountdown() {
  if (!countdown) return;

  const targetTime = zonedTimeToUtc(invitationData.contador.objetivo, invitationData.contador.zonaHoraria);
  let intervalId;

  const renderCountdown = () => {
    const remaining = targetTime - Date.now();

    if (remaining <= 0) {
      countdown.innerHTML = '<p class="countdown-ended">¡Llegó el gran día!</p>';
      if (intervalId) clearInterval(intervalId);
      return false;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownFields.days.textContent = String(days);
    countdownFields.hours.textContent = String(hours).padStart(2, "0");
    countdownFields.minutes.textContent = String(minutes).padStart(2, "0");
    countdownFields.seconds.textContent = String(seconds).padStart(2, "0");
    return true;
  };

  if (renderCountdown()) {
    intervalId = setInterval(renderCountdown, 1000);
  }
}

startCountdown();

const lockedScrollKeys = new Set([
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  " ",
  "Spacebar"
]);
const envelopeOpenButton = document.querySelector("[data-envelope-open]");
const envelopeScreen = document.querySelector("[data-envelope-screen]");
const musicPlayer = document.querySelector("[data-music-player]");
const musicToggle = document.querySelector("[data-music-toggle]");
const musicHint = document.querySelector("[data-music-hint]");
const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let isCoverLocked = document.body.classList.contains("cover-locked");

const openingAssets = [
  "assets/images/fondo_sobre_mariposas_azul.webp",
  "assets/images/sobre_cuerpo.png",
  "assets/images/sobre_solapa.png",
  "assets/images/sello_sobre_mariposa.png"
];

Promise.all(openingAssets.map((src) => {
  const image = new Image();
  image.src = src;
  return image.decode();
})).then(() => {
  document.body.classList.add("envelope-assets-ready");
}).catch(() => {});

if (isCoverLocked) {
  coverLockScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.top = `-${coverLockScrollY}px`;
}

const blockInitialScroll = (event) => {
  if (!isCoverLocked) return;
  event.preventDefault();
};

const blockInitialKeys = (event) => {
  if (!isCoverLocked || !lockedScrollKeys.has(event.key)) return;
  event.preventDefault();
};

window.addEventListener("wheel", blockInitialScroll, { passive: false });
window.addEventListener("touchmove", blockInitialScroll, { passive: false });
document.addEventListener("touchmove", blockInitialScroll, { passive: false });
window.addEventListener("keydown", blockInitialKeys);

function updateMusicControl(isPlaying) {
  if (!musicToggle) return;
  musicToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function playMusic() {
  if (!musicPlayer || !musicPlayer.paused) return;

  const playRequest = musicPlayer.play();
  if (playRequest && typeof playRequest.catch === "function") {
    playRequest
      .then(() => updateMusicControl(true))
      .catch(() => updateMusicControl(false));
  } else {
    updateMusicControl(true);
  }
}

function pauseMusic() {
  if (!musicPlayer || musicPlayer.paused) return;
  musicPlayer.pause();
  updateMusicControl(false);
}

if (musicPlayer) {
  musicPlayer.volume = 0.25;
  musicPlayer.addEventListener("play", () => updateMusicControl(true));
  musicPlayer.addEventListener("pause", () => updateMusicControl(false));
  musicPlayer.addEventListener("ended", () => updateMusicControl(false));
}

if (musicToggle) {
  musicToggle.addEventListener("click", () => {
    if (!musicPlayer) return;
    if (musicHint) musicHint.classList.add("is-hidden");
    if (musicPlayer.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });
}

function unlockCover() {
  isCoverLocked = false;
  document.body.classList.remove("cover-locked");
  document.body.style.top = "";
  window.scrollTo(0, coverLockScrollY);

  window.removeEventListener("wheel", blockInitialScroll);
  window.removeEventListener("touchmove", blockInitialScroll);
  document.removeEventListener("touchmove", blockInitialScroll);
  window.removeEventListener("keydown", blockInitialKeys);
}

if (envelopeOpenButton && envelopeScreen) {
  envelopeOpenButton.addEventListener("click", () => {
    if (envelopeOpenButton.classList.contains("is-opening")) return;

    if (musicHint) musicHint.classList.add("is-hidden");
    playMusic();
    envelopeOpenButton.classList.add("is-opening");

    window.setTimeout(() => {
      envelopeScreen.classList.add("is-leaving");
      unlockCover();
      window.setTimeout(() => envelopeScreen.remove(), 300);
    }, prefersReducedMotionQuery.matches ? 80 : 980);
  });
}

const revealNodes = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
