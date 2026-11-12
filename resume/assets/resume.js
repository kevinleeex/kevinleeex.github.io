(() => {
  const languageKey = 'resume-language';
  const themeKey = 'resume-theme';
  let storageWarningShown = false;
  function storage(action, key, value) {
    try {
      return action === 'read' ? localStorage.getItem(key) : localStorage.setItem(key, value);
    } catch (error) {
      if (!storageWarningShown) {
        console.warn('Site preferences cannot be saved in this browser.', error);
        storageWarningShown = true;
      }
      return null;
    }
  }
  const valid = (value, options) => options.includes(value) ? value : 'auto';
  let theme = valid(storage('read', themeKey), ['auto', 'light', 'dark']);
  const language = valid(storage('read', languageKey), ['auto', 'zh', 'en']);
  const browserLanguage = () => /^zh(?:-|$)/i.test(navigator.languages?.[0] || navigator.language) ? 'zh' : 'en';
  const section = location.pathname.startsWith('/resume') ? 'resume' : location.pathname.startsWith('/privacy') ? 'privacy' : location.pathname.startsWith('/donate') ? 'donate' : '';
  const base = section ? `/${section}/` : '/';
  const targetLanguage = language === 'auto' ? browserLanguage() : language;
  const neutralEntry = section ? new RegExp(`^/${section}/?(?:index\\.html)?$`).test(location.pathname) : /^\/(?:index\.html)?$/.test(location.pathname);
  if (theme !== 'auto') document.documentElement.dataset.theme = theme;
  if (neutralEntry) {
    location.replace(`${base}${targetLanguage}/${location.search}${location.hash}`);
    return;
  }
  document.documentElement.dataset.enhanced = 'true';
  const emailAddress = () => [
    [104,101,108,108,111],
    [108,105,100,101,110,103,106,117],
    [99,111,109]
  ].map(part => String.fromCharCode(...part)).reduce((address, part, index) => address + (index === 1 ? '@' : index === 2 ? '.' : '') + part, '');
  document.addEventListener('DOMContentLoaded', () => {
    const preferences = document.querySelector('.preferences');
    if (!preferences) return;
    preferences.hidden = false;
    document.querySelector('.language-fallback').hidden = true;
    const routeLanguage = location.pathname.startsWith(`${base}zh/`) ? 'zh' : 'en';
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    const themeToggle = preferences.querySelector('#theme-toggle');
    function updateTheme() {
      const dark = theme === 'dark' || (theme === 'auto' && systemTheme.matches);
      themeToggle.setAttribute('aria-label', routeLanguage === 'zh' ? (dark ? '切换到浅色' : '切换到深色') : (dark ? 'Switch to light theme' : 'Switch to dark theme'));
      themeToggle.title = themeToggle.getAttribute('aria-label');
      themeToggle.dataset.dark = String(dark);
    }
    updateTheme();
    systemTheme.addEventListener('change', updateTheme);
    themeToggle.addEventListener('click', () => {
      theme = themeToggle.dataset.dark === 'true' ? 'light' : 'dark';
      storage('write', themeKey, theme);
      document.documentElement.dataset.theme = theme;
      updateTheme();
    });
    const languageLink = preferences.querySelector('.language-link');
    const updateLanguageLink = () => { languageLink.href = `${base}${languageLink.dataset.language}/${location.search}${location.hash}`; };
    updateLanguageLink();
    window.addEventListener('hashchange', updateLanguageLink);
    document.addEventListener('index-view-change', updateLanguageLink);
    languageLink.addEventListener('click', () => {
      updateLanguageLink();
      storage('write', languageKey, languageLink.dataset.language);
    });
    document.querySelectorAll('.email-compose').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = ['mail', 'to'].join('') + ':' + emailAddress();
        link.hidden = true;
        document.body.append(link);
        link.click();
        link.remove();
      });
    });
    const print = document.querySelector('.print-button');
    const printContact = document.querySelector('.print-contact');
    if (print) {
      print.hidden = false;
      print.addEventListener('click', () => window.print());
      const initialContact = printContact.textContent;
      window.addEventListener('beforeprint', () => { printContact.textContent = `${emailAddress()} · ${initialContact}`; });
      window.addEventListener('afterprint', () => { printContact.textContent = initialContact; });
    }
  });
})();
