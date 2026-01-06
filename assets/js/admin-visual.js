/**
 * VISUAL ADMIN PANEL - Perfect Chess Academy
 * Interactive admin interface with click-to-edit
 * Compatible with GoDaddy Shared Hosting (No Node.js required)
 * Version: 1.0.0
 */

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================
const AdminPanel = {
  mode: "edit",
  currentElement: null,
  changes: {},
  unsavedChanges: false,
  activeModal: null,
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🎨 Admin Panel Initialized");
  initializeEditMode();
  initializeBlogCreator();
  initializeTournamentCreator();
  preventAccidentalExit();
  attachEventListeners();
});

// ============================================
// EDIT MODE FUNCTIONALITY
// ============================================
function initializeEditMode() {
  const editableElements = document.querySelectorAll(
    ".editable-text, .editable-card, .editable-icon"
  );

  editableElements.forEach((element) => {
    // Show floating toolbar on hover
    element.addEventListener("mouseenter", function (e) {
      if (AdminPanel.mode === "edit") {
        showFloatingToolbar(e.target);
      }
    });

    // Hide toolbar when mouse leaves
    element.addEventListener("mouseleave", function () {
      setTimeout(() => {
        const toolbar = document.getElementById("floatingToolbar");
        const panel = document.getElementById("editPanel");
        if (!toolbar.matches(":hover") && !panel.classList.contains("active")) {
          hideFloatingToolbar();
        }
      }, 300);
    });

    // Double-click to enable inline editing
    if (element.classList.contains("editable-text")) {
      element.addEventListener("dblclick", function (e) {
        e.preventDefault();
        enableInlineEditing(e.target);
      });
    }

    // Single click to open edit panel for cards
    if (element.classList.contains("editable-card")) {
      element.addEventListener("click", function (e) {
        if (AdminPanel.mode === "edit" && !e.target.closest(".editable-text")) {
          openEditPanelForCard(e.currentTarget);
        }
      });
    }
  });
}

function showFloatingToolbar(element) {
  const toolbar = document.getElementById("floatingToolbar");
  AdminPanel.currentElement = element;

  // Calculate position
  const rect = element.getBoundingClientRect();
  toolbar.style.display = "flex";
  toolbar.style.top = rect.top - 50 + "px";
  toolbar.style.left = rect.left + "px";
}

function hideFloatingToolbar() {
  const toolbar = document.getElementById("floatingToolbar");
  toolbar.style.display = "none";
}

function enableInlineEditing(element) {
  element.contentEditable = true;
  element.focus();

  // Select all text
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);

  // Track changes
  AdminPanel.unsavedChanges = true;

  // Save on blur
  element.addEventListener(
    "blur",
    function () {
      this.contentEditable = false;
      saveElementChange(this);
    },
    { once: true }
  );

  // Save on Enter key
  element.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.blur();
      }
    },
    { once: true }
  );
}

function saveElementChange(element) {
  const field = element.getAttribute("data-field");
  const section = element
    .closest("[data-section]")
    ?.getAttribute("data-section");
  const newValue = element.textContent.trim();

  if (field && section) {
    if (!AdminPanel.changes[section]) {
      AdminPanel.changes[section] = {};
    }
    AdminPanel.changes[section][field] = newValue;

    console.log("✏️ Saved change:", { section, field, newValue });
    showNotification(
      'Change saved locally. Click "Save Changes" to update website.'
    );
  }
}

// ============================================
// TOOLBAR ACTIONS
// ============================================
function editElement() {
  const element = AdminPanel.currentElement;
  if (!element) return;

  if (element.classList.contains("editable-text")) {
    enableInlineEditing(element);
  } else if (element.classList.contains("editable-card")) {
    openEditPanelForCard(element);
  } else if (element.classList.contains("editable-icon")) {
    openIconPicker(element);
  }

  hideFloatingToolbar();
}

function duplicateElement() {
  const element = AdminPanel.currentElement;
  if (!element) return;

  const clone = element.cloneNode(true);
  element.parentNode.insertBefore(clone, element.nextSibling);

  AdminPanel.unsavedChanges = true;
  showNotification("Element duplicated");
  initializeEditMode(); // Re-attach listeners
  hideFloatingToolbar();
}

function deleteElement() {
  const element = AdminPanel.currentElement;
  if (!element) return;

  if (confirm("Are you sure you want to delete this element?")) {
    element.remove();
    AdminPanel.unsavedChanges = true;
    showNotification("Element deleted");
    hideFloatingToolbar();
  }
}

function moveElementUp() {
  const element = AdminPanel.currentElement;
  if (!element) return;

  const previous = element.previousElementSibling;
  if (previous && !previous.classList.contains("add-card-btn")) {
    element.parentNode.insertBefore(element, previous);
    AdminPanel.unsavedChanges = true;
    showNotification("Element moved up");
  }
}

function moveElementDown() {
  const element = AdminPanel.currentElement;
  if (!element) return;

  const next = element.nextElementSibling;
  if (next && !next.classList.contains("add-card-btn")) {
    element.parentNode.insertBefore(next, element);
    AdminPanel.unsavedChanges = true;
    showNotification("Element moved down");
  }
}

