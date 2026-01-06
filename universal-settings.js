(function() {
    'use strict';

    const SETTINGS_DEFAULTS = {
        theme: 'dark',
        visualEffects: true,
        mouseTrail: false,
        soundEffects: false,
        fontSize: 100,
        siteTheme: 'default'
    };

    let settings = {};

    function saveSetting(key, value) {
        settings[key] = value;
        localStorage.setItem('pca-settings', JSON.stringify(settings));
        applySetting(key, value);
    }

    function applySetting(key, value) {
        switch (key) {
            case 'theme':
                document.body.classList.toggle('light-mode', value === 'light');
                break;
            case 'visualEffects':
                document.body.classList.toggle('no-visual-effects', !value);
                break;
            case 'mouseTrail':
                document.body.classList.toggle('mouse-trail-active', value);
                if (window.chessApp && typeof window.chessApp.toggleMouseTrail === 'function') {
                    window.chessApp.toggleMouseTrail(value);
                }
                break;
            case 'fontSize':
                document.documentElement.style.fontSize = `${value}%`;
                break;
            case 'siteTheme':
                document.body.dataset.theme = value;
                break;
        }
    }

    function loadSettings() {
        let savedSettings = {};
        try {
            const raw = localStorage.getItem('pca-settings');
            if (raw) savedSettings = JSON.parse(raw);
        } catch (e) {
            console.warn('Failed to parse saved settings, using defaults.', e);
            savedSettings = {};
        }

        settings = { ...SETTINGS_DEFAULTS, ...savedSettings };
        Object.keys(settings).forEach(key => {
            applySetting(key, settings[key]);
        });
        updateUI();
    }

    function updateUI() {
        // Update toggles (use combined selectors so optional chaining covers both elements)
        document.querySelector('#theme-toggle .toggle-switch')?.classList.toggle('active', settings.theme === 'light');
        document.querySelector('#animations-toggle .toggle-switch')?.classList.toggle('active', settings.visualEffects);
        document.querySelector('#mouse-trail-toggle .toggle-switch')?.classList.toggle('active', settings.mouseTrail);
        document.querySelector('#sound-toggle .toggle-switch')?.classList.toggle('active', settings.soundEffects);

        // Update font size display
        const fontDisplay = document.getElementById('font-display');
        if (fontDisplay) {
            fontDisplay.textContent = `${settings.fontSize}%`;
        }

        // Update theme palettes
        document.querySelectorAll('.theme-palette').forEach(palette => {
            palette.classList.remove('active');
            if (palette.dataset.theme === settings.siteTheme) {
                palette.classList.add('active');
            }
        });
    }

    function initSettingsPanel() {
        const settingsToggle = document.querySelector('.settings-toggle');
        const settingsPanel = document.querySelector('.settings-panel');
        const settingsClose = document.querySelector('.settings-close');

        if (settingsToggle && settingsPanel && settingsClose) {
            settingsToggle.addEventListener('click', () => settingsPanel.classList.toggle('open'));
            settingsClose.addEventListener('click', () => settingsPanel.classList.remove('open'));
            document.addEventListener('click', (e) => {
                if (!settingsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
                    settingsPanel.classList.remove('open');
                }
            });
        }

        // --- Theme ---
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            saveSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');
            updateUI();
        });

        // --- Visual Effects ---
        document.getElementById('animations-toggle')?.addEventListener('click', () => {
            saveSetting('visualEffects', !settings.visualEffects);
            window.location.reload(); // Reload to apply/remove animations
        });

        // --- Mouse Trail ---
        document.getElementById('mouse-trail-toggle')?.addEventListener('click', () => {
            saveSetting('mouseTrail', !settings.mouseTrail);
            updateUI();
        });

        // --- Sound Effects ---
        document.getElementById('sound-toggle')?.addEventListener('click', () => {
            saveSetting('soundEffects', !settings.soundEffects);
            updateUI();
        });

        // --- Font Size ---
        document.getElementById('font-smaller')?.addEventListener('click', () => {
            saveSetting('fontSize', Math.max(80, settings.fontSize - 10));
            updateUI();
        });
        document.getElementById('font-larger')?.addEventListener('click', () => {
            saveSetting('fontSize', Math.min(150, settings.fontSize + 10));
            updateUI();
        });

        // --- Site Theme ---
        document.querySelectorAll('.theme-palette').forEach(palette => {
            palette.addEventListener('click', () => {
                saveSetting('siteTheme', palette.dataset.theme);
                updateUI();
            });
        });

        // --- Reset Settings ---
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to their defaults?')) {
                localStorage.removeItem('pca-settings');
                loadSettings();
                window.location.reload();
            }
        });
    }

    function init() {
        loadSettings();
        initSettingsPanel();
        // Other init functions can go here
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

