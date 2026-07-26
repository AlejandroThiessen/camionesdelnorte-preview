/* ===================================================================
   Camiones del Norte — site interactions
   Vanilla JS, no dependencies. Every block is independently guarded so
   a missing element on one page never breaks the rest.
   =================================================================== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------
       Sticky header shadow
       --------------------------------------------------------------- */
    (function stickyHeader() {
        var header = document.getElementById('siteHeader');
        if (!header) return;
        var stuck = false;
        function onScroll() {
            var y = window.scrollY || window.pageYOffset;
            if (y > 8 !== stuck) {
                stuck = y > 8;
                header.classList.toggle('is-stuck', stuck);
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    })();

    /* ---------------------------------------------------------------
       Mobile navigation drawer
       --------------------------------------------------------------- */
    (function mobileNav() {
        var toggle = document.getElementById('menuToggle');
        var menu = document.getElementById('navMenu');
        var backdrop = document.getElementById('navBackdrop');
        if (!toggle || !menu) return;

        function setOpen(open) {
            menu.classList.toggle('active', open);
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            document.body.classList.toggle('nav-open', open);
            if (backdrop) {
                backdrop.hidden = false;
                backdrop.classList.toggle('is-open', open);
            }
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(!menu.classList.contains('active'));
        });

        if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });

        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Reset when resizing back up to the desktop layout
        window.addEventListener('resize', function () {
            if (window.innerWidth > 860 && menu.classList.contains('active')) setOpen(false);
        });
    })();

    /* ---------------------------------------------------------------
       Scroll reveal
       --------------------------------------------------------------- */
    (function reveal() {
        var items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

        items.forEach(function (el) { io.observe(el); });
    })();

    /* ---------------------------------------------------------------
       Inventory filter + sort
       --------------------------------------------------------------- */
    (function inventory() {
        var grid = document.getElementById('unitGrid');
        if (!grid) return;

        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-cat]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
        var sort = document.getElementById('invSort');
        var empty = document.getElementById('invEmpty');
        var filter = 'todos';

        var comparators = {
            'destacado': function (a, b) { return n(a, 'order') - n(b, 'order'); },
            'precio-asc': function (a, b) { return n(a, 'price') - n(b, 'price'); },
            'precio-desc': function (a, b) { return n(b, 'price') - n(a, 'price'); },
            'year-desc': function (a, b) { return n(b, 'year') - n(a, 'year') || n(a, 'order') - n(b, 'order'); },
            'km-asc': function (a, b) { return n(a, 'km') - n(b, 'km'); }
        };

        function n(el, key) { return parseInt(el.getAttribute('data-' + key), 10) || 0; }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var show = filter === 'todos' || card.getAttribute('data-cat') === filter;
                card.classList.toggle('is-hidden', !show);
                if (show) visible++;
            });

            var cmp = comparators[(sort && sort.value) || 'destacado'] || comparators.destacado;
            cards.slice().sort(cmp).forEach(function (card, i) { card.style.order = i; });

            if (empty) empty.classList.toggle('hidden', visible > 0);
            grid.classList.toggle('hidden', visible === 0);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.classList.remove('is-active'); });
                chip.classList.add('is-active');
                filter = chip.getAttribute('data-filter');
                apply();
            });
        });

        if (sort) sort.addEventListener('change', apply);
        apply();
    })();

    /* ---------------------------------------------------------------
       Back to top + mobile action bar
       --------------------------------------------------------------- */
    (function floatingChrome() {
        var top = document.getElementById('backToTop');
        var bar = document.getElementById('actionBar');
        if (bar) document.body.classList.add('has-action-bar');
        if (!top && !bar) return;

        var shown = null;
        function onScroll() {
            var y = window.scrollY || window.pageYOffset;
            var next = y > 420;
            if (next === shown) return;
            shown = next;
            if (top) top.classList.toggle('visible', next);
            if (bar) bar.classList.toggle('is-visible', next);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        if (top) {
            top.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }
    })();
})();