function editSettings() {
  const element = AdminPanel.currentElement;
  if (!element) return;

  openEditPanelForCard(element);
  hideFloatingToolbar();
}

// ============================================
// EDIT PANEL
// ============================================
function openEditPanelForCard(card) {
  const panel = document.getElementById("editPanel");
  const panelBody = document.getElementById("editPanelBody");

  // Generate form based on card type
  const cardType = card.getAttribute("data-card-id") || "generic";
  let formHTML = "";

  if (card.classList.contains("feature-card")) {
    formHTML = generateFeatureCardForm(card);
  } else {
    formHTML = generateGenericForm(card);
  }

  panelBody.innerHTML = formHTML;
  panel.classList.add("active");

  // Attach save handler
  const saveBtn = panelBody.querySelector(".save-panel-changes");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveCardChanges(card, panelBody);
    });
  }
}

function generateFeatureCardForm(card) {
  const icon = card.querySelector(".feature-icon i")?.className || "";
  const title = card.querySelector(".feature-title")?.textContent || "";
  const description =
    card.querySelector(".feature-description")?.textContent || "";
  const stat = card.querySelector(".feature-stat")?.textContent || "";

  return `
        <div class="form-group">
            <label>Icon (Font Awesome class)</label>
            <input type="text" class="form-control" id="cardIcon" value="${icon}" placeholder="fas fa-trophy">
            <small style="color: var(--admin-text-secondary); font-size: 0.85rem;">
                Browse icons at <a href="https://fontawesome.com/icons" target="_blank">fontawesome.com</a>
            </small>
        </div>
        
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" id="cardTitle" value="${title}">
        </div>
        
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" id="cardDescription" rows="4">${description}</textarea>
        </div>
        
        <div class="form-group">
            <label>Stat Badge Text</label>
            <input type="text" class="form-control" id="cardStat" value="${stat}">
        </div>
        
        <div class="form-group">
            <label>Card Style</label>
            <select class="form-control" id="cardStyle">
                <option value="normal" ${
                  !card.classList.contains("featured") ? "selected" : ""
                }>Normal</option>
                <option value="featured" ${
                  card.classList.contains("featured") ? "selected" : ""
                }>Featured</option>
            </select>
        </div>
        
        <button class="btn btn-primary btn-block save-panel-changes">
            <i class="fas fa-save"></i>
            Save Changes
        </button>
    `;
}

function generateGenericForm(element) {
  return `
        <div class="form-group">
            <label>Element Content</label>
            <textarea class="form-control" id="genericContent" rows="6">${element.textContent.trim()}</textarea>
        </div>
        
        <button class="btn btn-primary btn-block save-panel-changes">
            <i class="fas fa-save"></i>
            Save Changes
        </button>
    `;
}

function saveCardChanges(card, panelBody) {
  if (card.classList.contains("feature-card")) {
    // Update icon
    const iconClass = panelBody.querySelector("#cardIcon")?.value;
    const iconElement = card.querySelector(".feature-icon i");
    if (iconElement && iconClass) {
      iconElement.className = iconClass;
    }

    // Update title
    const titleElement = card.querySelector(".feature-title");
    const titleValue = panelBody.querySelector("#cardTitle")?.value;
    if (titleElement && titleValue) {
      titleElement.textContent = titleValue;
    }

    // Update description
    const descElement = card.querySelector(".feature-description");
    const descValue = panelBody.querySelector("#cardDescription")?.value;
    if (descElement && descValue) {
      descElement.textContent = descValue;
    }

    // Update stat
    const statElement = card.querySelector(".feature-stat");
    const statValue = panelBody.querySelector("#cardStat")?.value;
    if (statElement && statValue) {
      statElement.textContent = statValue;
    }

    // Update style
    const styleValue = panelBody.querySelector("#cardStyle")?.value;
    if (styleValue === "featured") {
      card.classList.add("featured");
      if (!card.querySelector(".featured-badge")) {
        const badge = document.createElement("div");
        badge.className = "featured-badge";
        badge.textContent = "Most Popular";
        card.insertBefore(badge, card.firstChild);
      }
    } else {
      card.classList.remove("featured");
      card.querySelector(".featured-badge")?.remove();
    }
  }

  AdminPanel.unsavedChanges = true;
  closeEditPanel();
  showNotification("Card updated successfully");
}

function closeEditPanel() {
  const panel = document.getElementById("editPanel");
  panel.classList.remove("active");
}

// ============================================
// ICON PICKER
// ============================================
function openIconPicker(iconElement) {
  const popularIcons = [
    "fas fa-trophy",
    "fas fa-chess",
    "fas fa-graduation-cap",
    "fas fa-star",
    "fas fa-crown",
    "fas fa-medal",
    "fas fa-users",
    "fas fa-book",
    "fas fa-lightbulb",
    "fas fa-rocket",
    "fas fa-fire",
    "fas fa-bolt",
    "fas fa-heart",
    "fas fa-target",
    "fas fa-chart-line",
  ];

  const pickerHTML = popularIcons
    .map(
      (icon) =>
        `<button class="icon-option" onclick="selectIcon('${icon}')">
            <i class="${icon}"></i>
        </button>`
    )
    .join("");

  const panelBody = document.getElementById("editPanelBody");
  panelBody.innerHTML = `
        <div class="form-group">
            <label>Choose an Icon</label>
            <div class="icon-picker-grid">
                ${pickerHTML}
            </div>
        </div>
        
        <div class="form-group">
            <label>Or Enter Custom Icon Class</label>
            <input type="text" class="form-control" id="customIconClass" placeholder="fas fa-chess-king">
            <button class="btn btn-primary btn-block" onclick="applyCustomIcon()">
                Apply Custom Icon
            </button>
        </div>
    `;

  document.getElementById("editPanel").classList.add("active");
}

