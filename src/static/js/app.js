/**
 * Enhanced MIL-HDBK-217F Reliability Calculator - Fixed Layout and Logic
 * Improved project-based application with better UX
 */

class EnhancedReliabilityCalculator {
  constructor() {
    this.currentProject = null;
    this.componentCounter = 0;
    this.selectedComponentType = null;
    this.globalParameters = {
      temperature: 25,
      environment: "GB",
    };
    this.capacitorStyles = [];
    this.qualityLevels = [];
    this.environments = [];
    this.currentResults = null;
    this.collapsedComponents = new Set();

    this.init();
  }

  async init() {
    try {
      await this.loadStaticData();
      this.bindEvents();
      this.showWelcomeScreen();
      console.log("Enhanced Reliability Calculator initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError(
        "Failed to initialize application. Please refresh the page."
      );
    }
  }

  async loadStaticData() {
    try {
      const [stylesResponse, qualityResponse, envResponse] = await Promise.all([
        fetch("/api/capacitor-styles"),
        fetch("/api/quality-levels"),
        fetch("/api/environments"),
      ]);

      if (!stylesResponse.ok || !qualityResponse.ok || !envResponse.ok) {
        throw new Error("Failed to load application data");
      }

      this.capacitorStyles = await stylesResponse.json();
      this.qualityLevels = await qualityResponse.json();
      this.environments = await envResponse.json();

      console.log("Static data loaded successfully");
    } catch (error) {
      console.error("Error loading static data:", error);
      throw error;
    }
  }

