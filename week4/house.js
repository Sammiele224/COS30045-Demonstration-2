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
    const scene = target.querySelector('svg');
    scene.classList.add('house-scene');
    const parts = [...target.querySelectorAll('[data-part]')];
    const timeButton = document.querySelector('#house-time');
    let selectedPart = null;
    let night = false;
    let doorOpen = false;
    let cloudMoving = false;

    function describe(part) {
      const name = part.dataset.part;
      const detail = descriptions[name];
      if (name === 'sun') return `${detail} Scene: ${night ? 'night' : 'day'}.`;
      if (name === 'door') return `${detail} Door: ${doorOpen ? 'open' : 'closed'}.`;
      if (name.includes('window')) {
        return `${detail} Light: ${part.classList.contains('lights-on') ? 'on' : 'off'}.`;
      }
      if (name === 'cloud') return `${detail} Motion: ${cloudMoving ? 'on' : 'off'}.`;
      return detail;
    }

    function setNight(value) {
      night = value;
      scene.classList.toggle('night', night);
      timeButton.textContent = night ? 'Switch to day' : 'Switch to night';
      timeButton.setAttribute('aria-pressed', String(night));
    }

    function updateSelection() {
      parts.forEach((item) => {
        const selected = item === selectedPart;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    }

    function restoreStatus() {
      status.textContent = selectedPart ? describe(selectedPart) : initialText;
    }

    function selectPart(part) {
      const name = part.dataset.part;
      if (name === 'sun') setNight(!night);
      if (name === 'door') {
        doorOpen = !doorOpen;
        scene.classList.toggle('door-open', doorOpen);
      }
      if (name.includes('window')) part.classList.toggle('lights-on');
      if (name === 'cloud') {
        cloudMoving = !cloudMoving;
        scene.classList.toggle('cloud-moving', cloudMoving);
      }
      if (name.includes('flower')) part.classList.toggle('swaying');
      selectedPart = selectedPart === part ? null : part;
      updateSelection();
      status.textContent = describe(part);
    }

    timeButton.addEventListener('click', () => {
      setNight(!night);
      status.textContent = `The house is now in ${night ? 'night' : 'day'} mode. Select the sun to change it again.`;
    });
    document.querySelector('#house-reset').addEventListener('click', () => {
      setNight(false);
      doorOpen = false;
      cloudMoving = false;
      scene.classList.remove('door-open', 'cloud-moving');
      parts.forEach((part) => part.classList.remove('lights-on', 'swaying'));
      selectedPart = null;
      updateSelection();
      restoreStatus();
    });

    parts.forEach((part) => {
      part.classList.add('house-part');
      part.setAttribute('tabindex', '0');
      part.setAttribute('role', 'button');
      part.setAttribute('aria-label', descriptions[part.dataset.part]);
      part.setAttribute('aria-pressed', 'false');
      part.addEventListener('mouseenter', () => {
        status.textContent = describe(part);
      });
      part.addEventListener('focus', () => {
        status.textContent = describe(part);
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