function selectIcon(iconClass) {
  const element = AdminPanel.currentElement;
  if (element) {
    const iconElement = element.querySelector("i");
    if (iconElement) {
      iconElement.className = iconClass;
      AdminPanel.unsavedChanges = true;
      showNotification("Icon updated");
      closeEditPanel();
    }
  }
}

function applyCustomIcon() {
  const customClass = document.getElementById("customIconClass")?.value;
  if (customClass) {
    selectIcon(customClass);
  }
}

// ============================================
// ADD NEW FEATURE CARD
// ============================================
function addNewFeatureCard() {
  const grid = document.querySelector(".features-grid");
  const addBtn = grid.querySelector(".add-card-btn");

  const newCard = document.createElement("div");
  newCard.className = "feature-card editable-card";
  newCard.setAttribute("data-card-id", "feature-" + Date.now());
  newCard.innerHTML = `
        <div class="feature-icon editable-icon" data-icon="star">
            <i class="fas fa-star"></i>
        </div>
        <h3 class="feature-title editable-text" contenteditable="false">
            New Feature
        </h3>
        <p class="feature-description editable-text" contenteditable="false">
            Double-click to edit this description
        </p>
        <span class="feature-stat editable-text" contenteditable="false">
            Your Stat Here
        </span>
    `;

  grid.insertBefore(newCard, addBtn);
  initializeEditMode();
  AdminPanel.unsavedChanges = true;
  showNotification("New feature card added. Double-click to edit text.");
}

// ============================================
// BLOG CREATOR
// ============================================
function initializeBlogCreator() {
  // Real-time preview updates
  const inputs = {
    title: document.getElementById("blogTitle"),
    category: document.getElementById("blogCategory"),
    difficulty: document.getElementById("blogDifficulty"),
    content: document.getElementById("blogContentEditor"),
  };

  if (inputs.title) {
    inputs.title.addEventListener("input", function () {
      document.getElementById("previewTitle").textContent =
        this.value || "Your Blog Title Appears Here";
    });
  }

  if (inputs.category) {
    inputs.category.addEventListener("change", function () {
      document.getElementById("previewCategory").textContent = this.value;
    });
  }

  if (inputs.difficulty) {
    inputs.difficulty.addEventListener("change", function () {
      document.getElementById("previewDifficulty").textContent = this.value;
    });
  }

  if (inputs.content) {
    inputs.content.addEventListener("input", function () {
      const preview = document.getElementById("previewContent");
      preview.innerHTML =
        this.innerHTML || "Start typing to see your content...";
    });
  }
}

function openBlogCreator() {
  const modal = document.getElementById("blogCreatorModal");
  modal.classList.add("active");
  AdminPanel.activeModal = "blog";
}

function closeBlogCreator() {
  const modal = document.getElementById("blogCreatorModal");
  modal.classList.remove("active");
  AdminPanel.activeModal = null;
}

function previewBlogImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewContainer = document.getElementById("blogImagePreview");
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Blog preview">`;

      const previewImage = document.getElementById("previewImage");
      previewImage.innerHTML = `<img src="${e.target.result}" alt="Blog preview" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);
  }
}

function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById("blogContentEditor").focus();
}

function insertChessBoard() {
  const editor = document.getElementById("blogContentEditor");
  const boardHTML = `
        <div class="chess-board-placeholder" style="background: #f0d9b5; padding: 2rem; text-align: center; border-radius: 8px; margin: 1rem 0;">
            <i class="fas fa-chess-board" style="font-size: 3rem; color: #b58863;"></i>
            <p style="margin-top: 0.5rem; color: #333;">Interactive Chess Board</p>
        </div>
    `;
  editor.innerHTML += boardHTML;
  showNotification("Chess board placeholder inserted");
}

function saveBlogDraft() {
  const blogData = {
    title: document.getElementById("blogTitle")?.value,
    category: document.getElementById("blogCategory")?.value,
    difficulty: document.getElementById("blogDifficulty")?.value,
    content: document.getElementById("blogContentEditor")?.innerHTML,
    tags: document.getElementById("blogTags")?.value,
    meta: document.getElementById("blogMeta")?.value,
    status: "draft",
    timestamp: new Date().toISOString(),
  };

  // Save to localStorage for now (in production, would POST to PHP backend)
  const drafts = JSON.parse(localStorage.getItem("blogDrafts") || "[]");
  drafts.push(blogData);
  localStorage.setItem("blogDrafts", JSON.stringify(drafts));

  showNotification("Blog saved as draft");
  console.log("📝 Blog draft saved:", blogData);
}

function publishBlog() {
  const blogData = {
    title: document.getElementById("blogTitle")?.value,
    category: document.getElementById("blogCategory")?.value,
    difficulty: document.getElementById("blogDifficulty")?.value,
    content: document.getElementById("blogContentEditor")?.innerHTML,
    tags: document.getElementById("blogTags")?.value,
    meta: document.getElementById("blogMeta")?.value,
    status: "published",
    timestamp: new Date().toISOString(),
  };

  if (!blogData.title || !blogData.content) {
    alert("Please fill in title and content before publishing.");
    return;
  }

  // In production, would POST to PHP backend: /api/blog/create.php
  console.log("🚀 Publishing blog:", blogData);

  // Simulate API call
  showNotification("Publishing blog post...");

  setTimeout(() => {
    showNotification("Blog post published successfully! 🎉");
    closeBlogCreator();

    // Reset form
    document.getElementById("blogTitle").value = "";
    document.getElementById("blogContentEditor").innerHTML = "";
    document.getElementById("blogTags").value = "";
    document.getElementById("blogMeta").value = "";
    document.getElementById("blogImagePreview").innerHTML = "";
    document.getElementById("previewImage").innerHTML =
      '<div class="placeholder-image"><i class="fas fa-image"></i></div>';
  }, 1500);
}

// ============================================
// TOURNAMENT CREATOR
// ============================================
function initializeTournamentCreator() {
  const inputs = {
    name: document.getElementById("tournamentName"),
    date: document.getElementById("tournamentDate"),
    time: document.getElementById("tournamentTime"),
    type: document.getElementById("tournamentType"),
    level: document.getElementById("tournamentLevel"),
    venue: document.getElementById("tournamentVenue"),
    fee: document.getElementById("tournamentFee"),
    description: document.getElementById("tournamentDescription"),
  };

  if (inputs.name) {
    inputs.name.addEventListener("input", function () {
      document.getElementById("previewTournamentTitle").textContent =
        this.value || "Tournament Name";
    });
  }

  if (inputs.date) {
    inputs.date.addEventListener("change", function () {
      const date = new Date(this.value);
      document.getElementById("previewMonth").textContent = date
        .toLocaleString("en", { month: "short" })
        .toUpperCase();
      document.getElementById("previewDay").textContent = date.getDate();
    });
  }

  if (inputs.time) {
    inputs.time.addEventListener("change", function () {
      document.getElementById("previewTime").textContent = this.value;
    });
  }

  if (inputs.type) {
    inputs.type.addEventListener("change", function () {
      document.getElementById("previewType").textContent = this.value;
    });
  }

  if (inputs.level) {
    inputs.level.addEventListener("change", function () {
      document.getElementById("previewLevel").textContent = this.value;
    });
  }

  if (inputs.venue) {
    inputs.venue.addEventListener("input", function () {
      document.getElementById("previewVenue").textContent =
        this.value || "Venue";
    });
  }

  if (inputs.fee) {
    inputs.fee.addEventListener("input", function () {
      document.getElementById("previewFee").textContent =
        "₹" + (this.value || "500");
    });
  }

  if (inputs.description) {
    inputs.description.addEventListener("input", function () {
      document.getElementById("previewTournamentDesc").textContent =
        this.value || "Description will appear here...";
    });
  }
}

function openTournamentCreator() {
  const modal = document.getElementById("tournamentCreatorModal");
  modal.classList.add("active");
  AdminPanel.activeModal = "tournament";
}

function closeTournamentCreator() {
  const modal = document.getElementById("tournamentCreatorModal");
  modal.classList.remove("active");
  AdminPanel.activeModal = null;
}

function previewTournamentBanner(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewContainer = document.getElementById(
        "tournamentBannerPreview"
      );
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Tournament banner">`;

      const previewBanner = document.getElementById("previewTournamentBanner");
      previewBanner.innerHTML = `<img src="${e.target.result}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);
  }
}

function saveTournamentDraft() {
  const tournamentData = {
    name: document.getElementById("tournamentName")?.value,
    date: document.getElementById("tournamentDate")?.value,
    time: document.getElementById("tournamentTime")?.value,
    type: document.getElementById("tournamentType")?.value,
    level: document.getElementById("tournamentLevel")?.value,
    venue: document.getElementById("tournamentVenue")?.value,
    fee: document.getElementById("tournamentFee")?.value,
    maxParticipants: document.getElementById("tournamentMaxParticipants")
      ?.value,
    description: document.getElementById("tournamentDescription")?.value,
    deadline: document.getElementById("tournamentDeadline")?.value,
    status: "draft",
    timestamp: new Date().toISOString(),
  };

  const drafts = JSON.parse(localStorage.getItem("tournamentDrafts") || "[]");
  drafts.push(tournamentData);
  localStorage.setItem("tournamentDrafts", JSON.stringify(drafts));

  showNotification("Tournament saved as draft");
  console.log("🏆 Tournament draft saved:", tournamentData);
}

function publishTournament() {
  const tournamentData = {
    name: document.getElementById("tournamentName")?.value,
    date: document.getElementById("tournamentDate")?.value,
    time: document.getElementById("tournamentTime")?.value,
    type: document.getElementById("tournamentType")?.value,
    level: document.getElementById("tournamentLevel")?.value,
    venue: document.getElementById("tournamentVenue")?.value,
    fee: document.getElementById("tournamentFee")?.value,
    maxParticipants: document.getElementById("tournamentMaxParticipants")
      ?.value,
    description: document.getElementById("tournamentDescription")?.value,
    deadline: document.getElementById("tournamentDeadline")?.value,
    status: "published",
    timestamp: new Date().toISOString(),
  };

  if (!tournamentData.name || !tournamentData.date) {
    alert("Please fill in tournament name and date before publishing.");
    return;
  }

  // In production, would POST to PHP backend: /api/tournament/create.php
  console.log("🚀 Publishing tournament:", tournamentData);

  showNotification("Publishing tournament...");

  setTimeout(() => {
    showNotification("Tournament published successfully! 🏆");
    closeTournamentCreator();

    // Reset form
    document.getElementById("tournamentName").value = "";
    document.getElementById("tournamentDate").value = "";
    document.getElementById("tournamentDescription").value = "";
  }, 1500);
}

// ============================================
// ANALYTICS DASHBOARD
// ============================================
function openAnalytics() {
  const modal = document.getElementById("analyticsModal");
  modal.classList.add("active");
  AdminPanel.activeModal = "analytics";

  // In production, would fetch real analytics data from server
  loadAnalyticsData();
}

function closeAnalytics() {
  const modal = document.getElementById("analyticsModal");
  modal.classList.remove("active");
  AdminPanel.activeModal = null;
}

function loadAnalyticsData() {
  // Simulate loading analytics
  console.log("📊 Loading analytics data...");

  // In production, would fetch from: /api/analytics/dashboard.php
  // For now, the HTML already has sample data
}

// ============================================
// PAGE MANAGER
// ============================================
function openPageManager() {
  const modal = document.getElementById("pageManagerModal");
  modal.classList.add("active");
  AdminPanel.activeModal = "pageManager";
}

function closePageManager() {
  const modal = document.getElementById("pageManagerModal");
  modal.classList.remove("active");
  AdminPanel.activeModal = null;
}

function editPage(pageName) {
  showNotification(`Loading ${pageName} for editing...`);
  closePageManager();

  // In production, would load the page content
  setTimeout(() => {
    showNotification(`${pageName} loaded. Click elements to edit.`);
  }, 1000);
}

function createNewPage() {
  const pageName = prompt('Enter new page name (e.g., "about-us"):');
  if (pageName) {
    showNotification(`Creating new page: ${pageName}.html`);

    // In production, would POST to: /api/page/create.php
    setTimeout(() => {
      showNotification("New page created successfully!");
      closePageManager();
    }, 1500);
  }
}

// ==================== SECTION RESIZE FUNCTIONALITY ====================

const ResizeManager = {
  activeSection: null,
  activeHandle: null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  startPaddingTop: 0,
  startPaddingBottom: 0,
  dimensionsDisplay: null,
  gridSnap: 20, // 20px grid

  init() {
    this.initializeSections();
    document.addEventListener("keydown", (e) => {
      // Toggle grid with 'G' key
      if (e.key === "g" || e.key === "G") {
        document.body.classList.toggle("grid-mode");
        showNotification(
          `Grid ${
            document.body.classList.contains("grid-mode")
              ? "enabled"
              : "disabled"
          }`
        );
      }
    });
  },

  initializeSections() {
    const sections = document.querySelectorAll(".editable-section");

    sections.forEach((section) => {
      // Add resize overlay
      const overlay = document.createElement("div");
      overlay.className = "resize-overlay";
      section.appendChild(overlay);

      // Add resize handles
      const handles = [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ];

      handles.forEach((position) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle ${position}`;
        handle.dataset.position = position;

        handle.addEventListener("mousedown", (e) =>
          this.startResize(e, section, position)
        );
        overlay.appendChild(handle);
      });

      // Add spacing controls
      const spacingControls = document.createElement("div");
      spacingControls.className = "section-spacing-controls";
      spacingControls.innerHTML = `
                <button class="spacing-btn" data-action="padding-increase" title="Increase Padding">
                    <i class="fas fa-expand-alt"></i>
                </button>
                <button class="spacing-btn" data-action="padding-decrease" title="Decrease Padding">
                    <i class="fas fa-compress-alt"></i>
                </button>
                <button class="spacing-btn" data-action="height-auto" title="Auto Height">
                    <i class="fas fa-arrows-alt-v"></i>
                </button>
            `;

      spacingControls.querySelectorAll(".spacing-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.handleSpacing(section, btn.dataset.action);
        });
      });

      section.appendChild(spacingControls);
    });
  },

  startResize(e, section, position) {
    e.preventDefault();
    e.stopPropagation();

    this.activeSection = section;
    this.activeHandle = position;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = section.getBoundingClientRect();
    const styles = window.getComputedStyle(section);

    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startPaddingTop = parseInt(styles.paddingTop);
    this.startPaddingBottom = parseInt(styles.paddingBottom);

    section.classList.add("resizing");

    // Create dimensions display
    this.dimensionsDisplay = document.createElement("div");
    this.dimensionsDisplay.className = "resize-dimensions";
    section.appendChild(this.dimensionsDisplay);
    this.updateDimensionsDisplay();

    document.addEventListener("mousemove", this.onResize);
    document.addEventListener("mouseup", this.stopResize);

    // Track for undo
    AdminPanel.unsavedChanges = true;
  },

  onResize: (e) => {
    if (!ResizeManager.activeSection) return;

    const deltaX = e.clientX - ResizeManager.startX;
    const deltaY = e.clientY - ResizeManager.startY;

    const section = ResizeManager.activeSection;
    const position = ResizeManager.activeHandle;

    let newWidth = ResizeManager.startWidth;
    let newHeight = ResizeManager.startHeight;
    let newPaddingTop = ResizeManager.startPaddingTop;
    let newPaddingBottom = ResizeManager.startPaddingBottom;

    // Calculate new dimensions based on handle position
    if (position.includes("right")) {
      newWidth = ResizeManager.startWidth + deltaX;
    }
    if (position.includes("left")) {
      newWidth = ResizeManager.startWidth - deltaX;
    }

    if (position.includes("bottom")) {
      newPaddingBottom = ResizeManager.startPaddingBottom + deltaY;
    }
    if (position.includes("top")) {
      newPaddingTop = ResizeManager.startPaddingTop - deltaY;
    }

    // Snap to grid if enabled
    if (document.body.classList.contains("grid-mode")) {
      newWidth =
        Math.round(newWidth / ResizeManager.gridSnap) * ResizeManager.gridSnap;
      newPaddingTop =
        Math.round(newPaddingTop / ResizeManager.gridSnap) *
        ResizeManager.gridSnap;
      newPaddingBottom =
        Math.round(newPaddingBottom / ResizeManager.gridSnap) *
        ResizeManager.gridSnap;
    }

    // Apply constraints
    newWidth = Math.max(200, Math.min(2000, newWidth));
    newPaddingTop = Math.max(0, Math.min(300, newPaddingTop));
    newPaddingBottom = Math.max(0, Math.min(300, newPaddingBottom));

    // Apply styles
    if (position.includes("left") || position.includes("right")) {
      section.style.width = `${newWidth}px`;
      section.style.maxWidth = `${newWidth}px`;
    }

    if (position.includes("top")) {
      section.style.paddingTop = `${newPaddingTop}px`;
    }

    if (position.includes("bottom")) {
      section.style.paddingBottom = `${newPaddingBottom}px`;
    }

    ResizeManager.updateDimensionsDisplay();
  },

  stopResize: () => {
    if (!ResizeManager.activeSection) return;

    ResizeManager.activeSection.classList.remove("resizing");

    // Remove dimensions display
    if (ResizeManager.dimensionsDisplay) {
      ResizeManager.dimensionsDisplay.remove();
      ResizeManager.dimensionsDisplay = null;
    }

    document.removeEventListener("mousemove", ResizeManager.onResize);
    document.removeEventListener("mouseup", ResizeManager.stopResize);

    // Save changes
    const section = ResizeManager.activeSection;
    const sectionName = section.dataset.section || "unnamed";

    if (!AdminPanel.changes[sectionName]) {
      AdminPanel.changes[sectionName] = {};
    }

    AdminPanel.changes[sectionName].width = section.style.width;
    AdminPanel.changes[sectionName].paddingTop = section.style.paddingTop;
    AdminPanel.changes[sectionName].paddingBottom = section.style.paddingBottom;

    showNotification(`Section "${sectionName}" resized`);

    ResizeManager.activeSection = null;
    ResizeManager.activeHandle = null;
  },

  updateDimensionsDisplay() {
    if (!this.dimensionsDisplay || !this.activeSection) return;

    const rect = this.activeSection.getBoundingClientRect();
    const styles = window.getComputedStyle(this.activeSection);

    this.dimensionsDisplay.textContent = `${Math.round(
      rect.width
    )}px × Padding: ${styles.paddingTop} / ${styles.paddingBottom}`;
  },

  handleSpacing(section, action) {
    const currentPadding = parseInt(
      window.getComputedStyle(section).paddingTop
    );

    switch (action) {
      case "padding-increase":
        section.style.paddingTop = `${currentPadding + 20}px`;
        section.style.paddingBottom = `${currentPadding + 20}px`;
        showNotification("Padding increased");
        break;

      case "padding-decrease":
        const newPadding = Math.max(0, currentPadding - 20);
        section.style.paddingTop = `${newPadding}px`;
        section.style.paddingBottom = `${newPadding}px`;
        showNotification("Padding decreased");
        break;

      case "height-auto":
        section.style.height = "auto";
        section.style.minHeight = "auto";
        showNotification("Height set to auto");
        break;
    }

    AdminPanel.unsavedChanges = true;
  },
};