  bindEvents() {
    const newProjectBtn = document.getElementById("newProject");
    if (newProjectBtn) {
      newProjectBtn.addEventListener("click", () => this.createNewProject());
    }

    const openProjectBtn = document.getElementById("openProject");
    if (openProjectBtn) {
      openProjectBtn.addEventListener("click", () =>
        this.showOpenProjectDialog()
      );
    }

    const exportProjectBtn = document.getElementById("exportProject");
    if (exportProjectBtn) {
      exportProjectBtn.addEventListener("click", () => this.showExportModal());
    }

    // Project setup form
    const projectSetupForm = document.getElementById("projectSetupForm");
    if (projectSetupForm) {
      projectSetupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.setupProject();
      });
    }

    // Project info edit form
    const editProjectInfoForm = document.getElementById("editProjectInfoForm");
    if (editProjectInfoForm) {
      editProjectInfoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.updateProjectInfo();
      });
    }

    // Global parameters change events
    const globalTempInput = document.getElementById("globalTemperature");
    if (globalTempInput) {
      globalTempInput.addEventListener("change", () =>
        this.updateGlobalParameters()
      );
    }

    const globalEnvSelect = document.getElementById("globalEnvironment");
    if (globalEnvSelect) {
      globalEnvSelect.addEventListener("change", () =>
        this.updateGlobalParameters()
      );
    }

    // Modal events
    this.bindModalEvents();

    // File input for project import
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );
  }

  bindModalEvents() {
    // Close modals when clicking X or outside
    document.querySelectorAll(".modal").forEach((modal) => {
      const closeBtn = modal.querySelector(".modal-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeModal(modal.id));
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Export buttons
    document.querySelectorAll(".export-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const format = e.target.closest(".export-btn").dataset.format;
        this.exportProject(format);
      });
    });
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "n":
          e.preventDefault();
          this.createNewProject();
          break;
        case "o":
          e.preventDefault();
          this.showOpenProjectDialog();
          break;
        case "e":
          e.preventDefault();
          if (this.currentProject && this.currentResults)
            this.showExportModal();
          break;
        case "Enter":
          e.preventDefault();
          if (this.currentProject && this.selectedComponentType)
            this.calculate();
          break;
      }
    } else if (e.key === "Escape") {
      this.closeAllModals();
    }
  }

  // Screen Management
  showWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const projectSetupScreen = document.getElementById("projectSetupScreen");
    const workspaceScreen = document.getElementById("workspaceScreen");

    if (welcomeScreen) welcomeScreen.style.display = "block";
    if (projectSetupScreen) projectSetupScreen.style.display = "none";
    if (workspaceScreen) workspaceScreen.style.display = "none";
    this.updateHeaderButtons("welcome");
  }

  showProjectSetupScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const projectSetupScreen = document.getElementById("projectSetupScreen");
    const workspaceScreen = document.getElementById("workspaceScreen");

    if (welcomeScreen) welcomeScreen.style.display = "none";
    if (projectSetupScreen) projectSetupScreen.style.display = "block";
    if (workspaceScreen) workspaceScreen.style.display = "none";
    this.updateHeaderButtons("setup");
  }

  showWorkspaceScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const projectSetupScreen = document.getElementById("projectSetupScreen");
    const workspaceScreen = document.getElementById("workspaceScreen");

    if (welcomeScreen) welcomeScreen.style.display = "none";
    if (projectSetupScreen) projectSetupScreen.style.display = "none";
    if (workspaceScreen) workspaceScreen.style.display = "block";
    this.updateHeaderButtons("workspace");

    // Initialize workspace
    this.populateEnvironmentSelect();
    this.selectComponentType("capacitor"); // Auto-select capacitor
    this.updateCalculateButton();
  }

  updateHeaderButtons(screen) {
    const exportBtn = document.getElementById("exportProject");

    if (screen === "workspace" && this.currentProject) {
      if (exportBtn) exportBtn.style.display = "inline-flex";
    } else {
      if (exportBtn) exportBtn.style.display = "none";
    }
  }

  // Project Management
  createNewProject() {
    this.resetProject();
    this.showProjectSetupScreen();
    const projectNameInput = document.getElementById("projectName");
    if (projectNameInput) projectNameInput.focus();
  }

  setupProject() {
    const projectSetupForm = document.getElementById("projectSetupForm");
    if (!projectSetupForm) {
      this.showError("Project setup form not found");
      return;
    }

    const formData = new FormData(projectSetupForm);
    const projectName = formData.get("projectName");
    const projectDescription = formData.get("projectDescription");

    if (!projectName || projectName.trim() === "") {
      this.showError("Project name is required");
      return;
    }

    // Create project object
    this.currentProject = {
      id: this.generateProjectId(),
      name: projectName.trim(),
      description: projectDescription ? projectDescription.trim() : "",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: "1.1.0",
      components: [],
      globalParameters: {
        temperature: 25,
        environment: "GB",
      },
      results: null,
      selectedComponentType: "capacitor",
    };

    this.globalParameters = this.currentProject.globalParameters;
    this.selectedComponentType = this.currentProject.selectedComponentType;

    // Update display and go to workspace
    this.updateProjectInfoDisplay();
    this.showWorkspaceScreen();
    this.showSuccess(`Project "${projectName.trim()}" created successfully!`);
  }

  generateProjectId() {
    return "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  updateProjectInfoDisplay() {
    if (!this.currentProject) return;

    const display = document.getElementById("projectInfoDisplay");
    if (!display) return;

    display.innerHTML = `
      <div class="project-info-content">
        <h4>${this.currentProject.name}</h4>
        ${
          this.currentProject.description
            ? `<p class="project-description">${this.currentProject.description}</p>`
            : '<p class="project-description">No description provided</p>'
        }
        <div class="project-metadata">
          <div class="metadata-item">
            <i class="fas fa-calendar"></i>
            <span>Created: ${new Date(
              this.currentProject.createdAt
            ).toLocaleDateString()}</span>
          </div>
          <div class="metadata-item">
            <i class="fas fa-cog"></i>
            <span>Version: ${this.currentProject.version}</span>
          </div>
        </div>
      </div>
    `;
  }

  editProjectInfo() {
    if (!this.currentProject) return;

    const editProjectName = document.getElementById("editProjectName");
    const editProjectDescription = document.getElementById(
      "editProjectDescription"
    );

    if (editProjectName) editProjectName.value = this.currentProject.name || "";
    if (editProjectDescription)
      editProjectDescription.value = this.currentProject.description || "";

    this.showModal("projectInfoModal");
  }

  updateProjectInfo() {
    if (!this.currentProject) return;

    const form = document.getElementById("editProjectInfoForm");
    if (!form) return;

    const formData = new FormData(form);
    const newName = formData.get("editProjectName");
    const newDescription = formData.get("editProjectDescription");

    this.currentProject.name = newName ? newName.trim() : "Untitled Project";
    this.currentProject.description = newDescription
      ? newDescription.trim()
      : "";
    this.currentProject.modifiedAt = new Date().toISOString();

    this.updateProjectInfoDisplay();
    this.closeModal("projectInfoModal");
    this.showSuccess("Project information updated!");
  }

  resetProject() {
    this.currentProject = null;
    this.componentCounter = 0;
    this.selectedComponentType = null;
    this.globalParameters = { temperature: 25, environment: "GB" };
    this.currentResults = null;
    this.collapsedComponents.clear();
  }

  showOpenProjectDialog() {
    // Show format selection modal
    const formatModal = document.createElement("div");
    formatModal.className = "modal";
    formatModal.id = "importFormatModal";
    formatModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="fas fa-file-import"></i> Import Project</h3>
        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      </div>
      <div class="modal-body">
        <div class="export-options">
          <button class="btn btn-primary" onclick="app.selectImportFormat('json')">
            <i class="fas fa-file-code"></i> Import from JSON
          </button>
          <button class="btn btn-success" onclick="app.selectImportFormat('excel')">
            <i class="fas fa-file-excel"></i> Import from Excel
          </button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(formatModal);
    this.showModal("importFormatModal");
  }

  selectImportFormat(format) {
    this.closeModal("importFormatModal");
    const modal = document.getElementById("importFormatModal");
    if (modal) modal.remove();

    if (format === "json") {
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.click();
    } else if (format === "excel") {
      const excelInput = document.getElementById("excelFileInput");
      if (excelInput) excelInput.click();
    }
  }

  async handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import/excel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import Excel file");
      }

      const projectData = await response.json();
      await this.importProject(projectData);
    } catch (error) {
      console.error("Error importing Excel file:", error);
      this.showError("Failed to import Excel file: " + error.message);
    }

    event.target.value = "";
  }

  showCSVImportComingSoon() {
    const comingSoonMessage = document.getElementById("comingSoonMessage");
    if (comingSoonMessage) {
      comingSoonMessage.innerHTML = `
      <div class="coming-soon-icon">
        <i class="fas fa-file-csv"></i>
      </div>
      <h3>CSV Import</h3>
      <p>CSV import functionality is currently under development and will be available in a future update.</p>
      <p>Please use JSON files for importing projects!</p>
    `;
    }
    this.showModal("comingSoonModal");
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.name.endsWith(".csv")) {
      this.showCSVImportComingSoon();
      event.target.value = ""; // Reset file input
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let projectData;

        if (file.name.endsWith(".json")) {
          projectData = JSON.parse(e.target.result);
        } else {
          throw new Error(
            "Unsupported file format. Please use JSON or CSV files."
          );
        }

        this.importProject(projectData);
      } catch (error) {
        console.error("Error loading project file:", error);
        this.showError("Failed to load project file: " + error.message);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  async importProject(projectData) {
    this.currentProject = {
      ...projectData,
      id: projectData.id || this.generateProjectId(),
      modifiedAt: new Date().toISOString(),
    };

    this.globalParameters = this.currentProject.globalParameters || {
      temperature: 25,
      environment: "GB",
    };
    this.selectedComponentType =
      this.currentProject.selectedComponentType || "capacitor";
    this.currentResults = this.currentProject.results || null;

    this.updateProjectInfoDisplay();
    this.showWorkspaceScreen();

    // Auto-populate global parameters
    this.updateGlobalParametersUI();

    // Restore components if any
    if (
      this.currentProject.components &&
      this.currentProject.components.length > 0
    ) {
      this.restoreComponents(this.currentProject.components);

      // If project has results and components, auto-calculate to restore results
      if (this.currentResults) {
        setTimeout(() => {
          this.displayResults(this.currentResults);
        }, 500);
      } else {
        // Auto-calculate if components exist but no results
        setTimeout(() => {
          this.calculate();
        }, 1000);
      }
    } else {
      // Add first component if no components exist
      this.addComponent();
    }

    this.showSuccess("Project imported successfully!");
  }

  // Component Type Selection
  selectComponentType(type) {
    this.selectedComponentType = type;

    // Update UI to show selected type
    document.querySelectorAll(".component-type-mini-card").forEach((card) => {
      card.classList.remove("active");
      if (card.dataset.type === type) {
        card.classList.add("active");
      }
    });

    // Enable calculate button if components exist
    this.updateCalculateButton();

    // Store in current project
    if (this.currentProject) {
      this.currentProject.selectedComponentType = type;
      this.currentProject.modifiedAt = new Date().toISOString();
    }
  }

  showComingSoon(componentType) {
    const comingSoonMessage = document.getElementById("comingSoonMessage");
    if (comingSoonMessage) {
      comingSoonMessage.innerHTML = `
        <div class="coming-soon-icon">
          <i class="fas fa-tools"></i>
        </div>
        <h3>${componentType}</h3>
        <p>This component type is currently under development and will be available in a future update.</p>
        <p>Stay tuned for more component types!</p>
      `;
    }
    this.showModal("comingSoonModal");
  }

  // Global Parameters
  populateEnvironmentSelect() {
    const select = document.getElementById("globalEnvironment");
    if (!select || select.options.length > 1) return;

    select.innerHTML = '<option value="">Select Environment...</option>';
    this.environments.forEach((env) => {
      const option = document.createElement("option");
      option.value = env.environment;
      option.textContent = `${env.environment} (πE: ${env.pi_e})`;
      option.selected = env.environment === this.globalParameters.environment;
      select.appendChild(option);
    });
  }

  updateGlobalParameters() {
    const temperatureInput = document.getElementById("globalTemperature");
    const environmentSelect = document.getElementById("globalEnvironment");

    if (!temperatureInput || !environmentSelect) return;

    const temperature = parseFloat(temperatureInput.value);
    const environment = environmentSelect.value;

    if (!isNaN(temperature)) {
      this.globalParameters.temperature = temperature;
    }

    if (environment) {
      this.globalParameters.environment = environment;
    }

    // Update project if exists
    if (this.currentProject) {
      this.currentProject.globalParameters = { ...this.globalParameters };
      this.currentProject.modifiedAt = new Date().toISOString();
    }

    console.log("Global parameters updated:", this.globalParameters);
  }

  updateGlobalParametersUI() {
    const temperatureInput = document.getElementById("globalTemperature");
    const environmentSelect = document.getElementById("globalEnvironment");

    if (temperatureInput) {
      temperatureInput.value = this.globalParameters.temperature;
    }

    if (environmentSelect) {
      // Make sure environment options are populated first
      if (
        environmentSelect.options.length <= 1 &&
        this.environments.length > 0
      ) {
        this.populateEnvironmentSelect();
      }

      // Set the selected value
      if (this.globalParameters.environment) {
        environmentSelect.value = this.globalParameters.environment;
      }
    }

    console.log("Global parameters UI updated:", this.globalParameters);
  }

  // Component Management
  addComponent() {
    if (!this.selectedComponentType) {
      this.showError("Please select a component type first");
      return;
    }

    const container = document.getElementById("componentsContainer");
    if (!container) {
      console.error("Components container not found");
      return;
    }

    this.componentCounter++;

    const componentForm = document.createElement("div");
    componentForm.className = "component-form";
    componentForm.dataset.componentId = this.componentCounter;

    componentForm.innerHTML = this.generateComponentHTML(this.componentCounter);
    container.appendChild(componentForm);

    // Animate appearance
    componentForm.style.opacity = "0";
    componentForm.style.transform = "translateY(20px)";

    requestAnimationFrame(() => {
      componentForm.style.transition = "all 0.3s ease-out";
      componentForm.style.opacity = "1";
      componentForm.style.transform = "translateY(0)";
    });

    this.updateCalculateButton();

    // Scroll to new component
    setTimeout(() => {
      componentForm.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 350);
  }

  generateComponentHTML(id) {
    const isCollapsed = this.collapsedComponents.has(id);

    return `
      <div class="component-header">
        <h3 class="component-title">
          <i class="fas fa-microchip"></i>
          ${
            this.selectedComponentType?.charAt(0).toUpperCase() +
            this.selectedComponentType?.slice(1)
          } ${id}
        </h3>
        <div class="component-actions">
          <button type="button" class="component-toggle" onclick="app.toggleComponent(${id})">
            <i class="fas fa-${
              isCollapsed ? "chevron-down" : "chevron-up"
            }"></i>
          </button>
          <button type="button" class="remove-component" onclick="app.removeComponent(${id})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="component-content ${isCollapsed ? "collapsed" : ""}">
        <div class="form-grid">
          <div class="form-group">
            <label for="description_${id}">Description *</label>
            <input type="text" id="description_${id}" required placeholder="e.g., Main filter capacitor">
          </div>
          
          <div class="form-group">
            <label for="manufacturer_${id}">Manufacturer</label>
            <input type="text" id="manufacturer_${id}" placeholder="e.g., Vishay, Murata, TDK">
          </div>
          
          <div class="form-group">
            <label for="part_number_${id}">Part Number</label>
            <input type="text" id="part_number_${id}" placeholder="e.g., VJ1206Y104KXJPW1BC">
          </div>
          
          <div class="form-group">
            <label for="style_${id}">Capacitor Style *</label>
            <select id="style_${id}" required>
              <option value="">Select Style...</option>
              ${this.capacitorStyles
                .map(
                  (style) => `
                <option value="${style.style}" title="${style.description}">
                  ${style.style} - ${style.spec_number} (λb: ${style.lambda_b})
                </option>
              `
                )
                .join("")}
            </select>
          </div>
          
          <div class="form-group">
            <label for="capacitance_${id}">Capacitance (μF) *</label>
            <input type="number" id="capacitance_${id}" step="0.000001" value="1.0" required placeholder="Capacitance value">
          </div>
          
          <div class="form-group">
            <label for="voltage_stress_${id}">Voltage Stress Ratio (S) *</label>
            <input type="number" id="voltage_stress_${id}" step="0.01" min="0" max="1.5" value="0.5" required placeholder="0.0 to 1.5">
            <small>Operating voltage / Rated voltage</small>
          </div>
          
          <div class="form-group">
            <label for="quality_${id}">Quality Level *</label>
            <select id="quality_${id}" required>
              ${this.qualityLevels
                .map(
                  (quality) => `
                <option value="${quality.quality_level}" ${
                    quality.quality_level === "M" ? "selected" : ""
                  }>
                  ${quality.quality_level} (πQ: ${quality.pi_q})
                </option>
              `
                )
                .join("")}
            </select>
          </div>
          
          <div class="form-group">
            <label for="series_resistance_${id}">Series Resistance (Ω)</label>
            <input type="number" id="series_resistance_${id}" step="0.01" value="1" placeholder="For tantalum capacitors">
            <small>Only applicable to tantalum capacitors</small>
          </div>
        </div>
      </div>
    `;
  }

  toggleComponent(componentId) {
    const content = document.querySelector(
      `[data-component-id="${componentId}"] .component-content`
    );
    const icon = document.querySelector(
      `[data-component-id="${componentId}"] .component-toggle i`
    );

    if (!content || !icon) return;

    if (content.classList.contains("collapsed")) {
      content.classList.remove("collapsed");
      icon.className = "fas fa-chevron-up";
      this.collapsedComponents.delete(componentId);
    } else {
      content.classList.add("collapsed");
      icon.className = "fas fa-chevron-down";
      this.collapsedComponents.add(componentId);
    }
  }

  removeComponent(componentId) {
    const component = document.querySelector(
      `[data-component-id="${componentId}"]`
    );
    if (component) {
      component.style.transition = "all 0.3s ease-out";
      component.style.opacity = "0";
      component.style.transform = "translateY(-20px)";

      setTimeout(() => {
        component.remove();
        this.collapsedComponents.delete(componentId);
        this.updateCalculateButton();
      }, 300);
    }
  }

  updateCalculateButton() {
    const components = document.querySelectorAll(".component-form");
    const calculateButton = document.getElementById("calculateButton");

    if (!calculateButton) return;

    const hasComponents = components.length > 0;
    const hasSelectedType = this.selectedComponentType !== null;

    if (!hasComponents || !hasSelectedType) {
      calculateButton.disabled = true;
      calculateButton.innerHTML = hasSelectedType
        ? '<i class="fas fa-exclamation"></i> No Components'
        : '<i class="fas fa-exclamation"></i> Select Component Type';
    } else {
      calculateButton.disabled = false;
      calculateButton.innerHTML =
        '<i class="fas fa-play"></i> Calculate Reliability';
    }
  }

  getComponentsData() {
    const components = [];
    const componentForms = document.querySelectorAll(".component-form");

    componentForms.forEach((form) => {
      const id = form.dataset.componentId;

      const component = {
        project_name: this.currentProject?.name || "Unknown Project",
        name: `${
          this.selectedComponentType?.charAt(0).toUpperCase() +
          this.selectedComponentType?.slice(1)
        }_${id}`, // Ubah ini
        description: document.getElementById(`description_${id}`)?.value || "",
        manufacturer:
          document.getElementById(`manufacturer_${id}`)?.value || "",
        part_number: document.getElementById(`part_number_${id}`)?.value || "",
        style: document.getElementById(`style_${id}`)?.value || "",
        temperature: this.globalParameters.temperature,
        capacitance:
          parseFloat(document.getElementById(`capacitance_${id}`)?.value) ||
          1.0,
        voltage_stress:
          parseFloat(document.getElementById(`voltage_stress_${id}`)?.value) ||
          0.5,
        quality_level: document.getElementById(`quality_${id}`)?.value || "M",
        environment: this.globalParameters.environment,
        series_resistance:
          parseFloat(
            document.getElementById(`series_resistance_${id}`)?.value
          ) || 1,
      };

      components.push(component);
    });

    return components;
  }

  restoreComponents(components) {
    const container = document.getElementById("componentsContainer");
    if (!container) return;

    container.innerHTML = "";
    this.componentCounter = 0;

    components.forEach((comp, index) => {
      this.addComponent();
      const id = this.componentCounter;

      // Fill in the data
      const descInput = document.getElementById(`description_${id}`);
      const manuInput = document.getElementById(`manufacturer_${id}`);
      const partInput = document.getElementById(`part_number_${id}`);
      const styleSelect = document.getElementById(`style_${id}`);
      const capInput = document.getElementById(`capacitance_${id}`);
      const voltInput = document.getElementById(`voltage_stress_${id}`);
      const qualitySelect = document.getElementById(`quality_${id}`);
      const resInput = document.getElementById(`series_resistance_${id}`);

      if (descInput) descInput.value = comp.description || comp.name || "";
      if (manuInput) manuInput.value = comp.manufacturer || "";
      if (partInput) partInput.value = comp.part_number || "";
      if (styleSelect) styleSelect.value = comp.style || "";
      if (capInput) capInput.value = comp.capacitance || 1.0;
      if (voltInput) voltInput.value = comp.voltage_stress || 0.5;
      if (qualitySelect) qualitySelect.value = comp.quality_level || "M";
      if (resInput) resInput.value = comp.series_resistance || 1;
    });
  }

  // Calculation
  async calculate() {
    if (!this.selectedComponentType) {
      this.showError("Please select a component type first");
      return;
    }

    // Update global parameters from UI before calculation
    this.updateGlobalParameters();

    const components = this.getComponentsData();

    if (components.length === 0) {
      this.showError("Please add at least one component before calculating.");
      return;
    }

    const validationErrors = this.validateComponents(components);
    if (validationErrors.length > 0) {
      this.showError(
        "Please fix the following errors:\n" + validationErrors.join("\n")
      );
      return;
    }

    this.showLoading(true);
    this.hideResults();

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ components }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Calculation failed");
      }

      const results = await response.json();
      this.currentResults = results;
      this.displayResults(results);

      // Update project with results and components
      if (this.currentProject) {
        this.currentProject.results = results;
        this.currentProject.components = components;
        this.currentProject.modifiedAt = new Date().toISOString();
      }

      this.showSuccess("Calculation completed successfully!");
    } catch (error) {
      console.error("Calculation error:", error);
      this.showError("Calculation failed: " + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  validateComponents(components) {
    const errors = [];

    components.forEach((component, index) => {
      const componentNum = index + 1;

      if (!component.name || !component.description) {
        errors.push(`Component ${componentNum}: Description is required`);
      }

      if (!component.style) {
        errors.push(
          `Component ${componentNum}: Please select a capacitor style`
        );
      }

      if (component.capacitance <= 0) {
        errors.push(
          `Component ${componentNum}: Capacitance must be greater than 0`
        );
      }

      if (component.voltage_stress < 0 || component.voltage_stress > 1.5) {
        errors.push(
          `Component ${componentNum}: Voltage stress ratio should be between 0 and 1.5`
        );
      }

      if (!component.quality_level) {
        errors.push(`Component ${componentNum}: Please select a quality level`);
      }

      if (!component.environment) {
        errors.push(`Component ${componentNum}: Environment is required`);
      }
    });

    return errors;
  }

  displayResults(results) {
    const container = document.getElementById("resultsContainer");
    if (!container) return;

    const summaryHtml = `
      <div class="results-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">${results.total_lambda_p}</div>
            <div class="summary-label">Total λP (failures/10⁶ hrs)</div>
          </div>
          
          <div class="summary-item">
            <div class="summary-value">${results.components.length}</div>
            <div class="summary-label">Components Analyzed</div>
          </div>
          
          <div class="summary-item">
            <div class="summary-value">${this.globalParameters.temperature}°C</div>
            <div class="summary-label">Operating Temperature</div>
          </div>
          
          <div class="summary-item">
            <div class="summary-value">${this.globalParameters.environment}</div>
            <div class="summary-label">Environment</div>
          </div>
        </div>
      </div>
    `;

    const tableHtml = `
      <div class="results-table">
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Description</th>
              <th>Style</th>
              <th>λb</th>
              <th>πT</th>
              <th>πC</th>
              <th>πV</th>
              <th>πQ</th>
              <th>πE</th>
              <th>πSR</th>
              <th>λP</th>
            </tr>
          </thead>
          <tbody>
            ${results.components
              .map(
                (comp) => `
              <tr>
                <td><strong>${comp.name}</strong></td>
                <td>${comp.parameters.description || ""}</td>
                <td>${comp.style}</td>
                <td>${comp.lambda_b}</td>
                <td>${comp.pi_t}</td>
                <td>${comp.pi_c}</td>
                <td>${comp.pi_v}</td>
                <td>${comp.pi_q}</td>
                <td>${comp.pi_e}</td>
                <td>${comp.pi_sr}</td>
                <td><strong>${comp.lambda_p}</strong></td>
              </tr>
            `
              )
              .join("")}
            <tr style="border-top: 2px solid var(--primary-color); background: rgba(37, 99, 235, 0.1);">
              <td colspan="10"><strong>TOTAL SYSTEM</strong></td>
              <td><strong>${results.total_lambda_p}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const parametersHtml = `
      <div class="parameters-section" style="margin-top: 2rem;">
        <h3 style="margin-bottom: 1rem; color: var(--primary-color);">
          <i class="fas fa-cogs"></i> Component Details
        </h3>
        <div class="results-table">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Manufacturer</th>
                <th>Part Number</th>
                <th>Capacitance</th>
                <th>Voltage Stress</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody>
              ${results.components
                .map(
                  (comp) => `
                <tr>
                  <td><strong>${comp.name}</strong></td>
                  <td>${comp.parameters.manufacturer || "N/A"}</td>
                  <td>${comp.parameters.part_number || "N/A"}</td>
                  <td>${comp.parameters.capacitance} μF</td>
                  <td>${comp.parameters.voltage_stress}</td>
                  <td>${comp.parameters.quality_level}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = summaryHtml + tableHtml + parametersHtml;
    container.style.display = "block";

    // Animate results appearance
    container.style.opacity = "0";
    container.style.transform = "translateY(20px)";

    requestAnimationFrame(() => {
      container.style.transition = "all 0.5s ease-out";
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
    });

    // Scroll to results
    setTimeout(() => {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 600);
  }

  showLoading(show) {
    const indicator = document.getElementById("loadingIndicator");
    const button = document.getElementById("calculateButton");

    if (indicator) {
      indicator.style.display = show ? "flex" : "none";
    }

    if (button) {
      button.disabled = show;
      button.innerHTML = show
        ? '<i class="fas fa-spinner fa-spin"></i> Calculating...'
        : '<i class="fas fa-play"></i> Calculate Reliability';
    }
  }

  hideResults() {
    const container = document.getElementById("resultsContainer");
    if (container) container.style.display = "none";
  }

  // Export Functions
  showExportModal() {
    if (!this.currentProject || !this.currentResults) {
      this.showError("Please calculate results before exporting.");
      return;
    }
    this.showModal("exportModal");
  }
  showCSVComingSoon() {
    const comingSoonMessage = document.getElementById("comingSoonMessage");
    if (comingSoonMessage) {
      comingSoonMessage.innerHTML = `
      <div class="coming-soon-icon">
        <i class="fas fa-file-csv"></i>
      </div>
      <h3>CSV Export</h3>
      <p>CSV export functionality is currently under development and will be available in a future update.</p>
      <p>Please use JSON export for now!</p>
    `;
    }
    this.showModal("comingSoonModal");
  }

  async exportProject(format) {
    if (!this.currentProject) {
      this.showError("No project to export");
      return;
    }

    try {
      let content, filename, contentType;

      switch (format) {
        case "json":
          content = JSON.stringify(this.currentProject, null, 2);
          filename = `${this.sanitizeFilename(
            this.currentProject.name
          )}_${this.getTimestamp()}.json`;
          contentType = "application/json";
          this.downloadFile(content, filename, contentType);
          break;

        case "excel":
          await this.exportExcel();
          break;

        default:
          throw new Error("Unsupported export format");
      }

      this.closeModal("exportModal");
      if (format !== "excel") {
        this.showSuccess(
          `Project exported successfully as ${format.toUpperCase()}!`
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      this.showError("Failed to export project: " + error.message);
    }
  }

  async exportExcel() {
    try {
      const response = await fetch("/api/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project: this.currentProject }),
      });

      if (!response.ok) {
        throw new Error("Failed to export Excel file");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${this.sanitizeFilename(
        this.currentProject.name
      )}_${this.getTimestamp()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showSuccess("Project exported successfully as Excel!");
    } catch (error) {
      console.error("Excel export error:", error);
      throw error;
    }
  }

  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getTimestamp() {
    const now = new Date();
    return (
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0")
    );
  }

  // Modal Management
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = "block";
    modal.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      modal.style.opacity = "1";
    });
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.opacity = "0";

    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    }, 300);
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (modal.style.display === "block") {
        this.closeModal(modal.id);
      }
    });
  }

  // Utility Functions
  showError(message) {
    const modal = document.getElementById("errorModal");
    const messageElement = document.getElementById("errorMessage");

    if (messageElement) {
      messageElement.innerHTML = `<p style="color: var(--error-color); font-size: 1rem; line-height: 1.6; white-space: pre-line;">${message}</p>`;
    }

    this.showModal("errorModal");
  }

  showSuccess(message) {
    const notification = document.createElement("div");
    notification.className = "success-notification";
    notification.innerHTML = `
      <div style="background: linear-gradient(135deg, var(--success-color), #047857); 
                  color: white; 
                  padding: 1rem 1.5rem; 
                  border-radius: var(--radius-lg); 
                  box-shadow: 0 10px 30px rgba(5, 150, 105, 0.3);
                  display: flex; 
                  align-items: center; 
                  gap: 0.5rem;
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 1001;
                  animation: slideInRight 0.3s ease-out;">
          <i class="fas fa-check-circle"></i>
          ${message}
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Global app instance
let app;

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const startTime = performance.now();

  app = new EnhancedReliabilityCalculator();

  const loadTime = performance.now() - startTime;
  console.log(`Enhanced application loaded in ${loadTime.toFixed(2)}ms`);
});

// Global functions for HTML onclick handlers
window.app = {
  // Component management
  removeComponent: function (componentId) {
    if (app) app.removeComponent(componentId);
  },

  toggleComponent: function (componentId) {
    if (app) app.toggleComponent(componentId);
  },

  // Navigation
  createNewProject: function () {
    if (app) app.createNewProject();
  },

  showWelcomeScreen: function () {
    if (app) app.showWelcomeScreen();
  },

  showOpenProjectDialog: function () {
    if (app) app.showOpenProjectDialog();
  },

  // Component type selection
  selectComponentType: function (type) {
    if (app) app.selectComponentType(type);
  },

  showComingSoon: function (componentType) {
    if (app) app.showComingSoon(componentType);
  },

  // Component management
  addComponent: function () {
    if (app) app.addComponent();
  },

  // Project management
  editProjectInfo: function () {
    if (app) app.editProjectInfo();
  },

  // Calculation
  calculate: function () {
    if (app) app.calculate();
  },

  // Modal management
  closeModal: function (modalId) {
    if (app) app.closeModal(modalId);
  },

  // File handling
  handleFileSelect: function (event) {
    if (app) app.handleFileSelect(event);
  },

  // Export functions
  showExportModal: function () {
    if (app) app.showExportModal();
  },

  resetApplication: function () {
    if (app) {
      app.resetProject();
      app.showWelcomeScreen();
    }
  },

  selectImportFormat: function (format) {
    if (app) app.selectImportFormat(format);
  },

  handleExcelFileSelect: function (event) {
    if (app) app.handleExcelFileSelect(event);
  },
};

// Global error handlers
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  if (window.app && app.showError) {
    app.showError("An unexpected error occurred. Please try again.");
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  if (window.app && app.showError) {
    app.showError("A network error occurred. Please check your connection.");
  }
});
