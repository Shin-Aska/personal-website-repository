// guides/js/index.js
// Progressive enhancement: make cards keyboard-activatable and add small hover hint
(function () {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    const anchor = card.querySelector('a');
    if (!anchor) return;

    card.addEventListener('click', () => anchor.click());
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        anchor.click();
      }
    });
  });
})();