// Initialize on load
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin Panel Initialized");
  initializeEditMode();
  initializeBlogCreator();
  initializeTournamentCreator();
  preventAccidentalExit();
  attachEventListeners();

  // Initialize Resize Manager
  ResizeManager.init();
});

// ============================================
// SAVE ALL CHANGES
// ============================================
function saveAllChanges() {
  if (
    !AdminPanel.unsavedChanges &&
    Object.keys(AdminPanel.changes).length === 0
  ) {
    showNotification("No changes to save", "info");
    return;
  }

  const saveData = {
    changes: AdminPanel.changes,
    timestamp: new Date().toISOString(),
  };

  // Show loading state
  const saveBtn = document.querySelector(".btn-save");
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  saveBtn.disabled = true;

  console.log("💾 Saving changes:", saveData);

  // In production, would POST to: /api/content/save.php
  // Example:
  /*
    fetch('/api/content/save.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(saveData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            AdminPanel.changes = {};
            AdminPanel.unsavedChanges = false;
            showNotification('All changes saved successfully! ✅');
        } else {
            showNotification('Error saving changes: ' + data.error, 'error');
        }
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    })
    .catch(error => {
        showNotification('Network error. Please try again.', 'error');
        console.error('Save error:', error);
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
    */

  // Simulate save for demo
  setTimeout(() => {
    AdminPanel.changes = {};
    AdminPanel.unsavedChanges = false;
    showNotification("All changes saved successfully! ✅");
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }, 1500);
}

