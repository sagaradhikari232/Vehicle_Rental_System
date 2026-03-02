export function smoothScrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function smoothScrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}