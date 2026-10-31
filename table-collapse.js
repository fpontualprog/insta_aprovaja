(() => {
  function initCollapsibleTables() {
    const wrappers = document.querySelectorAll('.schedule-table-wrap, .table-wrap');
    wrappers.forEach((wrapper, index) => {
      const table = wrapper.querySelector('table');
      if (!table || wrapper.dataset.collapseReady === 'true') return;
      wrapper.dataset.collapseReady = 'true';

      const panel = wrapper.closest('.panel');
      const heading = panel?.querySelector('.panel-head h2, h2, h3');
      const label = heading?.textContent?.trim() || 'Tabela ' + (index + 1);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'table-collapse-toggle';
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-controls', 'collapsible-table-' + index);
      button.textContent = 'Recolher tabela';
      button.title = 'Recolher ou expandir: ' + label;

      wrapper.id = wrapper.id || 'collapsible-table-' + index;
      button.addEventListener('click', () => {
        const willCollapse = !wrapper.hidden;
        wrapper.hidden = willCollapse;
        button.setAttribute('aria-expanded', String(!willCollapse));
        button.textContent = willCollapse ? 'Expandir tabela' : 'Recolher tabela';
      });

      wrapper.parentNode.insertBefore(button, wrapper);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsibleTables, { once: true });
  } else {
    initCollapsibleTables();
  }
})();