// ============================================
// MODE TOGGLE
// ============================================
function attachEventListeners() {
  // Mode toggle buttons
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const mode = this.getAttribute("data-mode");
      switchMode(mode);
    });
  });

  // Close modals when clicking overlay
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeAllModals();
      }
    });
  });

  // ESC key to close modals
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
      closeEditPanel();
    }
  });
}

function switchMode(mode) {
  AdminPanel.mode = mode;

  // Update button states
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

  // Toggle edit functionality
  if (mode === "preview") {
    document.querySelectorAll(".editable-section").forEach((section) => {
      section.style.outline = "none";
    });
    hideFloatingToolbar();
    showNotification('Preview mode: Click "Edit Mode" to make changes');
  } else {
    showNotification(
      "Edit mode: Double-click text or hover over elements to edit"
    );
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = "success") {
  const notification = document.getElementById("successNotification");
  const textElement = document.getElementById("notificationText");

  textElement.textContent = message;
  notification.classList.add("show");

  // Change color based on type
  if (type === "error") {
    notification.style.background = "var(--error)";
  } else if (type === "info") {
    notification.style.background = "var(--info)";
  } else {
    notification.style.background = "var(--success)";
  }

  // Auto-hide after 4 seconds
  setTimeout(() => {
    notification.classList.remove("show");
  }, 4000);
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.classList.remove("active");
  });
  AdminPanel.activeModal = null;
}

