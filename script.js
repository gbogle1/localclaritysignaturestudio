const welcomeScreen = document.getElementById('welcomeScreen');
const builderScreen = document.getElementById('builderScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const form = document.getElementById('signatureForm');
const steps = [...document.querySelectorAll('.form-step')];
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');
const progressFill = document.getElementById('progressFill');
const stepText = document.getElementById('stepText');
const progressText = document.getElementById('progressText');
const preview = document.getElementById('signaturePreview');
const template = document.getElementById('signatureTemplate');
const copyButton = document.getElementById('copyButton');
const copyStatus = document.getElementById('copyStatus');
const demoUrl = document.getElementById('demoUrl');
const ticketUrl = document.getElementById('ticketUrl');

let currentStep = 1;
const stepNames = ['THE BASICS', 'THE JOB STUFF', 'THE BUTTON', 'THE VICTORY LAP'];
const defaults = {
  name: 'Your Name',
  title: 'Your Position Title',
  email: 'you@localclarity.com'
};

function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function getValues() {
  const ctaType = form.querySelector('input[name="ctaType"]:checked').value;
  const rawUrl = ctaType === 'lead' ? demoUrl.value.trim() : ticketUrl.value.trim();
  return {
    name: document.getElementById('name').value.trim() || defaults.name,
    title: document.getElementById('title').value.trim() || defaults.title,
    email: document.getElementById('email').value.trim() || defaults.email,
    ctaType,
    buttonText: ctaType === 'lead' ? 'Book a Demo' : 'Submit a Ticket',
    buttonLink: isSafeUrl(rawUrl) ? rawUrl : 'https://www.localclarity.com/'
  };
}

function buildSignature() {
  const values = getValues();
  const fragment = template.content.cloneNode(true);
  fragment.querySelector('[data-signature-name]').textContent = values.name;
  fragment.querySelector('[data-signature-title]').textContent = values.title;

  const emailLink = fragment.querySelector('[data-signature-email-link]');
  emailLink.textContent = values.email;
  emailLink.href = `mailto:${values.email}`;

  const ctaRow = fragment.querySelector('[data-signature-cta-row]');
  if (values.ctaType === 'none') {
    ctaRow.remove();
  } else {
    const cta = fragment.querySelector('[data-signature-cta-link]');
    cta.textContent = values.buttonText;
    cta.href = values.buttonLink;
  }

  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment);
  return wrapper;
}

function updatePreview() {
  const signature = buildSignature();
  preview.replaceChildren(...signature.childNodes);
}

function updateCtaControls() {
  const chosen = form.querySelector('input[name="ctaType"]:checked').value;
  document.querySelectorAll('.choice-card').forEach((card) => {
    card.classList.toggle('selected', card.querySelector('input').checked);
  });
  document.querySelectorAll('.url-field').forEach((field) => {
    field.classList.toggle('active', field.dataset.urlFor === chosen);
  });
}

function setStep(step) {
  currentStep = step;
  steps.forEach((item) => item.classList.toggle('active', Number(item.dataset.step) === currentStep));
  progressFill.style.width = `${currentStep * 25}%`;
  stepText.textContent = `STEP ${String(currentStep).padStart(2, '0')} / 04`;
  progressText.textContent = stepNames[currentStep - 1];
  backButton.classList.toggle('is-hidden', currentStep === 1);
  nextButton.classList.toggle('is-hidden', currentStep === 4);
  copyStatus.textContent = '';
}

function validateCurrentStep() {
  const fields = [...steps[currentStep - 1].querySelectorAll('input[required]')];
  let valid = true;
  fields.forEach((field) => {
    const fieldValid = field.checkValidity();
    field.classList.toggle('invalid', !fieldValid);
    if (!fieldValid) valid = false;
  });
  if (!valid) {
    const firstInvalid = fields.find((field) => !field.checkValidity());
    firstInvalid.focus();
    firstInvalid.reportValidity();
  }
  return valid;
}

async function copySignature() {
  const signature = buildSignature();
  const html = signature.innerHTML;
  const plainText = signature.textContent.replace(/\n\s*/g, '\n').trim();

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' })
        })
      ]);
    } else {
      const copyArea = document.createElement('div');
      copyArea.contentEditable = 'true';
      copyArea.style.cssText = 'position:fixed;left:-9999px;top:0;';
      copyArea.innerHTML = html;
      document.body.appendChild(copyArea);
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(copyArea);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      copyArea.remove();
    }
    copyStatus.textContent = 'COPIED. NOW GO MAKE GMAIL LOOK EXPENSIVE.';
    copyButton.innerHTML = '<span aria-hidden="true">✓</span> Copied';
    setTimeout(() => {
      copyButton.innerHTML = '<span aria-hidden="true">▣</span> Copy signature';
    }, 2200);
  } catch {
    copyStatus.textContent = 'COPY WAS BLOCKED. SELECT THE PREVIEW, COPY IT, THEN PASTE IN GMAIL.';
  }
}

startButton.addEventListener('click', () => {
  welcomeScreen.hidden = true;
  builderScreen.hidden = false;
  document.getElementById('name').focus();
});

restartButton.addEventListener('click', () => {
  builderScreen.hidden = true;
  welcomeScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

form.addEventListener('input', (event) => {
  event.target.classList.remove('invalid');
  updatePreview();
});
form.addEventListener('change', () => {
  updateCtaControls();
  updatePreview();
});
nextButton.addEventListener('click', () => {
  if (validateCurrentStep()) setStep(Math.min(currentStep + 1, 4));
});
backButton.addEventListener('click', () => setStep(Math.max(currentStep - 1, 1)));
copyButton.addEventListener('click', copySignature);

updateCtaControls();
updatePreview();
setStep(1);
