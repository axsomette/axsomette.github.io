// ===========================
// MonBudget — couche d'interface
// Ne remplace aucune fonction d'app.js : construit le rail des mois
// à partir du filtre #month-filter et appelle changeMonthFilter().
// ===========================

(function () {
    const select = document.getElementById('month-filter');
    const rail = document.getElementById('month-rail');
    const dayChip = document.getElementById('mb-day-chip');
    if (!select || !rail) return;

    const SHORT = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

    const now = new Date();
    const currentKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayRatio = now.getDate() / daysInMonth;

    function buildRail() {
        const selected = select.value;
        const months = Array.from(select.options).map(o => o.value).filter(v => v !== 'all').sort();

        rail.innerHTML = '';
        rail.appendChild(makeButton('all', "Tout l'historique", selected === 'all', 'all'));

        months.forEach((key, i) => {
            const [year, month] = key.split('-');
            const prevYear = i > 0 ? months[i - 1].slice(0, 4) : null;
            const state = key < currentKey ? 'past' : key === currentKey ? 'current' : 'future';
            let label = SHORT[Number(month) - 1];
            if (key === selected) label = select.options[select.selectedIndex].textContent;
            else if (prevYear && prevYear !== year) label += ' ' + year;
            rail.appendChild(makeButton(key, label, key === selected, state));
        });

        if (dayChip) {
            const showChip = selected === currentKey;
            dayChip.classList.toggle('hidden', !showChip);
            if (showChip) dayChip.textContent = 'Jour ' + now.getDate() + ' sur ' + daysInMonth;
        }

        const active = rail.querySelector('[aria-current="true"]');
        if (active) active.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    function makeButton(value, label, isSelected, state) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mb-rail__month mb-rail__month--' + state + (isSelected ? ' is-selected' : '');
        if (isSelected) btn.setAttribute('aria-current', 'true');

        const text = document.createElement('span');
        text.className = 'mb-rail__label';
        text.textContent = label;
        btn.appendChild(text);

        const track = document.createElement('span');
        track.className = 'mb-rail__track';
        track.setAttribute('aria-hidden', 'true');
        if (state === 'past') {
            track.innerHTML = '<span class="mb-rail__fill" style="width:100%"></span>';
        } else if (state === 'current') {
            const pct = (dayRatio * 100).toFixed(1) + '%';
            track.innerHTML = '<span class="mb-rail__fill" style="width:' + pct + '"></span><span class="mb-rail__dot" style="left:' + pct + '"></span>';
        }
        btn.appendChild(track);

        btn.addEventListener('click', () => {
            if (select.value === value) return;
            select.value = value;
            changeMonthFilter();
            buildRail();
        });
        return btn;
    }

    // app.js reconstruit les options du filtre à chaque rendu : on suit.
    new MutationObserver(buildRail).observe(select, { childList: true });
    select.addEventListener('change', buildRail);
    buildRail();
})();

// Bouton « Ajouter une ligne » de la barre du haut : amène au formulaire.
function mbFocusForm() {
    const form = document.getElementById('form-container');
    if (!form) return;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('desc-input')?.focus({ preventScroll: true }), 350);
}
