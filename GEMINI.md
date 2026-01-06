# Perfect Chess Academy - Project Overview

## 1. Project Description
This is the codebase for **Perfect Chess Academy**, a web application designed to promote chess courses, tournaments, and coaching. It features a modern, responsive user interface with specific focus on user engagement through interactive elements and visual storytelling.

**Type:** Web Application (Frontend-focused with PHP backend potential)
**Domain:** Education / E-commerce (Chess Coaching)

## 2. Technology Stack

*   **Frontend:**
    *   **HTML5:** Semantic structure.
    *   **CSS3:** Modular stylesheets in `assets/css/`. Uses CSS variables (`theme.css`) for theming (dark/light mode).
    *   **JavaScript (Vanilla):** Client-side logic for UI interactions, settings, and mock authentication.
    *   **Libraries (CDN):**
        *   `chess.js` & `chessboard.js` (Chess logic and board visualization)
        *   FontAwesome (Icons)
        *   Google Fonts (Inter)

*   **Backend / Server (Inferred):**
    *   **Apache:** Configured via `.htaccess` (Security, Redirects).
    *   **PHP:** PHP scripts found in `tests/` directory (`check_status.php`, `init_session.php`), suggesting a backend payment/session system is in development or testing.

## 3. Directory Structure

```text
/
├── index.html              # Main landing page
├── login.html              # Authentication page
├── student-dashboard.html  # User dashboard
├── universal-settings.js   # Global settings (Theme, Visual Effects, Audio)
├── assets/
│   ├── css/                # Modular CSS files (hero.css, auth.css, theme.css, etc.)
│   ├── js/                 # Feature-specific JS (auth.js, courses.js, etc.)
│   └── Images/             # Static assets
├── tests/                  # Backend experiments/modules (PHP payment integration, etc.)
└── .htaccess               # Server configuration
```

## 4. Key Components

### Global Settings (`universal-settings.js`)
Manages application-wide state using `localStorage`:
*   **Theme:** Light/Dark mode.
*   **Visuals:** Toggle for visual effects and mouse trails.
*   **Font Size:** Accessibility adjustment.

### Authentication (`assets/js/auth.js`)
Handles the Login and Registration forms (`login.html`).
*   **Current State:** Uses **mocked** API calls (`setTimeout`) to simulate network requests.
*   **Validation:** Client-side validation for emails, passwords, and names.
*   **Redirects:** Redirects to `student-dashboard.html` on successful "login".

### Styling Strategy
CSS is highly modularized in `assets/css/`.
*   `base.css` / `theme.css`: Core variables and resets.
*   `responsive.css`: Media queries for mobile adaptation.
*   Component-specific files (e.g., `hero.css`, `coaching.css`) keep styles isolated.

## 5. Setup & Development

### Prerequisites
*   A modern web browser.
*   **Optional:** A local web server (e.g., Apache/XAMPP, Python `http.server`, or VS Code "Live Server") to properly serve assets and handle `.htaccess` rules or PHP files if developing backend features.

### Running Locally
1.  **Static Mode:** Open `index.html` directly in a browser (some features like CORS-restricted resources might need a server).
2.  **Server Mode (Recommended):**
    ```bash
    # Python 3
    python -m http.server 8000
    # OR using PHP
    php -S localhost:8000
    ```

## 6. Development Notes & Conventions

*   **Mocking:** Authentication and data fetching are currently mocked in the JS files. Look for comments like `// Simulate API call`.
*   **CSS Class Naming:** Follows a BEM-like structure (e.g., `.hero-headline`, `.btn-primary`).
*   **Backend Integration:** The `tests/` folder contains PHP scripts that seem to handle payments and sessions. Future work likely involves integrating these into the main root or a dedicated `api/` directory.
