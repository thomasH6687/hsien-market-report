(function () {
  var main = document.querySelector('main.container');
  if (!main || main.closest('.report-shell')) return;

  var content = main.querySelector('article.report') || main;
  var headings = Array.from(content.querySelectorAll('h2, h3, p')).filter(function (heading) {
    if (heading.matches('h2, h3')) return heading.textContent.trim().length > 0;
    var strong = heading.querySelector(':scope > strong:only-child');
    return !!strong && /^(?:完整版｜)?[一二三四五六七八九十]+、/.test(strong.textContent.trim());
  });
  if (headings.length < 2) return;

  var usedIds = new Set();
  headings.forEach(function (heading, index) {
    var id = heading.id || 'section-' + String(index + 1).padStart(2, '0');
    while (usedIds.has(id) || (document.getElementById(id) && document.getElementById(id) !== heading)) {
      id += '-section';
    }
    heading.id = id;
    if (heading.tagName === 'P') heading.classList.add('report-section-marker');
    usedIds.add(id);
  });

  content.classList.add('report-content');

  var shell = document.createElement('div');
  shell.className = 'report-shell';
  main.parentNode.insertBefore(shell, main);

  var toc = document.createElement('details');
  toc.className = 'report-toc';
  toc.open = window.matchMedia('(min-width: 901px)').matches;

  var summary = document.createElement('summary');
  summary.textContent = '段落導覽';
  toc.appendChild(summary);

  var nav = document.createElement('nav');
  nav.setAttribute('aria-label', '本文段落');
  headings.forEach(function (heading) {
    var link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent.trim();
    link.dataset.level = heading.tagName === 'H3' ? '3' : '2';
    nav.appendChild(link);
  });
  toc.appendChild(nav);
  shell.append(toc, main);

  var links = Array.from(nav.querySelectorAll('a'));
  function markCurrent(id) {
    links.forEach(function (link) {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible[0]) markCurrent(visible[0].target.id);
    }, { rootMargin: '-10% 0px -78% 0px' });
    headings.forEach(function (heading) { observer.observe(heading); });
  }

  nav.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    markCurrent(link.hash.slice(1));
    if (window.matchMedia('(max-width: 900px)').matches) toc.open = false;
  });
})();
