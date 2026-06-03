export function focusNextElement(current?: HTMLElement | null) {
  const focusable = Array.from(
    document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  if (!focusable.length) return;
  if (!current) {
    focusable[0].focus();
    return;
  }
  const idx = focusable.indexOf(current);
  const next = focusable[(idx + 1) % focusable.length];
  next.focus();
}

export function focusPrevElement(current?: HTMLElement | null) {
  const focusable = Array.from(
    document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  if (!focusable.length) return;
  if (!current) {
    focusable[focusable.length - 1].focus();
    return;
  }
  const idx = focusable.indexOf(current);
  const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
  prev.focus();
}
