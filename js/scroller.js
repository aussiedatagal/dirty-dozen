// Marks the step crossing the trigger line as active and reports its state.
// On phones the graphic fills the top of the screen, so the line sits low.
export function watchSteps(section, onStep) {
  const steps = [...section.querySelectorAll('.step')];
  let current = -1;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const index = steps.indexOf(entry.target);
      if (index === current) continue;
      current = index;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
      onStep(entry.target.dataset.state, index);
    }
  }, { rootMargin: matchMedia('(min-width: 900px)').matches ? '-50% 0px -50% 0px' : '-74% 0px -25% 0px' });

  steps.forEach(s => observer.observe(s));
}
