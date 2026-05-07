        document.getElementById('current-year').textContent = new Date().getFullYear();

        // --- GESTION DU MENU MOBILE ---
        function toggleMobileMenu() {
            const menu = document.getElementById('action-menu');
            const icon = document.getElementById('mobile-menu-icon');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                menu.classList.add('flex');
                icon.setAttribute('data-lucide', 'x');
            } else {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        }

        // --- GESTION DU THEME SOMBRE ---
        function toggleTheme() {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
                document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
                document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
            }
            lucide.createIcons();
            updateChartTheme();
        }

        function updateChartTheme() {
            const isDark = document.documentElement.classList.contains('dark');
            Chart.defaults.color = isDark ? '#94a3b8' : '#64748b'; 
            Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0'; 
            
            if (chartInstance) chartInstance.update();
            if (expandedChartInstance) expandedChartInstance.update();
            if (compareChartInstance) compareChartInstance.update();
        }

        if (document.documentElement.classList.contains('dark')) {
            setTimeout(() => { 
                const icon = document.getElementById('theme-icon');
                if(icon) icon.setAttribute('data-lucide', 'sun'); 
                updateChartTheme();
            }, 100);
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        // --- GESTION DES NOTIFICATIONS (TOAST) ---
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const isError = type === 'error';
            const bgColor = isError ? 'bg-rose-500' : 'bg-emerald-500';
            const icon = isError ? 'alert-triangle' : 'check-circle';
            
            toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm transform transition-all duration-300 translate-y-[-100%] opacity-0 ${bgColor}`;
            toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i> <span class="leading-snug">${escapeHtml(message)}</span>`;
            
            container.appendChild(toast);
            lucide.createIcons({root: toast});

            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-[-100%]', 'opacity-0');
            });

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-[-100%]');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        const availablePalettes = [
            { id: "emerald", icon: "home", text: "text-emerald-600 dark:text-emerald-400", bgLight: "bg-emerald-100 dark:bg-emerald-500/10", textDark: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/50", bar: "bg-emerald-500", hex: "#10b981" },
            { id: "blue", icon: "repeat", text: "text-blue-600 dark:text-blue-400", bgLight: "bg-blue-100 dark:bg-blue-500/10", textDark: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800/50", bar: "bg-blue-500", hex: "#3b82f6" },
            { id: "orange", icon: "plane", text: "text-orange-500 dark:text-orange-400", bgLight: "bg-orange-100 dark:bg-orange-500/10", textDark: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800/50", bar: "bg-orange-500", hex: "#f97316" },
            { id: "purple", icon: "star", text: "text-purple-500 dark:text-purple-400", bgLight: "bg-purple-100 dark:bg-purple-500/10", textDark: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800/50", bar: "bg-purple-500", hex: "#a855f7" },
            { id: "pink", icon: "heart", text: "text-pink-500 dark:text-pink-400", bgLight: "bg-pink-100 dark:bg-pink-500/10", textDark: "text-pink-700 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800/50", bar: "bg-pink-500", hex: "#ec4899" },
            { id: "teal", icon: "briefcase", text: "text-teal-500 dark:text-teal-400", bgLight: "bg-teal-100 dark:bg-teal-500/10", textDark: "text-teal-700 dark:text-teal-400", border: "border-teal-200 dark:border-teal-800/50", bar: "bg-teal-500", hex: "#14b8a6" },
            { id: "rose", icon: "coffee", text: "text-rose-500 dark:text-rose-400", bgLight: "bg-rose-100 dark:bg-rose-500/10", textDark: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800/50", bar: "bg-rose-500", hex: "#f43f5e" },
            { id: "amber", icon: "shopping-bag", text: "text-amber-500 dark:text-amber-400", bgLight: "bg-amber-100 dark:bg-amber-500/10", textDark: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800/50", bar: "bg-amber-500", hex: "#f59e0b" }
        ];

        let expenses = []; 
        let appCategories = {}; 
        let editingId = null;
        let currentMonthFilter = 'all'; 
        let currentSort = 'date-desc';
        let currentSearchQuery = ''; 
        let currentCategoryFilter = 'all'; 
        let formType = 'expense';
        let isFixedExpense = false;
        let chartInstance = null; 
        let compareChartInstance = null;
        let currentCompareChartType = 'bar'; 
        let pendingImportData = null;
        let expandedChartInstance = null; 
        let itemToDeleteId = null; 
        let searchTimeout = null;

        function showLoader(title, subtitle) {
            document.getElementById('loader-title').textContent = title;
            document.getElementById('loader-subtitle').textContent = subtitle;
            const modal = document.getElementById('global-loader-modal');
            const content = document.getElementById('global-loader-content');
            modal.classList.remove('hidden');
            requestAnimationFrame(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            });
        }

        function hideLoader() {
            const modal = document.getElementById('global-loader-modal');
            const content = document.getElementById('global-loader-content');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }

        function openSimulatorModal() {
            document.getElementById('simulator-modal').classList.remove('hidden');
            document.getElementById('simulator-results').classList.add('hidden');
            document.getElementById('simulator-empty').classList.remove('hidden');
            document.getElementById('simulator-target-input').value = '';

            const months = Array.from(new Set(expenses.filter(e => e.type === 'expense' && e.date).map(e => e.date.slice(0, 7)))).sort().reverse();
            const selectM = document.getElementById('simulator-month-select');
            
            let optionsHtml = '';
            months.forEach(m => {
                const [year, month] = m.split('-');
                const name = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                optionsHtml += `<option value="${m}">${name.charAt(0).toUpperCase() + name.slice(1)}</option>`;
            });

            if (months.length === 0) {
                optionsHtml = `<option value="">Pas assez de données</option>`;
            }

            selectM.innerHTML = optionsHtml;
        }

        function closeSimulatorModal() {
            document.getElementById('simulator-modal').classList.add('hidden');
        }

        function runSimulation() {
            const targetStr = document.getElementById('simulator-target-input').value;
            if (!targetStr || targetStr <= 0) return showToast("Veuillez entrer un budget valide.", "error");
            
            const targetCents = Math.round(parseFloat(targetStr) * 100);
            const baselineMonth = document.getElementById('simulator-month-select').value;
            
            if (!baselineMonth) {
                return showToast("Pas assez de dépenses dans l'historique pour simuler.", "error");
            }

            const baselineExpenses = expenses.filter(e => e.date.startsWith(baselineMonth) && e.type === 'expense');
            const fixedExpenses = baselineExpenses.filter(e => e.isFixed);
            const variableExpenses = baselineExpenses.filter(e => !e.isFixed);

            let baselineTotal = 0;
            baselineExpenses.forEach(e => { baselineTotal += e.amountCents; });
            const fixedTotal = fixedExpenses.reduce((s, e) => s + e.amountCents, 0);
            const variableTotal = variableExpenses.reduce((s, e) => s + e.amountCents, 0);

            if (baselineTotal === 0) {
                return showToast("Ce mois de référence ne contient aucune dépense.", "error");
            }

            const resultsContainer = document.getElementById('simulator-results');
            const emptyState = document.getElementById('simulator-empty');

            emptyState.classList.add('hidden');
            resultsContainer.classList.remove('hidden');

            // L'effort s'applique uniquement sur les dépenses variables
            const variableTarget = targetCents - fixedTotal;
            const diffCents = variableTotal - variableTarget;
            const dateObj = new Date(baselineMonth + '-01');
            const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            // Bloc charges fixes (affiché si présentes)
            const fixedBlock = fixedTotal > 0 ? `
                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                        <i data-lucide="pin" class="w-4 h-4 shrink-0"></i>
                        <span><b>${fixedExpenses.length} charge${fixedExpenses.length > 1 ? 's' : ''} fixe${fixedExpenses.length > 1 ? 's' : ''}</b> non optimisables (loyer, abonnements…)</span>
                    </div>
                    <span class="font-bold text-orange-600 dark:text-orange-400 shrink-0">${formatCurrency(fixedTotal/100)}</span>
                </div>` : '';

            if (variableTarget <= 0) {
                resultsContainer.innerHTML = fixedBlock + `
                    <div class="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl p-6 text-center mt-3">
                        <div class="w-16 h-16 bg-rose-100 dark:bg-rose-800/50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="alert-octagon" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-xl font-bold text-rose-700 dark:text-rose-400 mb-2">Objectif impossible</h3>
                        <p class="text-rose-600 dark:text-rose-300">Vos charges fixes seules s'élèvent à <b>${formatCurrency(fixedTotal/100)}</b>, ce qui dépasse déjà votre objectif de <b>${formatCurrency(targetCents/100)}</b>. Relevez votre budget cible.</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            if (diffCents <= 0) {
                resultsContainer.innerHTML = fixedBlock + `
                    <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6 text-center mt-3">
                        <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="check-circle" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">Objectif atteint d'avance !</h3>
                        <p class="text-emerald-600 dark:text-emerald-300">Vos dépenses variables de ${monthName} (<b>${formatCurrency(variableTotal/100)}</b>) sont déjà sous votre objectif variable de <b>${formatCurrency(variableTarget/100)}</b>.</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            const catTotals = {};
            variableExpenses.forEach(e => {
                const key = e.largeCat + '__||__' + e.smallCat;
                catTotals[key] = (catTotals[key] || 0) + e.amountCents;
            });

            let totalWeightedSpend = 0;
            const weightedCats = [];

            for (const key in catTotals) {
                const [large, small] = key.split('__||__');
                let weight = 4;
                const largeLower = large.toLowerCase();
                if (largeLower.includes('essentiel')) weight = 1;
                else if (largeLower.includes('abonnement')) weight = 2;

                const spend = catTotals[key];
                totalWeightedSpend += (spend * weight);
                weightedCats.push({ key, large, small, spend, weight });
            }

            const cuts = [];
            let totalCutApplied = 0;

            weightedCats.forEach(cat => {
                let suggestedCut = diffCents * ((cat.spend * cat.weight) / totalWeightedSpend);
                const maxCut = cat.spend * 0.8;
                if (suggestedCut > maxCut) suggestedCut = maxCut;

                if (suggestedCut > 50) {
                    cuts.push({
                        ...cat,
                        cutAmount: Math.round(suggestedCut),
                        newBudget: Math.round(cat.spend - suggestedCut)
                    });
                    totalCutApplied += Math.round(suggestedCut);
                }
            });

            cuts.sort((a, b) => b.cutAmount - a.cutAmount);

            let html = `
                <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="text-center sm:text-left w-full sm:w-auto">
                        <p class="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Mois de référence analysé</p>
                        <p class="text-slate-700 dark:text-slate-300"><b>${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</b> avec <b>${formatCurrency(baselineTotal/100)}</b> de dépenses.</p>
                    </div>
                    <div class="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center w-full sm:w-auto shrink-0">
                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Effort total requis</p>
                        <p class="text-xl font-black text-rose-500 dark:text-rose-400">- ${formatCurrency(diffCents/100)}</p>
                    </div>
                </div>

                <div class="mt-8">
                    <h4 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                        <i data-lucide="list-checks" class="w-5 h-5 text-purple-500"></i> Plan d'action recommandé
                    </h4>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            `;

            if (cuts.length === 0) {
                html += `<p class="col-span-full text-slate-500 italic">L'écart est trop grand par rapport à vos données de référence pour générer un plan de coupe réaliste.</p>`;
            } else {
                cuts.forEach(c => {
                    const pal = appCategories[c.large] ? appCategories[c.large].palette : availablePalettes[0];
                    html += `
                        <div class="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 sm:gap-4 group hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                            <div class="p-2 sm:p-3 rounded-full ${pal.bgLight} ${pal.textDark} shrink-0">
                                <i data-lucide="${pal.icon}" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-slate-700 dark:text-slate-200 truncate text-sm sm:text-base">${escapeHtml(c.small)} <span class="text-[9px] sm:text-[10px] uppercase font-normal text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">(${escapeHtml(c.large)})</span></p>
                                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs">
                                    <span class="text-slate-400 line-through whitespace-nowrap">${formatCurrency(c.spend/100)}</span>
                                    <i data-lucide="arrow-right" class="w-3 h-3 text-slate-300 shrink-0"></i>
                                    <span class="font-bold text-indigo-600 dark:text-indigo-400 border-b border-indigo-200 dark:border-indigo-800 whitespace-nowrap">${formatCurrency(c.newBudget/100)}</span>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
                                <span class="inline-flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] sm:text-sm px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-800/30 whitespace-nowrap">
                                    - ${formatCurrency(c.cutAmount/100)}
                                </span>
                            </div>
                        </div>
                    `;
                });
            }

            html += `</div></div>`;
            resultsContainer.innerHTML = fixedBlock + html;
            lucide.createIcons();
        }

        function init() {
            const yearSelect = document.getElementById('year-select');
            const currentYear = new Date().getFullYear();
            for(let y = currentYear - 3; y <= currentYear + 5; y++) {
                const option = document.createElement('option');
                option.value = y; option.textContent = y;
                yearSelect.appendChild(option);
            }
            
            const now = new Date();
            document.getElementById('month-select').value = String(now.getMonth() + 1).padStart(2, '0');
            document.getElementById('year-select').value = String(now.getFullYear());
            
            loadData();
            populateCategoryDropdown();
            updateHistoryCategoryFilter(); 
            updateMonthDropdown();
            render();
            lucide.createIcons();
            setTimeout(updateChartTheme, 100);
        }

        function loadData() {
            const savedCats = localStorage.getItem('budgetCategories');
            if (savedCats) {
                try { appCategories = JSON.parse(savedCats); } catch(e) {}
            }
            if (Object.keys(appCategories).length === 0) {
                appCategories = {
                    "Essentielles": { palette: availablePalettes[0], subCats: ["Loyer", "Assurance", "Courses", "Électricité / Eau", "Transports", "Santé"], limitCents: 0 },
                    "Abonnements": { palette: availablePalettes[1], subCats: ["Internet & TV", "Téléphone", "Streaming", "Salle de sport", "Logiciels"], limitCents: 0 },
                    "Loisirs / Autre": { palette: availablePalettes[2], subCats: ["Shopping", "Restaurants", "Voyages", "Sorties", "Cadeaux", "Imprévus"], limitCents: 0 }
                };
                saveCategories();
            }

            const savedExp = localStorage.getItem('budgetData');
            if (savedExp) {
                try { 
                    expenses = JSON.parse(savedExp); 
                    expenses.forEach(e => {
                        if(!e.type) e.type = 'expense';
                        if(!e.date) e.date = new Date().toISOString().slice(0, 7) + '-01';
                        delete e.isRecurring; delete e.recurringParentId;
                        delete e.isOutlier; delete e.targetMonth; // Nettoyage de l'ancien système
                    });
                } catch(e) { expenses = []; }
            }
        }

        function saveData() { localStorage.setItem('budgetData', JSON.stringify(expenses)); }
        function saveCategories() { localStorage.setItem('budgetCategories', JSON.stringify(appCategories)); }

        // --- LIMITES MENSUELLES PAR CATÉGORIE ---
        // Retourne la limite pour une catégorie et un mois donnés.
        // Priorité : override mensuel (monthlyLimits) > limite par défaut (limitCents).
        // Rétrocompatible : si monthlyLimits est absent, retourne limitCents.
        function getLimitForMonth(cat, month) {
            const data = appCategories[cat];
            if (!data) return 0;
            if (month && month !== 'all' && data.monthlyLimits && data.monthlyLimits[month]) {
                return data.monthlyLimits[month];
            }
            return data.limitCents || 0;
        }

        function setMonthlyLimit(cat, month, cents) {
            if (!appCategories[cat]) return;
            if (!appCategories[cat].monthlyLimits) appCategories[cat].monthlyLimits = {};
            if (cents > 0) {
                appCategories[cat].monthlyLimits[month] = cents;
            } else {
                delete appCategories[cat].monthlyLimits[month];
                if (Object.keys(appCategories[cat].monthlyLimits).length === 0) {
                    delete appCategories[cat].monthlyLimits;
                }
            }
            saveCategories();
        }

        function deleteMonthlyLimit(cat, month) {
            setMonthlyLimit(cat, month, 0);
            renderEditCategories();
            render();
            showToast('Limite mensuelle supprimée.');
        }

        function handleSearchDebounce() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                changeSearchFilter();
            }, 300);
        }

        function changeSearchFilter() {
            currentSearchQuery = document.getElementById('search-filter').value.toLowerCase();
            renderList();
        }

        function changeCategoryFilter() {
            currentCategoryFilter = document.getElementById('history-category-filter').value;
            renderList();
        }

        function updateHistoryCategoryFilter() {
            const select = document.getElementById('history-category-filter');
            if (!select) return;
            const currentVal = select.value;
            
            select.innerHTML = `<option value="all">Toutes les catégories</option>`;
            
            for (const mainCat in appCategories) {
                const option = document.createElement('option');
                option.value = 'cat_' + mainCat; 
                option.textContent = mainCat;
                select.appendChild(option);
            }

            if (Array.from(select.options).some(opt => opt.value === currentVal)) {
                select.value = currentVal;
            } else {
                select.value = 'all';
                currentCategoryFilter = 'all';
            }
        }

        function updateMonthDropdown() {
            const months = new Set();
            expenses.forEach(item => { if(item.date) months.add(item.date.slice(0, 7)); });
            
            const sortedMonths = Array.from(months).sort().reverse();
            const currentSelection = document.getElementById('month-filter').value;
            
            document.getElementById('month-filter').innerHTML = '<option value="all">Tout l\'historique</option>';
            sortedMonths.forEach(m => {
                const [year, month] = m.split('-');
                const dateObj = new Date(year, month - 1);
                const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                const option = document.createElement('option');
                option.value = m; option.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                document.getElementById('month-filter').appendChild(option);
            });

            if (currentSelection !== 'all' && sortedMonths.includes(currentSelection)) {
                document.getElementById('month-filter').value = currentSelection;
            }
        }

        function changeMonthFilter() { 
            currentMonthFilter = document.getElementById('month-filter').value; 
            
            if (currentMonthFilter === 'all') {
                const now = new Date();
                document.getElementById('month-select').value = String(now.getMonth() + 1).padStart(2, '0');
                document.getElementById('year-select').value = String(now.getFullYear());
            } else {
                const [year, month] = currentMonthFilter.split('-');
                document.getElementById('year-select').value = year;
                document.getElementById('month-select').value = month;
            }
            
            render(); 
        }

        function changeSort() { currentSort = document.getElementById('sort-select').value; renderList(); }

        function setFormType(type) {
            formType = type;
            const btnExp = document.getElementById('btn-type-expense');
            const btnInc = document.getElementById('btn-type-income');
            const catWrapper = document.getElementById('category-wrapper');
            const fixedWrapper = document.getElementById('fixed-expense-wrapper');

            if (type === 'expense') {
                btnExp.className = "flex-1 py-1.5 rounded-md text-sm font-medium transition-all tab-active";
                btnInc.className = "flex-1 py-1.5 rounded-md text-sm font-medium transition-all tab-inactive";
                catWrapper.style.display = 'block';
                if (fixedWrapper) fixedWrapper.style.display = 'block';
                document.getElementById('category-input').required = true;
            } else {
                btnInc.className = "flex-1 py-1.5 rounded-md text-sm font-medium transition-all tab-active";
                btnExp.className = "flex-1 py-1.5 rounded-md text-sm font-medium transition-all tab-inactive";
                catWrapper.style.display = 'none';
                if (fixedWrapper) fixedWrapper.style.display = 'none';
                document.getElementById('category-input').required = false;
            }
        }

        function toggleFixedExpense() {
            isFixedExpense = !isFixedExpense;
            const btn = document.getElementById('is-fixed-toggle');
            const badge = document.getElementById('fixed-badge');
            if (isFixedExpense) {
                btn.classList.add('border-orange-400', 'dark:border-orange-600', 'bg-orange-50', 'dark:bg-orange-900/20', 'text-orange-600', 'dark:text-orange-400');
                btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400');
                if (badge) badge.classList.remove('hidden');
            } else {
                btn.classList.remove('border-orange-400', 'dark:border-orange-600', 'bg-orange-50', 'dark:bg-orange-900/20', 'text-orange-600', 'dark:text-orange-400');
                btn.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400');
                if (badge) badge.classList.add('hidden');
            }
        }

        function resetFixedToggle() {
            isFixedExpense = false;
            const btn = document.getElementById('is-fixed-toggle');
            const badge = document.getElementById('fixed-badge');
            if (btn) {
                btn.classList.remove('border-orange-400', 'dark:border-orange-600', 'bg-orange-50', 'dark:bg-orange-900/20', 'text-orange-600', 'dark:text-orange-400');
                btn.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400');
            }
            if (badge) badge.classList.add('hidden');
        }

        function render() {
            updateTotalsAndCards();
            renderInsights();
            renderRecurringSuggestion();
            renderList();
        }

        // ─── DÉTECTION DÉPENSES RÉCURRENTES ──────────────────────────────────

        // Clés des mois pour lesquels l'utilisateur a fermé le panneau
        let dismissedRecurring = new Set(JSON.parse(localStorage.getItem('dismissedRecurring') || '[]'));

        function saveDismissedRecurring() {
            localStorage.setItem('dismissedRecurring', JSON.stringify([...dismissedRecurring]));
        }

        function normalizeDesc(s) {
            return (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
        }

        /** Retourne les dépenses candidates à importer dans targetMonth.
         *  Un candidat = une dépense marquée isFixed dans n'importe quel autre mois,
         *  dédupliquée par desc normalisé + largeCat, absente du mois cible. */
        function detectRecurringExpenses(targetMonth) {
            const otherFixed = expenses.filter(e =>
                e.type === 'expense' && e.isFixed && e.date && !e.date.startsWith(targetMonth)
            );
            const targetExpenses = expenses.filter(e =>
                e.type === 'expense' && e.date && e.date.startsWith(targetMonth)
            );

            // Déduplique par clé, garde la version la plus récente
            const byKey = {};
            otherFixed.forEach(e => {
                const key = normalizeDesc(e.desc) + '|||' + (e.largeCat || '');
                if (!byKey[key] || e.date > byKey[key].date) byKey[key] = e;
            });

            // Clés déjà présentes dans le mois cible
            const alreadyIn = new Set(
                targetExpenses.map(e => normalizeDesc(e.desc) + '|||' + (e.largeCat || ''))
            );

            const candidates = [];
            for (const [key, e] of Object.entries(byKey)) {
                if (!alreadyIn.has(key)) {
                    candidates.push({
                        key,
                        desc: e.desc,
                        largeCat: e.largeCat || '',
                        smallCat: e.smallCat || '',
                        amountCents: e.amountCents,
                        isFixed: true
                    });
                }
            }

            // Tri alphabétique par description
            candidates.sort((a, b) => a.desc.localeCompare(b.desc, 'fr'));

            return candidates;
        }

        function renderRecurringSuggestion() {
            const container = document.getElementById('recurring-suggestion-container');
            if (!container) return;

            if (currentMonthFilter === 'all') {
                container.classList.add('hidden');
                container.innerHTML = '';
                return;
            }

            if (dismissedRecurring.has(currentMonthFilter)) {
                container.classList.add('hidden');
                container.innerHTML = '';
                return;
            }

            const candidates = detectRecurringExpenses(currentMonthFilter);
            if (candidates.length === 0) {
                container.classList.add('hidden');
                container.innerHTML = '';
                return;
            }

            const shortMonth = new Date(currentMonthFilter + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            const shortMonthCap = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1);

            // Build rows (max 5 visible, rest hidden behind "voir plus")
            const MAX_VISIBLE = 5;
            let rowsHtml = '';
            candidates.forEach((c, i) => {
                const isHidden = i >= MAX_VISIBLE;
                const encodedKey = encodeURIComponent(JSON.stringify({
                    desc: c.desc, largeCat: c.largeCat, smallCat: c.smallCat,
                    amountCents: c.amountCents, isFixed: c.isFixed
                }));
                rowsHtml += `
                    <div class="recurring-row flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${isHidden ? 'hidden recurring-extra' : ''}">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">${escapeHtml(c.desc)}</span>
                            </div>
                            <div class="text-xs text-slate-400 dark:text-slate-500 truncate">${escapeHtml(c.largeCat)}${c.smallCat ? ' · ' + escapeHtml(c.smallCat) : ''}</div>
                        </div>
                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 shrink-0">${formatCurrency(c.amountCents / 100)}</span>
                        <button onclick="importRecurringExpense('${encodedKey}', '${currentMonthFilter}')"
                                class="shrink-0 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700/50 px-2 py-1 rounded-lg transition-all">
                            <i data-lucide="plus" class="w-3 h-3"></i>Ajouter
                        </button>
                    </div>`;
            });

            const moreCount = candidates.length - MAX_VISIBLE;
            const moreBtn = moreCount > 0
                ? `<button onclick="toggleRecurringExtra(this)" class="mt-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                       + ${moreCount} autre${moreCount > 1 ? 's' : ''} <i data-lucide="chevron-down" class="w-3 h-3 inline-block"></i>
                   </button>`
                : '';

            // Encode all keys for "Tout ajouter"
            const allEncoded = encodeURIComponent(JSON.stringify(
                candidates.map(c => ({ desc: c.desc, largeCat: c.largeCat, smallCat: c.smallCat, amountCents: c.amountCents, isFixed: c.isFixed }))
            ));

            container.innerHTML = `
                <div class="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl shadow-sm overflow-hidden">
                    <div class="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800/50">
                        <div class="flex items-center gap-2">
                            <i data-lucide="repeat-2" class="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0"></i>
                            <span class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Charges fixes non encore ajoutées</span>
                            <span class="text-xs text-indigo-400 dark:text-indigo-500">pour ${shortMonthCap}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="importAllRecurring('${allEncoded}', '${currentMonthFilter}')"
                                    class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-700/50 px-2.5 py-1 rounded-lg transition-all">
                                Tout ajouter
                            </button>
                            <button onclick="dismissRecurringSuggestion()" class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>
                    <div class="px-4 pb-1">
                        ${rowsHtml}
                        ${moreBtn}
                    </div>
                </div>`;

            container.classList.remove('hidden');
            lucide.createIcons();
        }

        function dismissRecurringSuggestion() {
            if (currentMonthFilter !== 'all') {
                dismissedRecurring.add(currentMonthFilter);
                saveDismissedRecurring();
            }
            renderRecurringSuggestion();
        }

        function toggleRecurringExtra(btn) {
            const container = btn.closest('.bg-white, .dark\\:bg-slate-800') || btn.parentElement;
            const extras = container.querySelectorAll('.recurring-extra');
            const isHidden = extras[0] && extras[0].classList.contains('hidden');
            extras.forEach(el => el.classList.toggle('hidden', !isHidden));
            btn.innerHTML = isHidden
                ? `- Voir moins <i data-lucide="chevron-up" class="w-3 h-3 inline-block"></i>`
                : `+ ${extras.length} autre${extras.length > 1 ? 's' : ''} <i data-lucide="chevron-down" class="w-3 h-3 inline-block"></i>`;
            lucide.createIcons();
        }

        function importRecurringExpense(encodedData, targetMonth) {
            let data;
            try { data = JSON.parse(decodeURIComponent(encodedData)); } catch(e) { return; }

            // Find the first day of the month as default date
            const dateVal = targetMonth + '-01';
            const newItem = {
                id: Date.now() + Math.random(),
                type: 'expense',
                desc: data.desc,
                amountCents: data.amountCents,
                date: dateVal,
                largeCat: data.largeCat,
                smallCat: data.smallCat,
                isFixed: !!data.isFixed
            };
            expenses.push(newItem);
            saveData();
            updateMonthDropdown();
            render();
            updateCompareSelects();
            showToast(`"${data.desc}" ajouté à ${targetMonth}.`, 'success');
        }

        function importAllRecurring(encodedAll, targetMonth) {
            let items;
            try { items = JSON.parse(decodeURIComponent(encodedAll)); } catch(e) { return; }

            const dateVal = targetMonth + '-01';
            items.forEach(data => {
                expenses.push({
                    id: Date.now() + Math.random(),
                    type: 'expense',
                    desc: data.desc,
                    amountCents: data.amountCents,
                    date: dateVal,
                    largeCat: data.largeCat,
                    smallCat: data.smallCat,
                    isFixed: !!data.isFixed
                });
            });
            saveData();
            // Dismiss suggestion since all imported
            dismissedRecurring.add(targetMonth);
            saveDismissedRecurring();
            updateMonthDropdown();
            render();
            updateCompareSelects();
            showToast(`${items.length} charge${items.length > 1 ? 's' : ''} récurrente${items.length > 1 ? 's' : ''} importée${items.length > 1 ? 's' : ''}.`, 'success');
        }

        // ─────────────────────────────────────────────────────────────────────

        function getFilteredData(monthFilter = currentMonthFilter) {
            if (monthFilter === 'all') return expenses;
            return expenses.filter(e => e.date.startsWith(monthFilter));
        }

        function updateTotalsAndCards() {
            const filteredData = getFilteredData();
            let totalDepensesCents = 0; let totalRevenusCents = 0;
            const totalsLarge = {}; const totalsSmall = {};

            for (const key in appCategories) { totalsLarge[key] = 0; }

            filteredData.forEach(item => {
                if (item.type === 'income') {
                    totalRevenusCents += item.amountCents;
                } else {
                    totalDepensesCents += item.amountCents;
                    if(totalsLarge[item.largeCat] !== undefined) totalsLarge[item.largeCat] += item.amountCents;
                    const compoundKey = item.largeCat + '__||__' + item.smallCat;
                    totalsSmall[compoundKey] = (totalsSmall[compoundKey] || 0) + item.amountCents;
                }
            });

            document.getElementById('total-revenus').textContent = formatCurrency(totalRevenusCents / 100);
            document.getElementById('total-depenses').textContent = formatCurrency(totalDepensesCents / 100);
            const resteCents = totalRevenusCents - totalDepensesCents;
            const resteEl = document.getElementById('reste-a-vivre');
            resteEl.textContent = formatCurrency(resteCents / 100);
            resteEl.className = `text-3xl font-extrabold ${resteCents >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

            // Pré-calcul par mois pour la vue consistance (tout l'historique)
            let allMonthsSorted = [];
            let monthlyConsistency = null;
            if (currentMonthFilter === 'all') {
                const monthSet = new Set(expenses.filter(e => e.date).map(e => e.date.slice(0, 7)));
                allMonthsSorted = [...monthSet].sort();
                monthlyConsistency = {};
                allMonthsSorted.forEach(m => { monthlyConsistency[m] = {}; });
                expenses.filter(e => e.type === 'expense' && e.date).forEach(e => {
                    const m = e.date.slice(0, 7);
                    if (monthlyConsistency[m]) {
                        monthlyConsistency[m][e.largeCat] = (monthlyConsistency[m][e.largeCat] || 0) + e.amountCents;
                    }
                });
            }

            let htmlCards = '';
            for (const [largeCat, data] of Object.entries(appCategories)) {
                const amount = totalsLarge[largeCat];
                if (amount === 0 && currentMonthFilter !== 'all') continue;

                const pct = calcPercent(amount, totalDepensesCents);
                const pal = data.palette;
                const safeCat = largeCat.replace(/[^a-zA-Z0-9]/g, '_');
                const limitCents = currentMonthFilter !== 'all' ? getLimitForMonth(largeCat, currentMonthFilter) : 0;
                const escapedCat = largeCat.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

                let progressHtml = `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${pct} des dépenses</p>`;

                if (currentMonthFilter !== 'all') {
                    const isMonthOverride = !!(data.monthlyLimits && data.monthlyLimits[currentMonthFilter]);
                    const globalLimitCents = data.limitCents || 0;
                    const monthLimitCents = isMonthOverride ? data.monthlyLimits[currentMonthFilter] : 0;
                    const shortMonth = new Date(currentMonthFilter + '-01').toLocaleDateString('fr-FR', { month: 'short' });

                    // Barre de progression (si une limite effective existe)
                    let barHtml = `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2.5">${pct} des dépenses</p>`;
                    if (limitCents > 0) {
                        const limitPct = Math.min(100, (amount / limitCents) * 100);
                        let barColor = 'bg-emerald-500';
                        if (limitPct > 75) barColor = 'bg-amber-500';
                        if (limitPct > 90) barColor = 'bg-rose-500';
                        barHtml = `
                            <div class="flex justify-between items-center text-[10px] font-bold mt-2 mb-1">
                                <span class="${limitPct > 90 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}">${formatCurrency(amount / 100)}</span>
                                <span class="text-slate-400 dark:text-slate-500">/ ${formatCurrency(limitCents / 100)}</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden mb-2.5">
                                <div class="${barColor} h-1.5 rounded-full progress-bar-anim" style="width: ${limitPct}%"></div>
                            </div>`;
                    }

                    // Étiquette globale
                    const globalTag = globalLimitCents > 0
                        ? `<button onclick="startEditGlobalLimit('${escapedCat}')"
                                   class="flex items-center gap-1 pl-1.5 pr-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-full text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors" title="Limite globale · modifier">
                               <i data-lucide="repeat-2" class="w-3 h-3 shrink-0"></i>
                               <span>${formatCurrency(globalLimitCents / 100)}</span>
                               <i data-lucide="pencil" class="w-2.5 h-2.5 opacity-40"></i>
                           </button>`
                        : `<button onclick="startEditGlobalLimit('${escapedCat}')"
                                   class="flex items-center gap-1 pl-1.5 pr-2 py-1 bg-white dark:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700/60 rounded-full text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:border-emerald-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors" title="Ajouter une limite globale">
                               <i data-lucide="repeat-2" class="w-3 h-3 shrink-0"></i>
                               <span>Global</span>
                               <i data-lucide="plus" class="w-2.5 h-2.5"></i>
                           </button>`;

                    // Étiquette mensuelle
                    const monthTag = isMonthOverride
                        ? `<button onclick="startEditMonthLimit('${escapedCat}')"
                                   class="flex items-center gap-1 pl-1.5 pr-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/40 rounded-full text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors" title="${shortMonth} · modifier">
                               <i data-lucide="calendar" class="w-3 h-3 shrink-0"></i>
                               <span>${shortMonth} · ${formatCurrency(monthLimitCents / 100)}</span>
                               <i data-lucide="pencil" class="w-2.5 h-2.5 opacity-40"></i>
                           </button>`
                        : `<button onclick="startEditMonthLimit('${escapedCat}')"
                                   class="flex items-center gap-1 pl-1.5 pr-2 py-1 bg-white dark:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700/60 rounded-full text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:border-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" title="Ajouter une limite pour ${shortMonth}">
                               <i data-lucide="calendar" class="w-3 h-3 shrink-0"></i>
                               <span>${shortMonth}</span>
                               <i data-lucide="plus" class="w-2.5 h-2.5"></i>
                           </button>`;

                    progressHtml = `
                        <div id="cat-limit-area-${safeCat}">
                            ${barHtml}
                            <div class="flex gap-1.5 flex-wrap">${globalTag}${monthTag}</div>
                        </div>`;
                } else if (monthlyConsistency && allMonthsSorted.length > 0) {
                    // Vue globale : mini-barres mensuelles lisibles sur les 6 derniers mois
                    const recentMonths = allMonthsSorted.slice(-6);
                    const hasAnyLimit = recentMonths.some(m => getLimitForMonth(largeCat, m) > 0);
                    if (hasAnyLimit) {
                        const monthsWithLimit = recentMonths.filter(m => getLimitForMonth(largeCat, m) > 0);
                        const monthsOk = monthsWithLimit.filter(m => {
                            const lim = getLimitForMonth(largeCat, m);
                            return ((monthlyConsistency[m] || {})[largeCat] || 0) <= lim;
                        }).length;
                        const scoreRatio = monthsWithLimit.length > 0 ? monthsOk / monthsWithLimit.length : 0;
                        const scoreClass = scoreRatio === 1 ? 'text-emerald-500 dark:text-emerald-400' : scoreRatio >= 0.6 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400';
                        const scoreBg   = scoreRatio === 1 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40' : scoreRatio >= 0.6 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/40';
                        const scoreLabel = scoreRatio === 1 ? 'Toujours respectée' : `${monthsOk}/${monthsWithLimit.length} mois respectés`;

                        // Mini-barres : hauteur proportionnelle au % de limite utilisé (max 24px)
                        const bars = recentMonths.map(m => {
                            const lim = getLimitForMonth(largeCat, m);
                            const shortM = new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'short' });
                            if (lim === 0) {
                                return `<div class="flex flex-col items-center gap-0.5 flex-1">
                                    <div class="w-full rounded-sm bg-slate-100 dark:bg-slate-700/40" style="height:24px" title="${shortM} : pas de limite"></div>
                                    <span class="text-[8px] text-slate-300 dark:text-slate-600 capitalize leading-none">${shortM}</span>
                                </div>`;
                            }
                            const spent = (monthlyConsistency[m] || {})[largeCat] || 0;
                            const p = Math.min((spent / lim) * 100, 150); // cap à 150% visuellement
                            const barH = Math.max(3, Math.round((Math.min(p, 100) / 100) * 24));
                            let barColor, labelColor;
                            if (p > 100)      { barColor = 'bg-rose-400 dark:bg-rose-500';   labelColor = 'text-rose-500 dark:text-rose-400'; }
                            else if (p > 80)  { barColor = 'bg-amber-400 dark:bg-amber-500'; labelColor = 'text-amber-500 dark:text-amber-400'; }
                            else              { barColor = 'bg-emerald-400 dark:bg-emerald-500'; labelColor = 'text-emerald-600 dark:text-emerald-400'; }
                            const tooltip = `${shortM} : ${formatCurrency(spent/100)} / ${formatCurrency(lim/100)} (${Math.round(p)}%)`;
                            return `<div class="flex flex-col items-center gap-0.5 flex-1" title="${tooltip}">
                                <div class="w-full rounded-t-sm bg-slate-100 dark:bg-slate-700/40 flex items-end" style="height:24px">
                                    <div class="${barColor} w-full rounded-t-sm bar-anim" style="height:${barH}px"></div>
                                </div>
                                <span class="text-[8px] ${labelColor} capitalize leading-none font-medium">${shortM}</span>
                            </div>`;
                        }).join('');

                        progressHtml = `
                            <div class="mt-2.5">
                                <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">${pct} des dépenses</p>
                                <div class="flex items-end gap-1 mb-2">${bars}</div>
                                <div class="flex justify-center">
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreBg} ${scoreClass}">${scoreLabel}</span>
                                </div>
                            </div>`;
                    } else {
                        progressHtml = `<p class="text-xs text-slate-400 dark:text-slate-500 mt-2">${pct} des dépenses</p>`;
                    }
                }

                htmlCards += `
                    <div class="category-card-anim card-hover snap-start shrink-0 w-[80vw] sm:w-[220px] max-w-[280px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col transition-colors">
                        <div class="flex items-center gap-2 mb-2 ${pal.text}">
                            <i data-lucide="${pal.icon}" class="w-5 h-5"></i>
                            <h2 class="font-semibold truncate">${largeCat}</h2>
                        </div>
                        <div class="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-auto ${limitCents > 0 && currentMonthFilter !== 'all' ? 'mb-1' : ''}">${formatCurrency(amount / 100)}</div>
                        ${progressHtml}
                    </div>
                `;
            }
            document.getElementById('summary-cards').innerHTML = htmlCards || '<p class="text-slate-400 py-6 px-4 italic">Aucune dépense catégorisée pour cette période.</p>';

            renderDetailedBreakdownAndChart(totalsLarge, totalsSmall, totalDepensesCents);
            lucide.createIcons();
        }

        // --- ÉDITION INLINE DE LA LIMITE MENSUELLE ---
        function startEditMonthLimit(cat) {
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const area = document.getElementById('cat-limit-area-' + safeCat);
            if (!area) return;
            const currentLimitCents = getLimitForMonth(cat, currentMonthFilter);
            const currentVal = currentLimitCents > 0 ? (currentLimitCents / 100).toFixed(2) : '';
            const escapedCat = cat.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            area.innerHTML = `
                <div class="mt-3 flex items-center gap-1.5">
                    <div class="flex items-center gap-1 flex-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-lg px-2 py-1.5">
                        <input type="number" id="inline-limit-${safeCat}"
                               value="${currentVal}" placeholder="ex: 200" min="0" step="0.01"
                               class="w-full bg-transparent text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none text-right placeholder-slate-300 dark:placeholder-slate-600"
                               onkeydown="if(event.key==='Enter'){event.preventDefault();saveInlineLimit('${escapedCat}');}if(event.key==='Escape')cancelInlineLimit();">
                        <span class="text-xs text-slate-400 font-bold shrink-0">€</span>
                    </div>
                    <button onclick="saveInlineLimit('${escapedCat}')"
                            class="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-sm" title="Enregistrer">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="cancelInlineLimit()"
                            class="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 rounded-lg transition-colors" title="Annuler">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                    </button>
                </div>`;
            lucide.createIcons({ root: area });
            const input = document.getElementById('inline-limit-' + safeCat);
            if (input) { input.focus(); input.select(); }
        }

        function saveInlineLimit(cat) {
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const input = document.getElementById('inline-limit-' + safeCat);
            if (!input) return;
            const val = parseFloat(input.value.replace(',', '.')) || 0;
            setMonthlyLimit(cat, currentMonthFilter, Math.round(val * 100));
            render();
            showToast(val > 0 ? `Limite de ${formatCurrency(val)} définie pour ce mois.` : 'Limite mensuelle supprimée pour ce mois.');
        }

        function cancelInlineLimit() { render(); }

        // --- CHOIX MODE LIMITE (nouveau bouton "Fixer une limite") ---
        const _limitChoiceMode = {};

        function startEditLimitChoice(cat, defaultMode, initialVal) {
            defaultMode = defaultMode || 'month';
            _limitChoiceMode[cat] = defaultMode;
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const area = document.getElementById('cat-limit-area-' + safeCat);
            if (!area) return;
            const escapedCat = cat.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const val = initialVal !== undefined ? initialVal : '';
            const shortMonth = currentMonthFilter !== 'all'
                ? new Date(currentMonthFilter + '-01').toLocaleDateString('fr-FR', { month: 'short' })
                : 'mois';
            const monthActive = defaultMode === 'month';
            const monthBtnCls = monthActive
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700';
            const globalBtnCls = !monthActive
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700';
            const inputCls = monthActive
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/50'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50';
            const textCls = monthActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-emerald-600 dark:text-emerald-400';
            const saveCls = monthActive
                ? 'bg-indigo-500 hover:bg-indigo-600'
                : 'bg-emerald-500 hover:bg-emerald-600';
            area.innerHTML = `
                <div class="mt-3 flex flex-col gap-2">
                    <div class="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 gap-0.5">
                        <button id="lchoice-month-${safeCat}" onclick="switchLimitMode('${escapedCat}', 'month')"
                                class="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-[10px] ${monthBtnCls} transition-all">
                            <i data-lucide="calendar" class="w-3 h-3"></i> ${shortMonth}
                        </button>
                        <button id="lchoice-global-${safeCat}" onclick="switchLimitMode('${escapedCat}', 'global')"
                                class="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-[10px] ${globalBtnCls} transition-all">
                            <i data-lucide="calendar-range" class="w-3 h-3"></i> Tous
                        </button>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <div class="flex items-center gap-1 flex-1 ${inputCls} border rounded-lg px-2 py-1.5">
                            <input type="number" id="limit-choice-input-${safeCat}"
                                   value="${val}" placeholder="ex: 300" min="0" step="0.01"
                                   class="w-full bg-transparent text-sm font-bold ${textCls} focus:outline-none text-right placeholder-slate-300 dark:placeholder-slate-600"
                                   onkeydown="if(event.key==='Enter'){event.preventDefault();saveLimitChoice('${escapedCat}');}if(event.key==='Escape')cancelInlineLimit();">
                            <span class="text-xs text-slate-400 font-bold shrink-0">€</span>
                        </div>
                        <button onclick="saveLimitChoice('${escapedCat}')"
                                class="p-1.5 ${saveCls} text-white rounded-lg transition-colors shadow-sm" title="Enregistrer">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="cancelInlineLimit()"
                                class="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 rounded-lg transition-colors" title="Annuler">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>`;
            lucide.createIcons({ root: area });
            const input = document.getElementById('limit-choice-input-' + safeCat);
            if (input) { input.focus(); if (val) input.select(); }
        }

        function switchLimitMode(cat, mode) {
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const input = document.getElementById('limit-choice-input-' + safeCat);
            const currentVal = input ? input.value : '';
            startEditLimitChoice(cat, mode, currentVal);
        }

        function saveLimitChoice(cat) {
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const input = document.getElementById('limit-choice-input-' + safeCat);
            if (!input) return;
            const val = parseFloat(input.value.replace(',', '.')) || 0;
            const mode = _limitChoiceMode[cat] || 'month';
            if (mode === 'global') {
                if (!appCategories[cat]) return;
                appCategories[cat].limitCents = Math.round(val * 100);
                saveCategories();
                render();
                showToast(val > 0 ? `Limite globale de ${formatCurrency(val)} définie pour ${cat}.` : `Limite globale supprimée.`);
            } else {
                setMonthlyLimit(cat, currentMonthFilter, Math.round(val * 100));
                render();
                showToast(val > 0 ? `Limite de ${formatCurrency(val)} définie pour ce mois.` : 'Limite mensuelle supprimée.');
            }
        }

        // --- ÉDITION INLINE DE LA LIMITE GLOBALE ---
        function startEditGlobalLimit(cat) {
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const area = document.getElementById('cat-limit-area-' + safeCat);
            if (!area) return;
            const currentVal = appCategories[cat] ? (appCategories[cat].limitCents || 0) / 100 : 0;
            const escapedCat = cat.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            area.innerHTML = `
                <div class="mt-3 flex flex-col gap-1.5">
                    <p class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <i data-lucide="calendar-range" class="w-3 h-3"></i>
                        Limite pour tous les mois
                    </p>
                    <div class="flex items-center gap-1.5">
                        <div class="flex items-center gap-1 flex-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-lg px-2 py-1.5">
                            <input type="number" id="global-limit-${safeCat}"
                                   value="${currentVal > 0 ? currentVal.toFixed(2) : ''}" placeholder="ex: 500" min="0" step="0.01"
                                   class="w-full bg-transparent text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none text-right placeholder-slate-300 dark:placeholder-slate-600"
                                   onkeydown="if(event.key==='Enter'){event.preventDefault();saveGlobalLimit('${escapedCat}');}if(event.key==='Escape')cancelInlineLimit();">
                            <span class="text-xs text-slate-400 font-bold shrink-0">€</span>
                        </div>
                        <button onclick="saveGlobalLimit('${escapedCat}')"
                                class="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm" title="Enregistrer">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="cancelInlineLimit()"
                                class="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 rounded-lg transition-colors" title="Annuler">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>`;
            lucide.createIcons({ root: area });
            const input = document.getElementById('global-limit-' + safeCat);
            if (input) { input.focus(); input.select(); }
        }

        function saveGlobalLimit(cat) {
            const safeCat = cat.replace(/[^a-zA-Z0-9]/g, '_');
            const input = document.getElementById('global-limit-' + safeCat);
            if (!input || !appCategories[cat]) return;
            const val = parseFloat(input.value.replace(',', '.')) || 0;
            appCategories[cat].limitCents = Math.round(val * 100);
            saveCategories();
            render();
            showToast(val > 0 ? `Limite globale de ${formatCurrency(val)} définie pour ${cat}.` : `Limite globale supprimée pour ${cat}.`);
        }

        function renderInsights() {
            const container = document.getElementById('smart-insights-container');
            if (expenses.length === 0) {
                container.innerHTML = '';
                container.classList.add('hidden');
                return;
            }

            if (currentMonthFilter === 'all') {
                let totalDep = 0, totalRev = 0;
                const catTotals = {};
                const monthsSet = new Set();

                expenses.forEach(e => {
                    if (e.date) monthsSet.add(e.date.slice(0,7));
                    if (e.type === 'income') totalRev += e.amountCents;
                    else {
                        totalDep += e.amountCents;
                        catTotals[e.largeCat] = (catTotals[e.largeCat] || 0) + e.amountCents;
                    }
                });

                const numMonths = monthsSet.size || 1;
                const avgDep = totalDep / numMonths;
                const totalReste = totalRev - totalDep;

                let topCat = null;
                let topCatAmt = 0;
                for (const [cat, amt] of Object.entries(catTotals)) {
                    if (amt > topCatAmt) { topCatAmt = amt; topCat = cat; }
                }

                let html = `<div class="bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-900/20 dark:to-emerald-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <h3 class="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3"><i data-lucide="globe" class="w-4 h-4"></i> Bilan Global (${numMonths} mois cumulés)</h3>
                    <ul class="space-y-3 text-sm text-slate-700 dark:text-slate-300">`;

                let hasInsight = false;

                if (totalRev > 0 && totalDep === 0) {
                    html += `<li class="flex items-start gap-2.5 bg-emerald-100/50 dark:bg-emerald-900/20 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50"><i data-lucide="piggy-bank" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"></i> <div><span class="block font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">Nouveau départ !</span><span class="text-emerald-700 dark:text-emerald-400/90 text-xs sm:text-sm">Vous avez enregistré vos premiers revenus (<b>${formatCurrency(totalRev/100)}</b>). Commencez à ajouter vos dépenses pour voir vos analyses.</span></div></li>`;
                    hasInsight = true;
                }

                if (totalDep > 0) {
                    html += `<li class="flex items-start gap-2.5"><i data-lucide="calculator" class="w-4 h-4 text-indigo-500 mt-0.5 shrink-0"></i> <span>Vous dépensez en moyenne <b>${formatCurrency(avgDep/100)}</b> par mois.</span></li>`;
                    hasInsight = true;
                }

                if (totalReste > 0 && totalDep > 0) {
                    html += `<li class="flex items-start gap-2.5 bg-emerald-100/50 dark:bg-emerald-900/20 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50"><i data-lucide="piggy-bank" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"></i> <div><span class="block font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">Excellente gestion !</span><span class="text-emerald-700 dark:text-emerald-400/90 text-xs sm:text-sm">Vous avez réussi à conserver <b>${formatCurrency(totalReste/100)}</b> de plus que ce que vous avez dépensé.</span></div></li>`;
                    hasInsight = true;
                } else if (totalReste < 0 && totalDep > 0) {
                    html += `<li class="flex items-start gap-2.5 bg-rose-100/50 dark:bg-rose-900/20 p-2.5 rounded-xl border border-rose-200/50 dark:border-rose-800/50"><i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0"></i> <div><span class="block font-bold text-rose-800 dark:text-rose-300 mb-0.5">Vous puisez dans vos réserves</span><span class="text-rose-700 dark:text-rose-400/90 text-xs sm:text-sm">Vous avez dépensé <b>${formatCurrency(Math.abs(totalReste)/100)}</b> de plus que vos revenus totaux sur cette période.</span></div></li>`;
                    hasInsight = true;
                }

                if (topCat && totalDep > 0) {
                    html += `<li class="flex items-start gap-2.5"><i data-lucide="pie-chart" class="w-4 h-4 text-amber-500 mt-0.5 shrink-0"></i> <span>Votre poste de dépense principal est <b>${topCat}</b> (${formatCurrency(topCatAmt/100)} au total).</span></li>`;
                    hasInsight = true;
                }

                // Per-month limit insights
                const allHistMonths = [...monthsSet].sort();
                const monthlyCatTotals = {};
                expenses.forEach(e => {
                    if (e.type !== 'income' && e.date) {
                        const mo = e.date.slice(0,7);
                        if (!monthlyCatTotals[mo]) monthlyCatTotals[mo] = {};
                        monthlyCatTotals[mo][e.largeCat] = (monthlyCatTotals[mo][e.largeCat] || 0) + e.amountCents;
                    }
                });

                for (const [cat] of Object.entries(appCategories)) {
                    const monthsWithLimit = allHistMonths.filter(m => getLimitForMonth(cat, m) > 0);
                    if (monthsWithLimit.length === 0) continue;
                    const monthsExceeded = monthsWithLimit.filter(m => {
                        const lim = getLimitForMonth(cat, m);
                        const spent = (monthlyCatTotals[m] || {})[cat] || 0;
                        return spent > lim;
                    });
                    if (monthsExceeded.length > 0) {
                        const totalExcess = monthsExceeded.reduce((sum, m) => {
                            const lim = getLimitForMonth(cat, m);
                            const spent = (monthlyCatTotals[m] || {})[cat] || 0;
                            return sum + (spent - lim);
                        }, 0);
                        const avgExcess = totalExcess / monthsExceeded.length;
                        html += `<li class="flex items-start gap-2.5"><i data-lucide="alert-triangle" class="w-4 h-4 text-rose-500 mt-0.5 shrink-0"></i> <div><span class="font-bold text-slate-700 dark:text-slate-200">${cat}</span> <span class="text-slate-500 dark:text-slate-400">: limite dépassée</span> <span class="text-rose-600 dark:text-rose-400 font-bold">${monthsExceeded.length} fois sur ${monthsWithLimit.length}</span> <span class="text-slate-400">mois suivis — dépassement moyen de</span> <span class="text-rose-600 dark:text-rose-400 font-bold">${formatCurrency(avgExcess/100)}</span><span class="text-slate-400">.</span></div></li>`;
                        hasInsight = true;
                    }
                }

                html += `</ul></div>`;
                
                if (hasInsight) {
                    container.innerHTML = html;
                    container.classList.remove('hidden');
                    lucide.createIcons();
                } else {
                    container.innerHTML = '';
                    container.classList.add('hidden');
                }
                return;
            }

            const currentData = getFilteredData(currentMonthFilter);
            let currDep = 0, currRev = 0;
            const currCatTotals = {};
            currentData.forEach(e => {
                if (e.type === 'income') currRev += e.amountCents;
                else {
                    currDep += e.amountCents;
                    currCatTotals[e.largeCat] = (currCatTotals[e.largeCat] || 0) + e.amountCents;
                }
            });

            const [y, m] = currentMonthFilter.split('-');
            let prevDate = new Date(y, parseInt(m) - 2);
            const prevMonthStr = prevDate.getFullYear() + '-' + String(prevDate.getMonth() + 1).padStart(2, '0');
            const prevData = getFilteredData(prevMonthStr);
            
            let prevDep = 0;
            prevData.forEach(e => { if(e.type !== 'income') prevDep += e.amountCents; });

            let topCat = null;
            let topCatAmt = 0;
            for (const [cat, amt] of Object.entries(currCatTotals)) {
                if (amt > topCatAmt) { topCatAmt = amt; topCat = cat; }
            }

            let html = `<div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 sm:p-5 shadow-sm">
                <h3 class="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3"><i data-lucide="sparkles" class="w-4 h-4"></i> Analyses intelligentes du mois</h3>
                <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300">`;
            
            let hasInsight = false;

            const reste = currRev - currDep;
            if (reste > 0 && currDep > 0) {
                html += `<li class="flex items-start gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"></i> <span>Vous avez un solde positif de <b>${formatCurrency(reste/100)}</b>. Beau travail !</span></li>`;
                hasInsight = true;
            } else if (currDep > 0 && currRev > 0 && reste < 0) {
                html += `<li class="flex items-start gap-2"><i data-lucide="alert-triangle" class="w-4 h-4 text-rose-500 mt-0.5 shrink-0"></i> <span>Vos dépenses dépassent vos revenus. Attention à votre budget.</span></li>`;
                hasInsight = true;
            } else if (currRev > 0 && currDep === 0) {
                html += `<li class="flex items-start gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"></i> <span>Un mois parfait pour l'instant ! <b>${formatCurrency(currRev/100)}</b> de revenus et aucune dépense.</span></li>`;
                hasInsight = true;
            }

            if (prevDep > 0) {
                const diff = currDep - prevDep;
                const pct = Math.abs((diff / prevDep) * 100).toFixed(0);
                if (diff < 0) {
                    html += `<li class="flex items-start gap-2"><i data-lucide="trending-down" class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"></i> <span>Vos dépenses ont baissé de <b>${pct}%</b> par rapport au mois dernier.</span></li>`;
                    hasInsight = true;
                } else if (diff > 0) {
                    html += `<li class="flex items-start gap-2"><i data-lucide="trending-up" class="w-4 h-4 text-amber-500 mt-0.5 shrink-0"></i> <span>Vos dépenses ont augmenté de <b>${pct}%</b> par rapport au mois dernier.</span></li>`;
                    hasInsight = true;
                }
            }

            if (topCat && currDep > 0) {
                const topPct = ((topCatAmt / currDep) * 100).toFixed(0);
                html += `<li class="flex items-start gap-2"><i data-lucide="pie-chart" class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0"></i> <span><b>${topCat}</b> représente ${topPct}% de vos dépenses ce mois-ci.</span></li>`;
                hasInsight = true;
            }

            for (const [cat, amt] of Object.entries(currCatTotals)) {
                const limit = getLimitForMonth(cat, currentMonthFilter);
                if (limit > 0 && amt > limit) {
                    html += `<li class="flex items-start gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-rose-500 mt-0.5 shrink-0"></i> <div><span class="font-bold text-slate-700 dark:text-slate-200">${cat}</span> <span class="text-slate-500 dark:text-slate-400">a dépassé sa limite ce mois-ci.</span> <span class="text-rose-600 dark:text-rose-400 font-bold">${formatCurrency(amt/100)} dépensés</span> <span class="text-slate-400">sur</span> <span class="font-semibold">${formatCurrency(limit/100)} prévus</span> <span class="text-slate-400">— soit</span> <span class="text-rose-600 dark:text-rose-400 font-bold">+${formatCurrency((amt - limit)/100)}</span> <span class="text-slate-400">de trop.</span></div></li>`;
                    hasInsight = true;
                } else if (limit > 0 && amt >= limit * 0.85) {
                    html += `<li class="flex items-start gap-2"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500 mt-0.5 shrink-0"></i> <div><span class="font-bold text-slate-700 dark:text-slate-200">${cat}</span> <span class="text-slate-500 dark:text-slate-400">approche de sa limite :</span> <span class="font-semibold">${formatCurrency(amt/100)}</span> <span class="text-slate-400">dépensés sur</span> <span class="font-semibold">${formatCurrency(limit/100)}</span> — <span class="text-amber-600 dark:text-amber-400 font-bold">il ne reste que ${formatCurrency((limit - amt)/100)}.</span></div></li>`;
                    hasInsight = true;
                }
            }

            html += `</ul></div>`;
            
            if (hasInsight) {
                container.innerHTML = html;
                container.classList.remove('hidden');
                lucide.createIcons();
            } else {
                container.innerHTML = '';
                container.classList.add('hidden');
            }
        }

        function renderDetailedBreakdownAndChart(totalsLarge, totalsSmall, totalDepensesCents) {
            const breakdownContainer = document.getElementById('detailed-breakdown');
            const expandedBreakdownContainer = document.getElementById('expanded-detailed-breakdown');
            
            breakdownContainer.innerHTML = '';
            if (expandedBreakdownContainer) expandedBreakdownContainer.innerHTML = '';
            
            if(totalDepensesCents === 0) {
                const emptyMsg = '<p class="text-sm text-slate-400 dark:text-slate-500 italic">Ajoutez des dépenses pour voir la répartition.</p>';
                breakdownContainer.innerHTML = emptyMsg;
                if (expandedBreakdownContainer) expandedBreakdownContainer.innerHTML = emptyMsg;
                if(chartInstance) chartInstance.destroy();
                return;
            }

            const chartLabels = []; const chartData = []; const chartColors = [];
            for (const [largeCat, amount] of Object.entries(totalsLarge)) {
                if (amount > 0) {
                    chartLabels.push(largeCat); chartData.push(amount / 100);
                    let hex = '#94a3b8'; 
                    const catPalette = appCategories[largeCat].palette;
                    if (catPalette.hex) hex = catPalette.hex;
                    else {
                        const match = availablePalettes.find(p => p.id === catPalette.id);
                        if (match) hex = match.hex;
                    }
                    chartColors.push(hex);
                }
            }

            const ctx = document.getElementById('budgetChart').getContext('2d');
            if(chartInstance) chartInstance.destroy();
            
            const isDark = document.documentElement.classList.contains('dark');
            const borderColor = isDark ? '#1e293b' : '#ffffff';

            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartLabels,
                    datasets: [{ data: chartData, backgroundColor: chartColors, borderWidth: 2, borderColor: borderColor, hoverOffset: 4 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { callbacks: { label: function(context) { return formatCurrency(context.raw); } } } },
                    cutout: '65%'
                }
            });

            const sortedSmallCats = Object.entries(totalsSmall).sort((a, b) => b[1] - a[1]);
            sortedSmallCats.forEach(([compoundKey, amountCents]) => {
                const [largeCat, cat] = compoundKey.split('__||__');
                const percent = ((amountCents / totalDepensesCents) * 100).toFixed(1);
                const barColor = appCategories[largeCat] ? appCategories[largeCat].palette.bar : "bg-slate-400";

                const div = document.createElement('div'); div.className = "mb-3";
                div.innerHTML = `
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium text-slate-700 dark:text-slate-300">${escapeHtml(cat)}</span>
                        <span class="text-slate-500 dark:text-slate-400">${formatCurrency(amountCents / 100)} (${percent}%)</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden"><div class="${barColor} h-2 rounded-full" style="width: ${percent}%"></div></div>
                `;
                
                breakdownContainer.appendChild(div);
                if (expandedBreakdownContainer) {
                    expandedBreakdownContainer.appendChild(div.cloneNode(true));
                }
            });
        }
        
        function openExpandChartModal() {
            if(!chartInstance) return showToast("Aucune donnée à afficher pour le moment.", "error");
            document.getElementById('expand-chart-modal').classList.remove('hidden');
            const ctx = document.getElementById('expandedBudgetChart').getContext('2d');
            if(expandedChartInstance) expandedChartInstance.destroy();
            
            expandedChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: chartInstance.data,
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom', labels: { font: { size: 13 }, padding: 15 } }, 
                        tooltip: { callbacks: { label: function(context) { return formatCurrency(context.raw); } } } 
                    },
                    cutout: '50%'
                }
            });
            updateChartTheme(); 
        }
        function closeExpandChartModal() { document.getElementById('expand-chart-modal').classList.add('hidden'); }

        function renderList() {
            const expenseList = document.getElementById('expense-list');
            expenseList.innerHTML = '';
            
            let filteredData = getFilteredData();
            
            filteredData = filteredData.filter(item => {
                if (currentSearchQuery && !item.desc.toLowerCase().includes(currentSearchQuery)) {
                    return false;
                }
                if (currentCategoryFilter !== 'all') {
                    if (currentCategoryFilter.startsWith('cat_')) {
                        const targetCat = currentCategoryFilter.replace('cat_', '');
                        if (item.type === 'income' || item.largeCat !== targetCat) return false;
                    }
                }
                return true;
            });
            
            if (filteredData.length === 0) {
                const emptyState = document.createElement('li');
                emptyState.className = "text-center text-slate-400 py-8 italic";
                emptyState.id = "empty-state";
                emptyState.textContent = "Aucune donnée pour cette période/recherche.";
                expenseList.appendChild(emptyState);
                return;
            }

            filteredData.sort((a, b) => {
                if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
                if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
                if (currentSort === 'amount-desc') return b.amountCents - a.amountCents;
                if (currentSort === 'amount-asc') return a.amountCents - b.amountCents;
                if (currentSort === 'category') {
                    const catA = a.type === 'income' ? 'AAA' : a.largeCat + a.smallCat; 
                    const catB = b.type === 'income' ? 'AAA' : b.largeCat + b.smallCat;
                    return catA.localeCompare(catB);
                }
                return 0;
            });

            filteredData.forEach((item, idx) => {
                const li = document.createElement('li');
                const delay = Math.min(idx * 30, 300); // max 300ms stagger
                const borderClass = "border-slate-100 dark:border-slate-700/50";
                li.className = `list-item-anim flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-white dark:bg-slate-800 border ${borderClass} rounded-xl hover:shadow-md dark:hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)] transition-shadow group gap-3 sm:gap-0 mt-3`;
                li.style.animationDelay = `${delay}ms`;
                
                const amountFormatted = formatCurrency(item.amountCents / 100);
                const dateObj = new Date(item.date);
                const monthStr = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                const dateFormatted = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
                
                if (item.type === 'income') {
                    li.innerHTML = `
                        <div class="flex items-start gap-3 w-full sm:w-auto overflow-visible">
                            <div class="flex-shrink-0 mt-0.5">
                                <span class="inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold border bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">REVENU</span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate">${escapeHtml(item.desc)}</p>
                                <div class="flex items-center">
                                    <p class="text-xs text-slate-400 truncate">${dateFormatted}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-1 sm:pl-0">
                            <span class="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 mr-2">+ ${amountFormatted}</span>
                            <div class="flex opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity gap-1">
                                <button onclick="editItem('${item.id}')" class="text-slate-400 hover:text-amber-500 p-1.5 sm:p-2 rounded-lg bg-amber-50 dark:bg-slate-700/50 sm:bg-transparent dark:sm:bg-transparent hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors" title="Modifier">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                <button onclick="confirmDelete('${item.id}')" class="text-slate-400 hover:text-red-500 p-1.5 sm:p-2 rounded-lg bg-red-50 dark:bg-slate-700/50 sm:bg-transparent dark:sm:bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Supprimer">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    const pal = appCategories[item.largeCat] ? appCategories[item.largeCat].palette : null;
                    const colorClass = pal ? `${pal.bgLight} ${pal.textDark} ${pal.border}` : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
                    
                    li.innerHTML = `
                        <div class="flex items-start gap-3 w-full sm:w-auto overflow-visible">
                            <div class="flex-shrink-0 mt-0.5">
                                <span class="inline-block px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium border ${colorClass} truncate max-w-[80px] sm:max-w-none">
                                    ${escapeHtml(item.smallCat)}
                                </span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1.5">
                                    <p class="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate">${escapeHtml(item.desc)}</p>
                                    ${item.isFixed ? '<span class="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/40 px-1 py-0.5 rounded-full"><i data-lucide="pin" class="w-2.5 h-2.5"></i>Fixe</span>' : ''}
                                </div>
                                <div class="flex items-center">
                                    <p class="text-xs text-slate-400 truncate">${dateFormatted} • ${escapeHtml(item.largeCat)}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-1 sm:pl-0">
                            <span class="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 mr-2">- ${amountFormatted}</span>
                            <div class="flex opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity gap-1">
                                <button onclick="editItem('${item.id}')" class="text-slate-400 hover:text-amber-500 p-1.5 sm:p-2 rounded-lg bg-amber-50 dark:bg-slate-700/50 sm:bg-transparent dark:sm:bg-transparent hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors" title="Modifier">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                <button onclick="confirmDelete('${item.id}')" class="text-slate-400 hover:text-red-500 p-1.5 sm:p-2 rounded-lg bg-red-50 dark:bg-slate-700/50 sm:bg-transparent dark:sm:bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Supprimer">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }
                expenseList.appendChild(li);
            });

            lucide.createIcons();
        }

        document.getElementById('expense-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const desc = document.getElementById('desc-input').value;
            const amountCents = Math.round(parseFloat(document.getElementById('amount-input').value) * 100);
            
            const year = document.getElementById('year-select').value;
            const month = document.getElementById('month-select').value;
            const dateVal = `${year}-${month}-01`;
            
            let smallCat = '', largeCat = '';
            if (formType === 'expense') {
                const selectCat = document.getElementById('category-input');
                const selectedOption = selectCat.options[selectCat.selectedIndex];
                smallCat = selectedOption.value; largeCat = selectedOption.dataset.largeCategory;
            }

            const newItem = { id: editingId ? editingId : Date.now().toString(), type: formType, desc: desc, amountCents: amountCents, date: dateVal };
            if (formType === 'expense') { newItem.smallCat = smallCat; newItem.largeCat = largeCat; newItem.isFixed = isFixedExpense; }

            if (editingId) {
                const index = expenses.findIndex(e => e.id === editingId);
                if (index !== -1) expenses[index] = newItem;
                cancelEdit(); 
            } else {
                expenses.push(newItem);
                resetFixedToggle();
                document.getElementById('desc-input').value = '';
                document.getElementById('amount-input').value = '';
                
                const newMonthStr = dateVal.slice(0, 7);
                if (currentMonthFilter !== 'all' && currentMonthFilter !== newMonthStr) {
                    currentMonthFilter = newMonthStr;
                    document.getElementById('month-filter').value = currentMonthFilter;
                }
            }
            saveData(); updateMonthDropdown(); render(); updateCompareSelects();
        });

        function editItem(id) {
            const item = expenses.find(e => e.id === id);
            if (!item) return;
            
            editingId = id; setFormType(item.type || 'expense');
            
            const [year, month] = item.date.split('-');
            document.getElementById('year-select').value = year;
            document.getElementById('month-select').value = month;
            
            document.getElementById('desc-input').value = item.desc;
            document.getElementById('amount-input').value = (item.amountCents / 100).toFixed(2);
            if (item.type !== 'income') document.getElementById('category-input').value = item.smallCat;
            resetFixedToggle();
            if (item.isFixed) toggleFixedExpense();
            
            document.getElementById('form-title').innerHTML = '<i data-lucide="edit-2" class="w-5 h-5 text-amber-500"></i> Modifier la ligne';
            document.getElementById('submit-text').textContent = "Mettre à jour";
            
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.classList.replace('bg-indigo-600', 'bg-amber-500'); submitBtn.classList.replace('hover:bg-indigo-700', 'hover:bg-amber-600'); submitBtn.classList.replace('focus:ring-indigo-200', 'focus:ring-amber-200');
            document.getElementById('cancel-edit-btn').classList.remove('hidden');
            
            const formContainer = document.getElementById('form-container');
            formContainer.classList.remove('border-slate-200', 'shadow-sm', 'dark:border-slate-700');
            formContainer.classList.add('border-amber-500', 'ring-4', 'ring-amber-500/20', 'shadow-lg', 'shadow-amber-500/20', 'dark:border-amber-500');
            
            lucide.createIcons(); window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function cancelEdit() {
            editingId = null;
            resetFixedToggle();
            document.getElementById('desc-input').value = '';
            document.getElementById('amount-input').value = '';

            setFormType('expense');
            
            document.getElementById('form-title').innerHTML = '<i data-lucide="plus-circle" class="w-5 h-5 text-indigo-500"></i> Ajouter une ligne';
            document.getElementById('submit-text').textContent = "Enregistrer";
            
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.classList.replace('bg-amber-500', 'bg-indigo-600'); submitBtn.classList.replace('hover:bg-amber-600', 'hover:bg-indigo-700'); submitBtn.classList.replace('focus:ring-amber-200', 'focus:ring-indigo-200');
            document.getElementById('cancel-edit-btn').classList.add('hidden');
            
            const formContainer = document.getElementById('form-container');
            formContainer.classList.remove('border-amber-500', 'ring-4', 'ring-amber-500/20', 'shadow-lg', 'shadow-amber-500/20', 'dark:border-amber-500');
            formContainer.classList.add('border-slate-200', 'shadow-sm', 'dark:border-slate-700');
            
            lucide.createIcons();
        }

        function confirmDelete(id) {
            if (editingId === id) return showToast("Terminez ou annulez la modification en cours avant de supprimer.", "error");
            itemToDeleteId = id;
            document.getElementById('delete-modal').classList.remove('hidden');
        }

        function closeDeleteModal() {
            itemToDeleteId = null;
            document.getElementById('delete-modal').classList.add('hidden');
        }

        function executeDelete() {
            if (!itemToDeleteId) return;
            expenses = expenses.filter(e => e.id !== itemToDeleteId);
            saveData(); updateMonthDropdown(); render(); updateCompareSelects();
            closeDeleteModal();
            showToast("Opération supprimée.");
        }

        function promptResetData() {
            document.getElementById('reset-modal').classList.remove('hidden');
        }

        function closeResetModal() {
            document.getElementById('reset-modal').classList.add('hidden');
        }

        function executeReset() {
            closeResetModal();
            showLoader("Suppression...", "Effacement de vos données");
            setTimeout(() => {
                expenses = []; appCategories = {}; localStorage.removeItem('budgetData'); localStorage.removeItem('budgetCategories');
                loadData(); populateCategoryDropdown(); updateHistoryCategoryFilter(); updateMonthDropdown(); render(); updateCompareSelects();
                hideLoader();
                showToast("Toutes vos données ont été effacées.", "success");
            }, 800);
        }

        function openCategoryModal() { document.getElementById('category-modal').classList.remove('hidden'); updateModalSelect(); renderEditCategories(); }
        function closeCategoryModal() { document.getElementById('category-modal').classList.add('hidden'); }
        function openHelpModal() { document.getElementById('help-modal').classList.remove('hidden'); lucide.createIcons(); }
        function closeHelpModal() { document.getElementById('help-modal').classList.add('hidden'); }
        function openPatchNotesModal() { document.getElementById('patch-notes-modal').classList.remove('hidden'); lucide.createIcons(); }
        function closePatchNotesModal() { document.getElementById('patch-notes-modal').classList.add('hidden'); }
        
        function openCompareModal() {
            document.getElementById('compare-modal').classList.remove('hidden');
            updateCompareSelects();
            renderComparison();
        }
        function closeCompareModal() { document.getElementById('compare-modal').classList.add('hidden'); }

        function updateCompareSelects() {
            const months = Array.from(new Set(expenses.filter(e=>e.date).map(e => e.date.slice(0, 7)))).sort().reverse();
            const selectA = document.getElementById('compare-month-a');
            const selectB = document.getElementById('compare-month-b');
            
            let optionsHtml = '';
            months.forEach(m => {
                const [year, month] = m.split('-');
                const name = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                optionsHtml += `<option value="${m}">${name.charAt(0).toUpperCase() + name.slice(1)}</option>`;
            });

            if (months.length === 0) {
                optionsHtml = `<option value="">Pas assez de données</option>`;
            }

            selectA.innerHTML = optionsHtml;
            selectB.innerHTML = optionsHtml;

            if (months.length > 1) {
                selectA.value = months[1];
                selectB.value = months[0];
            } else if (months.length === 1) {
                selectA.value = months[0];
                selectB.value = months[0];
            }
        }
        
        function setCompareChartType(type) {
            currentCompareChartType = type;
            
            const btnBar = document.getElementById('btn-chart-bar');
            const btnRadar = document.getElementById('btn-chart-radar');
            const btnLine = document.getElementById('btn-chart-line');
            
            [btnBar, btnRadar, btnLine].forEach(btn => {
                if(btn) {
                    btn.classList.remove('bg-indigo-100', 'text-indigo-700', 'shadow-sm', 'dark:bg-indigo-500/20', 'dark:text-indigo-400');
                    btn.classList.add('text-slate-500', 'hover:bg-slate-100', 'dark:text-slate-400', 'dark:hover:bg-slate-700/50');
                }
            });
            
            const activeBtn = document.getElementById('btn-chart-' + type);
            if(activeBtn) {
                activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-100', 'dark:text-slate-400', 'dark:hover:bg-slate-700/50');
                activeBtn.classList.add('bg-indigo-100', 'text-indigo-700', 'shadow-sm', 'dark:bg-indigo-500/20', 'dark:text-indigo-400');
            }
            
            renderComparison(true);
        }

        function renderComparison(isUpdate = false) {
            let monthA = document.getElementById('compare-month-a').value;
            let monthB = document.getElementById('compare-month-b').value;
            const resultsDiv = document.getElementById('compare-results');
            
            if (!monthA || !monthB) {
                resultsDiv.innerHTML = `<div class="text-center py-10 text-slate-500 dark:text-slate-400 italic">Veuillez ajouter ou importer des opérations pour comparer des mois.</div>`;
                return;
            }

            if (monthA > monthB) {
                const temp = monthA;
                monthA = monthB;
                monthB = temp;
                document.getElementById('compare-month-a').value = monthA;
                document.getElementById('compare-month-b').value = monthB;
                
                if (isUpdate) {
                    const revA = document.getElementById('custom-rev-a').value;
                    const revB = document.getElementById('custom-rev-b').value;
                    document.getElementById('custom-rev-a').value = revB;
                    document.getElementById('custom-rev-b').value = revA;
                }
            }

            const selectA = document.getElementById('compare-month-a');
            const nameA = selectA.options[selectA.selectedIndex].text;
            const selectB = document.getElementById('compare-month-b');
            const nameB = selectB.options[selectB.selectedIndex].text;

            const dataA = getFilteredData(monthA);
            const dataB = getFilteredData(monthB);

            let totals = { A: { rev: 0, dep: 0 }, B: { rev: 0, dep: 0 } };
            let catsA = {}; let catsB = {};
            
            dataA.forEach(item => {
                if (item.type === 'income') totals.A.rev += item.amountCents;
                else {
                    totals.A.dep += item.amountCents;
                    const key = item.largeCat + '__||__' + item.smallCat;
                    catsA[key] = (catsA[key] || 0) + item.amountCents;
                }
            });

            dataB.forEach(item => {
                if (item.type === 'income') totals.B.rev += item.amountCents;
                else {
                    totals.B.dep += item.amountCents;
                    const key = item.largeCat + '__||__' + item.smallCat;
                    catsB[key] = (catsB[key] || 0) + item.amountCents;
                }
            });

            const inputRevA = document.getElementById('custom-rev-a');
            const inputRevB = document.getElementById('custom-rev-b');
            
            if (!isUpdate) {
                inputRevA.value = (totals.A.rev / 100).toFixed(2);
                inputRevB.value = (totals.B.rev / 100).toFixed(2);
            } else {
                totals.A.rev = Math.round(parseFloat(inputRevA.value || 0) * 100);
                totals.B.rev = Math.round(parseFloat(inputRevB.value || 0) * 100);
            }

            const resteA = totals.A.rev - totals.A.dep;
            const resteB = totals.B.rev - totals.B.dep;

            const renderDiff = (valA, valB, type = 'expense') => {
                const diff = valB - valA; 
                if (diff === 0) return `<span class="text-slate-400 dark:text-slate-500 font-medium text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">= Identique</span>`;
                
                const isPositive = diff > 0;
                const absDiffFormated = formatCurrency(Math.abs(diff)/100);
                let colorClass = "";
                let wording = isPositive ? "Hausse" : "Baisse";
                let sign = isPositive ? '+' : '-';
                let icon = isPositive ? 'trending-up' : 'trending-down';

                if (type === 'expense') {
                    colorClass = isPositive ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800/50" : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50";
                } else {
                    colorClass = isPositive ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50" : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800/50";
                }
                
                return `<span class="${colorClass} font-bold text-xs px-2 py-1 rounded-md shadow-sm border inline-flex items-center gap-1 flex-wrap"><i data-lucide="${icon}" class="w-3.5 h-3.5 shrink-0"></i><span class="shrink-0">${sign}${absDiffFormated}</span><span class="text-[10px] uppercase tracking-wider font-bold opacity-70">(${wording})</span></span>`;
            };

            const chartLabels = [];
            const dataA_chart = [];
            const dataB_chart = [];

            const largeCatTotalsA = {};
            const largeCatTotalsB = {};

            Object.keys(catsA).forEach(k => {
                const large = k.split('__||__')[0];
                largeCatTotalsA[large] = (largeCatTotalsA[large] || 0) + catsA[k];
            });
            Object.keys(catsB).forEach(k => {
                const large = k.split('__||__')[0];
                largeCatTotalsB[large] = (largeCatTotalsB[large] || 0) + catsB[k];
            });

            const allLargeCats = new Set([...Object.keys(largeCatTotalsA), ...Object.keys(largeCatTotalsB)]);
            allLargeCats.forEach(large => {
                chartLabels.push(large);
                dataA_chart.push((largeCatTotalsA[large] || 0) / 100);
                dataB_chart.push((largeCatTotalsB[large] || 0) / 100);
            });

            let html = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-4 shadow-sm text-center flex flex-col justify-center">
                        <h4 class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">Revenus (Simulés)</h4>
                        <div class="flex justify-between items-center text-sm mb-1"><span class="text-slate-500 dark:text-slate-400">${nameA}:</span> <span class="font-semibold dark:text-slate-200">${formatCurrency(totals.A.rev/100)}</span></div>
                        <div class="flex justify-between items-center text-sm border-b border-emerald-200/50 dark:border-emerald-800/30 pb-2 mb-2"><span class="text-slate-500 dark:text-slate-400">${nameB}:</span> <span class="font-semibold dark:text-slate-200">${formatCurrency(totals.B.rev/100)}</span></div>
                        <div class="flex flex-col items-start gap-1 mt-auto pt-1 border-t border-emerald-200/50 dark:border-emerald-800/30"><span class="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider">Évolution</span>${renderDiff(totals.A.rev, totals.B.rev, 'income')}</div>
                    </div>

                    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                        <h4 class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">Dépenses Totales</h4>
                        <div class="flex justify-between items-center text-sm mb-1"><span class="text-slate-500 dark:text-slate-400">${nameA}:</span> <span class="font-semibold dark:text-slate-200">${formatCurrency(totals.A.dep/100)}</span></div>
                        <div class="flex justify-between items-center text-sm border-b border-blue-200/50 dark:border-blue-800/30 pb-2 mb-2"><span class="text-slate-500 dark:text-slate-400">${nameB}:</span> <span class="font-semibold dark:text-slate-200">${formatCurrency(totals.B.dep/100)}</span></div>
                        <div class="flex flex-col items-start gap-1 mt-auto pt-1 border-t border-blue-200/50 dark:border-blue-800/30"><span class="text-[10px] text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wider">Évolution</span>${renderDiff(totals.A.dep, totals.B.dep, 'expense')}</div>
                    </div>

                    <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div class="absolute -right-4 -bottom-4 opacity-5"><i data-lucide="piggy-bank" class="w-24 h-24"></i></div>
                        <h4 class="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-3 relative z-10">Reste à vivre</h4>
                        <div class="flex justify-between items-center text-sm mb-1 relative z-10"><span class="text-slate-500 dark:text-slate-400">${nameA}:</span> <span class="font-semibold ${resteA >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${formatCurrency(resteA/100)}</span></div>
                        <div class="flex justify-between items-center text-sm border-b border-indigo-200/50 dark:border-indigo-800/30 pb-2 mb-2 relative z-10"><span class="text-slate-500 dark:text-slate-400">${nameB}:</span> <span class="font-semibold ${resteB >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${formatCurrency(resteB/100)}</span></div>
                        <div class="flex flex-col items-start gap-1 mt-auto pt-1 border-t border-indigo-200/50 dark:border-indigo-800/30 relative z-10"><span class="text-[10px] text-indigo-600 dark:text-indigo-500 font-bold uppercase tracking-wider">Évolution</span>${renderDiff(resteA, resteB, 'remaining')}</div>
                    </div>
                </div>
            `;

            const allKeys = new Set([...Object.keys(catsA), ...Object.keys(catsB)]);
            const catDiffs = [];
            
            allKeys.forEach(k => {
                const valA = catsA[k] || 0;
                const valB = catsB[k] || 0;
                const diff = valB - valA;
                if (diff !== 0) catDiffs.push({ key: k, valA: valA, valB: valB, diff: diff, absDiff: Math.abs(diff) });
            });

            catDiffs.sort((a, b) => b.absDiff - a.absDiff);

            if (catDiffs.length > 0) {
                html += `
                    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
                        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2"><i data-lucide="zap" class="w-4 h-4 text-amber-500"></i> Ce qui explique la différence (Top variations)</h4>
                        <div class="max-h-96 overflow-y-auto pr-2 space-y-2 no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                `;
                catDiffs.forEach((diffObj, index) => {
                    const [large, small] = diffObj.key.split('__||__');
                    const isIncrease = diffObj.diff > 0;
                    const diffColor = isIncrease ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-800/30" : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800/30";
                    const diffIcon = isIncrease ? "trending-up" : "trending-down";
                    const diffSign = isIncrease ? "+" : "-"; 
                    
                    const itemsA = dataA.filter(item => item.type === 'expense' && item.largeCat === large && item.smallCat === small);
                    const itemsB = dataB.filter(item => item.type === 'expense' && item.largeCat === large && item.smallCat === small);

                    const listAHtml = itemsA.length > 0 
                        ? itemsA.map(item => `<li class="flex justify-between text-xs items-center border-b border-slate-100/50 dark:border-slate-700/50 last:border-0 py-1"><span class="text-slate-600 dark:text-slate-400 truncate pr-2" title="${escapeHtml(item.desc)}">${escapeHtml(item.desc)}</span><span class="font-semibold text-slate-700 dark:text-slate-300 shrink-0">${formatCurrency(item.amountCents/100)}</span></li>`).join('') 
                        : `<li class="text-xs text-slate-400 dark:text-slate-500 italic py-1">Aucune opération</li>`;
                        
                    const listBHtml = itemsB.length > 0 
                        ? itemsB.map(item => `<li class="flex justify-between text-xs items-center border-b border-slate-100/50 dark:border-slate-700/50 last:border-0 py-1"><span class="text-slate-600 dark:text-slate-400 truncate pr-2" title="${escapeHtml(item.desc)}">${escapeHtml(item.desc)}</span><span class="font-semibold text-slate-700 dark:text-slate-300 shrink-0">${formatCurrency(item.amountCents/100)}</span></li>`).join('') 
                        : `<li class="text-xs text-slate-400 dark:text-slate-500 italic py-1">Aucune opération</li>`;
                    
                    html += `
                        <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow transition-shadow overflow-hidden">
                            <div onclick="document.getElementById('details-${index}').classList.toggle('hidden'); document.getElementById('chevron-${index}').classList.toggle('rotate-180');" class="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3 cursor-pointer group">
                                <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <i data-lucide="chevron-down" id="chevron-${index}" class="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-transform shrink-0"></i>
                                    <div class="flex flex-col min-w-0 pr-2 flex-1">
                                        <span class="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">${escapeHtml(small)}</span>
                                        <span class="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold truncate">${escapeHtml(large)}</span>
                                    </div>
                                </div>
                                
                                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div class="flex items-center justify-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-900/50 px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg border border-slate-200 dark:border-slate-700/50 shrink-0 w-full sm:w-auto">
                                        <div class="flex flex-col items-end flex-1 sm:flex-none sm:w-20">
                                            <span class="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none mb-0.5 truncate w-full text-right">${nameA}</span>
                                            <span class="font-bold text-slate-700 dark:text-slate-300 text-sm">${formatCurrency(diffObj.valA / 100)}</span>
                                        </div>
                                        <i data-lucide="arrow-right" class="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0"></i>
                                        <div class="flex flex-col items-start flex-1 sm:flex-none sm:w-20">
                                            <span class="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none mb-0.5 truncate w-full text-left">${nameB}</span>
                                            <span class="font-bold text-slate-700 dark:text-slate-300 text-sm">${formatCurrency(diffObj.valB / 100)}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="${diffColor} px-2 sm:px-3 py-2.5 sm:py-1.5 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 font-bold text-sm border whitespace-nowrap shrink-0 w-full sm:w-auto sm:min-w-[90px]">
                                        <i data-lucide="${diffIcon}" class="w-4 h-4 shrink-0"></i>
                                        ${diffSign}${formatCurrency(diffObj.absDiff / 100)}
                                    </div>
                                </div>
                            </div>
                            
                            <div id="details-${index}" class="hidden border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-4">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <h5 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 border-b border-slate-200 dark:border-slate-700 pb-1 flex justify-between items-center">
                                            <span>${nameA}</span>
                                            <span class="text-slate-500 dark:text-slate-400">${itemsA.length} op.</span>
                                        </h5>
                                        <ul>
                                            ${listAHtml}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 border-b border-slate-200 dark:border-slate-700 pb-1 flex justify-between items-center">
                                            <span>${nameB}</span>
                                            <span class="text-slate-500 dark:text-slate-400">${itemsB.length} op.</span>
                                        </h5>
                                        <ul>
                                            ${listBHtml}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += `</div></div>`;
            }

            const getChartBtnClass = (type) => currentCompareChartType === type ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50';

            html += `
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm mb-6 ${chartLabels.length === 0 ? 'hidden' : ''}">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><i data-lucide="bar-chart" class="w-4 h-4 text-indigo-500"></i> Aperçu visuel des dépenses</h4>
                        
                        <div class="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50" id="chart-type-selector-buttons">
                            <button onclick="setCompareChartType('bar')" id="btn-chart-bar" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${getChartBtnClass('bar')}">Barres</button>
                            <button onclick="setCompareChartType('radar')" id="btn-chart-radar" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${getChartBtnClass('radar')}">Radar</button>
                            <button onclick="setCompareChartType('line')" id="btn-chart-line" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${getChartBtnClass('line')}">Ligne</button>
                        </div>
                    </div>
                    <div class="relative h-64 sm:h-80 w-full">
                        <canvas id="compareChart"></canvas>
                    </div>
                </div>
            `;
            
            if (allKeys.size > 0) {
                html += `<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Détails des Dépenses</h3>`;
                html += `<div class="space-y-3">`;
                
                const grouped = {};
                allKeys.forEach(k => {
                    const [large, small] = k.split('__||__');
                    if(!grouped[large]) grouped[large] = [];
                    grouped[large].push({ name: small, key: k });
                });

                for (const large in grouped) {
                    const pal = appCategories[large] ? appCategories[large].palette : availablePalettes[0];
                    html += `
                    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                        <div class="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <i data-lucide="${pal.icon}" class="w-4 h-4 ${pal.text}"></i>
                            <span class="font-bold text-slate-700 dark:text-slate-200">${escapeHtml(large)}</span>
                        </div>
                        <div class="p-3 bg-white dark:bg-slate-800 divide-y divide-slate-50 dark:divide-slate-700">
                    `;
                    
                    grouped[large].sort((a,b)=>a.name.localeCompare(b.name)).forEach(sub => {
                        const valA = catsA[sub.key] || 0;
                        const valB = catsB[sub.key] || 0;
                        html += `
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-2 sm:gap-0">
                                <span class="font-medium text-slate-600 dark:text-slate-300 text-sm w-full sm:w-1/3 truncate">${escapeHtml(sub.name)}</span>
                                <div class="flex items-center text-sm w-full sm:w-2/3 justify-between sm:justify-end gap-2 sm:gap-6">
                                    <div class="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                        <span><b class="sm:hidden">A: </b>${formatCurrency(valA/100)}</span>
                                        <span class="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
                                        <span><b class="sm:hidden">B: </b>${formatCurrency(valB/100)}</span>
                                    </div>
                                    <div class="min-w-[90px] text-right whitespace-nowrap">${renderDiff(valA, valB, 'expense')}</div>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div></div>`;
                }
                html += `</div>`;
            }

            resultsDiv.innerHTML = html;
            lucide.createIcons();

            if (chartLabels.length > 0) {
                const ctxComp = document.getElementById('compareChart').getContext('2d');
                if (compareChartInstance) compareChartInstance.destroy();
                
                const isDark = document.documentElement.classList.contains('dark');
                
                const chartConfig = {
                    type: currentCompareChartType,
                    data: {
                        labels: chartLabels,
                        datasets: [
                            {
                                label: nameA + ' (Réf)',
                                data: dataA_chart,
                                backgroundColor: currentCompareChartType === 'line' || currentCompareChartType === 'radar' ? (isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)') : '#94a3b8', 
                                borderColor: '#94a3b8',
                                borderWidth: 2,
                                borderRadius: currentCompareChartType === 'bar' ? 4 : 0,
                                fill: true
                            },
                            {
                                label: nameB + ' (Cible)',
                                data: dataB_chart,
                                backgroundColor: currentCompareChartType === 'line' || currentCompareChartType === 'radar' ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.2)') : '#6366f1', 
                                borderColor: '#6366f1',
                                borderWidth: 2,
                                borderRadius: currentCompareChartType === 'bar' ? 4 : 0,
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
                            tooltip: { callbacks: { label: function(context) { return formatCurrency(context.raw); } } }
                        },
                        scales: currentCompareChartType === 'radar' ? { r: { ticks: { display: false } } } : { y: { beginAtZero: true, ticks: { callback: function(value) { return value + ' €'; } } } }
                    }
                };
                compareChartInstance = new Chart(ctxComp, chartConfig);
            }
        }

        function updateModalSelect() {
            const select = document.getElementById('parent-main-cat-select'); select.innerHTML = '';
            for (const mainCat in appCategories) {
                const option = document.createElement('option'); option.value = mainCat; option.textContent = mainCat; select.appendChild(option);
            }
        }

        function addMainCategory() {
            const input = document.getElementById('new-main-cat-input'); const name = input.value.trim();
            if (!name) return showToast("Veuillez entrer un nom.", "error");
            if (appCategories[name]) return showToast("Cette catégorie existe déjà.", "error");
            const usedPaletteIds = Object.values(appCategories).map(c => c.palette.id);
            const unusedPalettes = availablePalettes.filter(p => !usedPaletteIds.includes(p.id));
            const selectedPalette = unusedPalettes.length > 0 ? unusedPalettes[0] : availablePalettes[Math.floor(Math.random() * availablePalettes.length)];
            appCategories[name] = { palette: selectedPalette, subCats: ["Divers"], limitCents: 0 };
            saveCategories(); input.value = ''; updateModalSelect(); populateCategoryDropdown(); updateHistoryCategoryFilter(); renderEditCategories(); render(); 
        }

        function addSubCategory() {
            const input = document.getElementById('new-sub-cat-input'); const select = document.getElementById('parent-main-cat-select');
            const name = input.value.trim(); const parent = select.value;
            if (!name) return showToast("Veuillez entrer un nom de sous-catégorie.", "error");
            if (appCategories[parent].subCats.includes(name)) return showToast("Cette sous-catégorie existe déjà ici.", "error");
            appCategories[parent].subCats.push(name);
            saveCategories(); input.value = ''; populateCategoryDropdown(); renderEditCategories(); 
        }

        function renderEditCategories() {
            const container = document.getElementById('edit-categories-list');
            let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
            const mainCatsArray = Object.keys(appCategories);

            mainCatsArray.forEach((mainCat, mainIndex) => {
                const data = appCategories[mainCat];
                let moveOptions = '';
                mainCatsArray.forEach((mCat, mIdx) => {
                    const selected = mCat === mainCat ? 'selected' : '';
                    moveOptions += `<option value="${mIdx}" ${selected}>Dossier : ${escapeHtml(mCat)}</option>`;
                });

                let subCatsHtml = '';
                data.subCats.forEach((subCat, subIndex) => {
                    subCatsHtml += `
                        <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div class="flex flex-col sm:flex-row gap-2 mb-2.5">
                                <input type="text" id="input_name_sub_${mainIndex}_${subIndex}" value="${escapeHtml(subCat)}" 
                                    onkeypress="if(event.key === 'Enter') updateSubCategory(${mainIndex}, ${subIndex})"
                                    class="w-full sm:flex-1 px-2.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent border border-slate-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 focus:outline-none transition-colors">
                                <div class="flex gap-2 w-full sm:w-auto">
                                    <button onclick="updateSubCategory(${mainIndex}, ${subIndex})" class="flex-1 sm:flex-none flex justify-center text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-500 p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md transition-colors" title="Enregistrer">
                                        <i data-lucide="save" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="deleteSubCategory(${mainIndex}, ${subIndex})" class="flex-1 sm:flex-none flex justify-center text-red-500 dark:text-red-400 hover:text-white hover:bg-red-500 p-1.5 bg-red-50 dark:bg-red-500/10 rounded-md transition-colors" title="Supprimer">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-md px-2 py-1.5 border border-slate-100 dark:border-slate-700/50 w-full overflow-hidden">
                                <i data-lucide="folder" class="w-4 h-4 text-slate-400 shrink-0"></i>
                                <select id="select_move_sub_${mainIndex}_${subIndex}" onchange="updateSubCategory(${mainIndex}, ${subIndex})" class="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none cursor-pointer truncate">
                                    ${moveOptions}
                                </select>
                            </div>
                        </div>
                    `;
                });

                const escapedMainCat = mainCat.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                const globalLimitDisplay = data.limitCents > 0
                    ? '<div class="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-lg">' +
                      '<span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><i data-lucide="calendar-range" class="w-3 h-3"></i> Limite globale</span>' +
                      '<span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">' + (data.limitCents / 100).toFixed(2) + ' €</span>' +
                      '</div>'
                    : '';
                let monthlyOverridesHtml = '';
                if (data.monthlyLimits && Object.keys(data.monthlyLimits).length > 0) {
                    const overrideEntries = Object.entries(data.monthlyLimits).sort(([a], [b]) => b.localeCompare(a));
                    monthlyOverridesHtml = '<div class="space-y-1">' +
                        '<p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Limites mensuelles</p>' +
                        overrideEntries.map(([month, cents]) => {
                            const shortMonth = new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                            return '<div class="flex items-center justify-between gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 px-2.5 py-1.5 rounded-lg">' +
                                '<span class="text-xs text-indigo-700 dark:text-indigo-300 font-medium capitalize">' + shortMonth + '</span>' +
                                '<div class="flex items-center gap-1.5">' +
                                '<span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">' + (cents / 100).toFixed(2) + ' €</span>' +
                                '<button onclick="deleteMonthlyLimit(\'' + escapedMainCat + '\', \'' + month + '\')" class="text-rose-400 hover:text-rose-600 transition-colors" title="Supprimer cette limite mensuelle"><i data-lucide="x" class="w-3 h-3"></i></button>' +
                                '</div></div>';
                        }).join('') + '</div>';
                }
                const limitsSectionHtml = (globalLimitDisplay || monthlyOverridesHtml)
                    ? '<div class="bg-slate-50 dark:bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-700 space-y-2">' + globalLimitDisplay + monthlyOverridesHtml + '</div>'
                    : '';

                html += `
                    <div class="flex flex-col bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden h-full">
                        <div class="bg-white dark:bg-slate-800 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                            <div class="flex items-center gap-2 sm:gap-3">
                                <div class="p-1.5 sm:p-2 rounded-xl ${data.palette.bgLight} ${data.palette.textDark} shrink-0"><i data-lucide="${data.palette.icon}" class="w-4 h-4 sm:w-5 sm:h-5"></i></div>
                                <input type="text" id="input_main_${mainIndex}" value="${escapeHtml(mainCat)}" onkeypress="if(event.key === 'Enter') updateMainCategory(${mainIndex})"
                                    class="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 w-full bg-transparent border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 focus:outline-none px-1 py-0.5 truncate">
                            </div>
                            
                            ${limitsSectionHtml}
                            
                            <div class="flex flex-col sm:flex-row gap-2 mt-1">
                                <button onclick="updateMainCategory(${mainIndex})" class="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 py-2 rounded-lg transition-colors"><i data-lucide="save" class="w-3.5 h-3.5"></i> Enregistrer</button>
                                <button onclick="deleteMainCategory(${mainIndex})" class="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 py-2 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Supprimer</button>
                            </div>
                        </div>
                        <div class="p-3 sm:p-4 space-y-3 flex-1 overflow-y-auto" style="max-height: 350px;">
                            ${subCatsHtml || '<div class="text-center py-6 text-sm text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">Aucune sous-catégorie.</div>'}
                        </div>
                    </div>
                `;
            });
            html += '</div>'; container.innerHTML = html; lucide.createIcons();
        }

        function updateMainCategory(mainIndex) {
            const oldName = Object.keys(appCategories)[mainIndex];
            const newName = document.getElementById(`input_main_${mainIndex}`).value.trim();

            if (!newName) return showToast("Veuillez entrer un nom.", "error");
            if (newName !== oldName && appCategories[newName]) return showToast("Cette catégorie existe déjà.", "error");

            appCategories[newName] = appCategories[oldName];

            if(newName !== oldName) {
                delete appCategories[oldName];
                expenses.forEach(exp => { if (exp.largeCat === oldName) exp.largeCat = newName; });
            }
            
            saveCategories(); saveData(); updateModalSelect(); populateCategoryDropdown(); updateHistoryCategoryFilter(); renderEditCategories(); render(); updateCompareSelects();
            showToast("Catégorie mise à jour !");
        }

        function deleteMainCategory(mainIndex) {
            const name = Object.keys(appCategories)[mainIndex];
            if(!confirm(`Supprimer "${name}" ?`)) return;
            delete appCategories[name]; saveCategories(); updateModalSelect(); populateCategoryDropdown(); updateHistoryCategoryFilter(); renderEditCategories(); render(); updateCompareSelects();
        }

        function updateSubCategory(mainIndex, subIndex) {
            const mainCat = Object.keys(appCategories)[mainIndex];
            const oldSubName = appCategories[mainCat].subCats[subIndex];
            const newSubName = document.getElementById(`input_name_sub_${mainIndex}_${subIndex}`).value.trim();
            const destMainIndex = document.getElementById(`select_move_sub_${mainIndex}_${subIndex}`).value;
            const destMainCat = Object.keys(appCategories)[destMainIndex];
            if (!newSubName) return;
            if ((newSubName !== oldSubName || mainCat !== destMainCat) && appCategories[destMainCat].subCats.includes(newSubName)) return showToast("Cette sous-catégorie existe déjà.", "error");
            appCategories[mainCat].subCats.splice(subIndex, 1); appCategories[destMainCat].subCats.push(newSubName);
            expenses.forEach(exp => { if (exp.smallCat === oldSubName && exp.largeCat === mainCat) { exp.smallCat = newSubName; exp.largeCat = destMainCat; } });
            saveCategories(); saveData(); populateCategoryDropdown(); renderEditCategories(); render(); updateCompareSelects();
        }

        function deleteSubCategory(mainIndex, subIndex) {
            const mainCat = Object.keys(appCategories)[mainIndex];
            const subName = appCategories[mainCat].subCats[subIndex];
            if(!confirm(`Supprimer "${subName}" ?`)) return;
            appCategories[mainCat].subCats.splice(subIndex, 1); saveCategories(); populateCategoryDropdown(); renderEditCategories(); render(); updateCompareSelects();
        }

        function populateCategoryDropdown() {
            const selectCat = document.getElementById('category-input');
            selectCat.innerHTML = '<option value="" disabled selected>Choisir une catégorie...</option>';
            for (const [largeCat, data] of Object.entries(appCategories)) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = `--- ${largeCat.toUpperCase()} ---`;
                data.subCats.forEach(smallCat => {
                    const option = document.createElement('option');
                    option.value = smallCat; option.textContent = smallCat; option.dataset.largeCategory = largeCat; 
                    optgroup.appendChild(option);
                });
                selectCat.appendChild(optgroup);
            }
        }

        function toggleForceMonthSelect() {
            const isForce = document.querySelector('input[name="import-date-handling"][value="force"]').checked;
            const selectEl = document.getElementById('force-month-select');
            selectEl.disabled = !isForce;
            if(isForce) {
                selectEl.focus();
            }
        }

        function importJSON(event) {
            const file = event.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    pendingImportData = JSON.parse(e.target.result);
                    let importedExpenses = Array.isArray(pendingImportData) ? pendingImportData : (pendingImportData.expenses || []);
                    
                    if (!Array.isArray(importedExpenses) || (pendingImportData.categories && typeof pendingImportData.categories !== 'object')) {
                        throw new Error("Format non reconnu");
                    }

                    document.getElementById('import-actions').classList.remove('hidden');
                    document.getElementById('import-confirm-replace').classList.add('hidden');
                    document.getElementById('import-confirm-replace').classList.remove('flex');

                    const multiMonthWarning = document.getElementById('multi-month-warning');
                    const detectedMonthsList = document.getElementById('detected-months-list');
                    const forceMonthSelect = document.getElementById('force-month-select');

                    if (importedExpenses.length > 0) {
                        const monthCounts = {};
                        importedExpenses.forEach(exp => {
                            if (exp.date) {
                                const m = exp.date.slice(0, 7); 
                                monthCounts[m] = (monthCounts[m] || 0) + 1;
                            }
                        });
                        
                        const uniqueMonths = Object.keys(monthCounts).sort().reverse();

                        if (uniqueMonths.length > 1) {
                            detectedMonthsList.innerHTML = uniqueMonths.map(m => {
                                const dateObj = new Date(m + '-01');
                                const monthStr = dateObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                                const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
                                return `<span class="bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md border border-amber-200 dark:border-amber-700 shadow-sm">${capitalizedMonth} (${monthCounts[m]} op.)</span>`;
                            }).join('');

                            forceMonthSelect.innerHTML = uniqueMonths.map(m => {
                                const dateObj = new Date(m + '-01');
                                const monthStr = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                                return `<option value="${m}">${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}</option>`;
                            }).join('');

                            multiMonthWarning.classList.remove('hidden');
                            document.querySelector('input[name="import-date-handling"][value="keep"]').checked = true;
                            forceMonthSelect.disabled = true;
                        } else {
                            multiMonthWarning.classList.add('hidden');
                        }
                    } else {
                        multiMonthWarning.classList.add('hidden');
                    }

                    const mergeBtn = document.getElementById('merge-import-btn');
                    if (expenses.length > 0) {
                        mergeBtn.style.display = 'flex';
                    } else {
                        mergeBtn.style.display = 'none';
                    }
                    
                    document.getElementById('import-modal').classList.remove('hidden');
                    lucide.createIcons();
                    
                } catch (err) { 
                    showToast("Fichier corrompu ou illisible.", "error");
                }
            };
            reader.readAsText(file); 
            event.target.value = ''; 
        }

        function showReplaceConfirmation() {
            document.getElementById('import-actions').classList.add('hidden');
            document.getElementById('import-confirm-replace').classList.remove('hidden');
            document.getElementById('import-confirm-replace').classList.add('flex');
        }

        function hideReplaceConfirmation() {
            document.getElementById('import-actions').classList.remove('hidden');
            document.getElementById('import-confirm-replace').classList.add('hidden');
            document.getElementById('import-confirm-replace').classList.remove('flex');
        }

        function closeImportModal() {
            document.getElementById('import-modal').classList.add('hidden');
            pendingImportData = null; 
        }

        function executeImport(mode) {
            if (!pendingImportData) return;

            const dataToImport = pendingImportData;
            
            // Capture du choix de l'utilisateur pour la gestion des dates multiples
            let dateHandling = 'keep';
            let targetForceMonth = '';
            const multiMonthWarning = document.getElementById('multi-month-warning');
            
            if (!multiMonthWarning.classList.contains('hidden')) {
                const forceRadio = document.querySelector('input[name="import-date-handling"][value="force"]');
                if (forceRadio && forceRadio.checked) {
                    dateHandling = 'force';
                    targetForceMonth = document.getElementById('force-month-select').value;
                }
            }

            closeImportModal();
            showLoader("Importation...", "Traitement et fusion de vos données");

            setTimeout(() => {
                try {
                    let importedExpenses = Array.isArray(dataToImport) ? dataToImport : (dataToImport.expenses || []);
                    const existingIds = new Set(expenses.map(exp => exp.id));
                    
                    const processExpense = (exp) => {
                        if (!exp.id || existingIds.has(exp.id)) {
                            exp.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        }
                        existingIds.add(exp.id);

                        delete exp.isRecurring; delete exp.recurringParentId;
                        delete exp.isOutlier; delete exp.targetMonth; // Assainissement
                        
                        // Application du "Forcer le mois" si demandé
                        if (dateHandling === 'force' && targetForceMonth) {
                            exp.date = targetForceMonth + '-01';
                        }
                        
                        return exp;
                    };

                    if (mode === 'replace') {
                        expenses = importedExpenses.map(processExpense);
                        if (dataToImport.categories && !Array.isArray(dataToImport)) {
                            appCategories = dataToImport.categories; saveCategories();
                        }
                    } else if (mode === 'merge') {
                        importedExpenses.forEach(exp => {
                            const processedExp = processExpense(exp);
                            expenses.push(processedExp);
                        });
                        
                        if (dataToImport.categories && !Array.isArray(dataToImport)) {
                            for (const cat in dataToImport.categories) {
                                if (!appCategories[cat]) appCategories[cat] = dataToImport.categories[cat];
                                else {
                                    if(dataToImport.categories[cat].limitCents !== undefined && appCategories[cat].limitCents === undefined) {
                                        appCategories[cat].limitCents = dataToImport.categories[cat].limitCents;
                                    }
                                    dataToImport.categories[cat].subCats.forEach(sub => {
                                        if (!appCategories[cat].subCats.includes(sub)) appCategories[cat].subCats.push(sub);
                                    });
                                }
                            }
                            saveCategories();
                        }
                    }

                    saveData(); populateCategoryDropdown(); updateHistoryCategoryFilter(); updateMonthDropdown(); render(); updateCompareSelects();
                    hideLoader();
                    showToast("Les données ont été intégrées avec succès !");
                    
                } catch (err) {
                    hideLoader();
                    showToast("Erreur lors de l'intégration.", "error");
                }
            }, 800);
        }

        function exportJSON() {
            showLoader("Préparation en cours...", "Génération de votre fichier de sauvegarde");
            
            setTimeout(() => {
                const dataToExport = {
                    expenses: expenses,
                    categories: appCategories,
                    exportDate: new Date().toISOString()
                };
                
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                
                let fileName = "";
                const todayFormatted = new Date().toISOString().slice(0, 10);
                if (expenses.length === 0) {
                    fileName = `budget_vide_${todayFormatted}.json`;
                } else {
                    const uniqueMonths = [...new Set(expenses.map(e => e.date ? e.date.slice(0, 7) : ""))].filter(Boolean);
                    if (uniqueMonths.length === 1) {
                        fileName = `budget_${uniqueMonths[0]}.json`;
                    } else {
                        fileName = `budget_global_${todayFormatted}.json`;
                    }
                }
                
                downloadAnchorNode.setAttribute("download", fileName);
                document.body.appendChild(downloadAnchorNode); 
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                
                hideLoader();
                showToast("Sauvegarde téléchargée avec succès !");
            }, 1200); 
        }

        function formatCurrency(amount) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount); }
        function calcPercent(part, total) { return total === 0 ? "0%" : ((part / total) * 100).toFixed(1).replace('.', ',') + "%"; }

        init();

