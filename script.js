const pageLoader = document.querySelector('.page-loader');
const typingLine = document.querySelector('#typing-line');
const verseLine = document.querySelector('#verse-line');
const verseReplay = document.querySelector('#verse-replay');
const petalsLayer = document.querySelector('#petals');
const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');
const submitButton = form?.querySelector('button[type="submit"]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const typedMessage = 'Une histoire à célébrer';
const verseMessage = 'Deux cœurs, une promesse, et Dieu comme témoin.';
let verseTimer;

function dismissLoader() {
  window.setTimeout(() => pageLoader?.classList.add('is-hidden'), reduceMotion ? 0 : 850);
}

function typeMessage() {
  if (!typingLine) return;
  if (reduceMotion) {
    typingLine.textContent = typedMessage;
    return;
  }
  let index = 0;
  const typeNextCharacter = () => {
    typingLine.textContent = typedMessage.slice(0, index);
    index += 1;
    if (index <= typedMessage.length) window.setTimeout(typeNextCharacter, 62);
  };
  typeNextCharacter();
}

function typeVerse() {
  if (!verseLine) return;
  window.clearTimeout(verseTimer);
  verseLine.textContent = '';
  if (reduceMotion) {
    verseLine.textContent = verseMessage;
    return;
  }
  let index = 0;
  const typeNextCharacter = () => {
    verseLine.textContent = verseMessage.slice(0, index);
    index += 1;
    if (index <= verseMessage.length) verseTimer = window.setTimeout(typeNextCharacter, 70);
  };
  typeNextCharacter();
}

function createPetals() {
  if (!petalsLayer || reduceMotion) return;
  const count = window.innerWidth < 700 ? 9 : 16;
  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${3 + Math.random() * 94}%`;
    petal.style.setProperty('--delay', `${Math.random() * -18}s`);
    petal.style.setProperty('--fall-time', `${13 + Math.random() * 13}s`);
    petal.style.transform = `scale(${0.65 + Math.random() * .6})`;
    petalsLayer.appendChild(petal);
  }
}

function createClickBurst(event) {
  if (reduceMotion || !petalsLayer) return;
  const origin = event.currentTarget.getBoundingClientRect();
  const centerX = origin.left + origin.width / 2;
  const centerY = origin.top + origin.height / 2;
  for (let index = 0; index < 5; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal petal--burst';
    petal.style.left = `${centerX}px`;
    petal.style.top = `${centerY}px`;
    petal.style.setProperty('--burst-x', `${(Math.random() - .5) * 150}px`);
    petal.style.setProperty('--burst-y', `${-35 - Math.random() * 80}px`);
    petal.style.animation = `click-petal ${500 + Math.random() * 350}ms ease-out forwards`;
    petalsLayer.appendChild(petal);
    window.setTimeout(() => petal.remove(), 1000);
  }
}

function showError(field, message) {
  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  if (error) error.textContent = message;
  field.setAttribute('aria-invalid', 'true');
}

function clearError(field) {
  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  if (error) error.textContent = '';
  field.removeAttribute('aria-invalid');
}

document.addEventListener('DOMContentLoaded', () => {
  dismissLoader();
  typeMessage();
  window.setTimeout(typeVerse, reduceMotion ? 0 : 1050);
  createPetals();

  document.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('click', createClickBurst);
  });

  verseReplay?.addEventListener('click', typeVerse);

  form?.querySelectorAll('input, select').forEach((field) => {
    field.addEventListener('blur', () => {
      if (!field.value.trim()) showError(field, 'Ce champ est obligatoire.');
      else clearError(field);
    });
    field.addEventListener('input', () => {
      if (field.value.trim()) clearError(field);
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#name');
    const attendance = document.querySelector('#attendance');
    let valid = true;

    [name, attendance].forEach((field) => {
      if (!field.value.trim()) {
        showError(field, 'Ce champ est obligatoire.');
        valid = false;
      } else clearError(field);
    });

    if (!valid) return;

    const buttonLabel = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours…';
    }
    status.textContent = '';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('email-service-error');
        const message = attendance.value === 'yes'
          ? 'Merci, votre présence a bien été envoyée. Nous avons hâte de vous retrouver.'
          : 'Merci pour votre réponse. Elle a bien été envoyée.';
        status.textContent = message;
        form.reset();
      })
      .catch(() => {
        status.textContent = 'L’envoi n’a pas abouti. Vérifiez votre connexion puis réessayez.';
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = buttonLabel;
        }
      });
  });
});