function preventAccidentalExit() {
  window.addEventListener("beforeunload", function (e) {
    if (AdminPanel.unsavedChanges) {
      e.preventDefault();
      e.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    }
  });
}

function exitAdminMode() {
  if (AdminPanel.unsavedChanges) {
    if (!confirm("You have unsaved changes. Are you sure you want to exit?")) {
      return;
    }
  }

  showNotification("Exiting admin mode...");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// ============================================
// HELPER: CSRF Token (for production)
// ============================================
function getCsrfToken() {
  return (
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") || ""
  );
}

// ==================== IMAGE MANAGER (CLIENT-SIDE) ====================
let currentTargetImage = null;
let uploadedImagesCache = [];

function openImageManager() {
  document.getElementById("imageManagerModal").classList.add("active");
  AdminPanel.activeModal = "imageManager";
}

function closeImageManager() {
  document.getElementById("imageManagerModal").classList.remove("active");
  AdminPanel.activeModal = null;
  currentTargetImage = null;
}

// Handle image upload (client-side preview only)
document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("imageUploadInput");
  const uploadBox = document.getElementById("imageUploadBox");
  const galleryGrid = document.getElementById("imageGalleryGrid");

  if (!uploadInput) return;

  // File input change
  uploadInput.addEventListener("change", (e) => {
    handleImageFiles(e.target.files);
  });

  // Drag & drop
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "var(--admin-primary)";
    uploadBox.style.background = "var(--admin-primary-light)";
  });

  uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "";
    uploadBox.style.background = "";
  });

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "";
    uploadBox.style.background = "";
    handleImageFiles(e.dataTransfer.files);
  });

  function handleImageFiles(files) {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showNotification("Only images allowed!", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        uploadedImagesCache.push(imageUrl);

        // Add to gallery
        const card = document.createElement("div");
        card.className = "gallery-image-card";
        card.dataset.url = imageUrl;
        card.innerHTML = `
                    <img src="${imageUrl}" alt="Uploaded">
                    <div class="image-card-overlay">
                        <button onclick="selectImageForReplace(this)">
                            <i class="fas fa-check"></i> Use This
                        </button>
                        <button onclick="deleteGalleryImage(this)" style="background: #ef4444">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        galleryGrid.prepend(card);

        showNotification(`✓ ${file.name} loaded!`, "success");
      };
      reader.readAsDataURL(file);
    });
  }
});

function selectImageForReplace(button) {
  const card = button.closest(".gallery-image-card");
  const imageUrl = card.dataset.url;

  if (!currentTargetImage) {
    showNotification(
      "First click on an image on the page to replace it!",
      "error"
    );
    return;
  }

  // Replace image
  currentTargetImage.src = imageUrl;
  showNotification("✓ Image replaced!", "success");

  AdminPanel.unsavedChanges = true;
  closeImageManager();
}

function deleteGalleryImage(button) {
  const card = button.closest(".gallery-image-card");
  card.remove();
  showNotification("Image removed from gallery", "success");
}

function clearImageGallery() {
  if (!confirm("Clear all uploaded images?")) return;

  document.querySelectorAll(".gallery-image-card").forEach((card) => {
    if (!card.querySelector("img").src.includes("assets/Images")) {
      card.remove();
    }
  });
  uploadedImagesCache = [];
  showNotification("Gallery cleared", "success");
}

// Click any image on page to mark for replacement
document.addEventListener("click", (e) => {
  if (AdminPanel.mode === "edit" && e.target.tagName === "IMG") {
    // Remove previous highlights
    document.querySelectorAll("img.image-selected").forEach((img) => {
      img.classList.remove("image-selected");
    });

    // Highlight selected
    e.target.classList.add("image-selected");
    currentTargetImage = e.target;

    showNotification(
      "Image selected! Now open Image Manager to replace it.",
      "info"
    );
  }
});

// ==================== COLOR THEME MANAGER (CLIENT-SIDE) ====================
function openColorTheme() {
  document.getElementById("colorThemeModal").classList.add("active");
  AdminPanel.activeModal = "colorTheme";
}

function closeColorTheme() {
  document.getElementById("colorThemeModal").classList.remove("active");
  AdminPanel.activeModal = null;
}

function applyPresetTheme(themeName) {
  const themes = {
    professional: {
      primary: "#f59e0b",
      secondary: "#fbbf24",
    },
    vibrant: {
      primary: "#7c3aed",
      secondary: "#ec4899",
    },
    ocean: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
    },
    forest: {
      primary: "#10b981",
      secondary: "#059669",
    },
  };

  const theme = themes[themeName];
  if (!theme) return;

  // Apply CSS variables
  document.documentElement.style.setProperty("--accent-primary", theme.primary);
  document.documentElement.style.setProperty(
    "--accent-secondary",
    theme.secondary
  );

  // Update color pickers
  document.getElementById("primaryColorPicker").value = theme.primary;
  document.getElementById("primaryColorHex").value = theme.primary;
  document.getElementById("secondaryColorPicker").value = theme.secondary;
  document.getElementById("secondaryColorHex").value = theme.secondary;

  showNotification(
    `✓ ${
      themeName.charAt(0).toUpperCase() + themeName.slice(1)
    } theme applied!`,
    "success"
  );
  AdminPanel.unsavedChanges = true;
}

function applyCustomColors() {
  const primary = document.getElementById("primaryColorPicker").value;
  const secondary = document.getElementById("secondaryColorPicker").value;

  document.documentElement.style.setProperty("--accent-primary", primary);
  document.documentElement.style.setProperty("--accent-secondary", secondary);

  showNotification("✓ Custom colors applied!", "success");
  AdminPanel.unsavedChanges = true;
}

function resetThemeColors() {
  if (!confirm("Reset to default colors?")) return;

  document.documentElement.style.setProperty("--accent-primary", "#f59e0b");
  document.documentElement.style.setProperty("--accent-secondary", "#fbbf24");

  document.getElementById("primaryColorPicker").value = "#f59e0b";
  document.getElementById("primaryColorHex").value = "#f59e0b";
  document.getElementById("secondaryColorPicker").value = "#fbbf24";
  document.getElementById("secondaryColorHex").value = "#fbbf24";

  showNotification("Colors reset to default", "success");
}

// Sync color picker with hex input
document.addEventListener("DOMContentLoaded", () => {
  ["primary", "secondary"].forEach((type) => {
    const picker = document.getElementById(`${type}ColorPicker`);
    const hexInput = document.getElementById(`${type}ColorHex`);

    if (!picker || !hexInput) return;

    picker.addEventListener("input", () => {
      hexInput.value = picker.value;
    });

    hexInput.addEventListener("input", () => {
      if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
        picker.value = hexInput.value;
      }
    });
  });
});

// ============================================
// EXPORT FOR USE IN HTML
// ============================================
window.AdminPanel = AdminPanel;
window.ResizeManager = ResizeManager;
window.AdminPanel = AdminPanel;
window.openBlogCreator = openBlogCreator;
window.closeBlogCreator = closeBlogCreator;
window.openBlogCreator = openBlogCreator;
window.closeBlogCreator = closeBlogCreator;
window.openTournamentCreator = openTournamentCreator;
window.closeTournamentCreator = closeTournamentCreator;
window.openAnalytics = openAnalytics;
window.closeAnalytics = closeAnalytics;
window.openPageManager = openPageManager;
window.closePageManager = closePageManager;
window.saveAllChanges = saveAllChanges;
window.exitAdminMode = exitAdminMode;
window.editElement = editElement;
window.duplicateElement = duplicateElement;
window.deleteElement = deleteElement;
window.moveElementUp = moveElementUp;
window.moveElementDown = moveElementDown;
window.editSettings = editSettings;
window.closeEditPanel = closeEditPanel;
window.addNewFeatureCard = addNewFeatureCard;
window.previewBlogImage = previewBlogImage;
window.formatText = formatText;
window.insertChessBoard = insertChessBoard;
window.saveBlogDraft = saveBlogDraft;
window.publishBlog = publishBlog;
window.previewTournamentBanner = previewTournamentBanner;
window.saveTournamentDraft = saveTournamentDraft;
window.publishTournament = publishTournament;
window.editPage = editPage;
window.createNewPage = createNewPage;

console.log("✅ Admin Panel JavaScript Loaded Successfully");
