const descriptions = {
  sun: 'Sun: a circle centred at (695, 83) with a radius of 44.',
  cloud: 'Cloud: two overlapping ellipses form one cloud.',
  walls: 'House walls: a rectangle starts at (220, 205) and measures 365 by 205.',
  roof: 'Roof and chimney: a polygon makes the roof, with a rectangle for the chimney.',
  door: 'Door: a rectangle with a small circle for the doorknob.',
  'left-window': 'Left window: the shared window style is moved with translate(270 265).',
  'right-window': 'Right window: the same shapes are moved with translate(475 265).',
  walkway: 'Walkway: a curved SVG path extends from the door to the bottom edge.',
  'left-flowers': 'Left flowers: a line makes the stem and two circles make the blooms.',
  'right-flower': 'Right flower: a line makes the stem and a circle makes the bloom.',
};

fetch('../assets/house.svg')
  .then((response) => {
    if (!response.ok) throw new Error(`Could not load the house SVG (${response.status})`);
    return response.text();
  })
  .then((svgMarkup) => {
    const target = document.querySelector('#house-target');
    const status = document.querySelector('#house-status');
    const initialText = status.textContent.trim();
    target.innerHTML = svgMarkup;
    const parts = [...target.querySelectorAll('[data-part]')];
    let selectedPart = null;

    function restoreStatus() {
      status.textContent = selectedPart ? descriptions[selectedPart.dataset.part] : initialText;
    }

    function selectPart(part) {
      selectedPart = selectedPart === part ? null : part;
      parts.forEach((item) => {
        const selected = item === selectedPart;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      restoreStatus();
    }

    parts.forEach((part) => {
      part.classList.add('house-part');
      part.setAttribute('tabindex', '0');
      part.setAttribute('role', 'button');
      part.setAttribute('aria-label', descriptions[part.dataset.part]);
      part.setAttribute('aria-pressed', 'false');
      part.addEventListener('mouseenter', () => {
        status.textContent = descriptions[part.dataset.part];
      });
      part.addEventListener('focus', () => {
        status.textContent = descriptions[part.dataset.part];
      });
      part.addEventListener('mouseleave', restoreStatus);
      part.addEventListener('blur', restoreStatus);
      part.addEventListener('click', () => selectPart(part));
      part.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectPart(part);
        }
      });
    });
  })
  .catch((error) => {
    document.querySelector('#house-target').textContent = error.message;
  });
