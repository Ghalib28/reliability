# =============================================================================

# DEVELOPER NOTE: Adding New Component Types

# File: src\app.py, in the database initialization

# =============================================================================

=======================================

### Examples of component types

=======================================

# To add new component types (Resistors, Inductors, Diodes, etc.):

#

# 1. Create new database tables in init_db.py:

# - component_styles table (similar to capacitor_styles)

# - component-specific factor tables (temperature, power, etc.)

#

# 2. Add calculation logic in calculate_component_reliability() function below

# - Follow the capacitor calculation pattern

# - Use appropriate MIL-HDBK-217F formulas for each component type

#

# 3. Update frontend in app.js:

# - Add component type in selectComponentType() function

# - Create generateComponentHTML() variant for new component

# - Update getComponentsData() to handle new parameters

#

# 4. Update static/css/styles.css:

# - Add component icons and styling if needed

#

# Current implemented components: Capacitors only

# =============================================================================

# File: src\app.py: in the function calculate_component_reliability()

def calculate_component_reliability(conn, component):
"""
Calculate reliability for a single component with enhanced parameters

    DEVELOPER NOTE: Component Type Extension Point
    =============================================
    This function currently only handles CAPACITORS.

    To add new component types:
    1. Add component type detection (check component.get('component_type'))
    2. Create separate calculation functions:
       - calculate_resistor_reliability()
       - calculate_inductor_reliability()
       - calculate_diode_reliability()
    3. Each function should follow MIL-HDBK-217F specific formulas
    4. Return same dictionary structure for consistency

    Example structure:
        component_type = component.get('component_type', 'capacitor')
        if component_type == 'capacitor':
            return calculate_capacitor_reliability(conn, component)
        elif component_type == 'resistor':
            return calculate_resistor_reliability(conn, component)
        # ... add more component types

    Current formula (Capacitor):
    λP = λb × πT × πC × πV × πQ × πE × πSR
    """
    try:
        # Current capacitor-only implementation
        # ... existing code ...

# File: src/database/init_db.py,

#!/usr/bin/env python3
"""
Database initialization script for MIL-HDBK-217F Reliability Prediction
Creates SQLite database with capacitor reliability data

=============================================================================
DEVELOPER NOTE: Adding New Component Types to Database
=============================================================================
Current Implementation: CAPACITORS ONLY

To add new component types (Resistors, Inductors, etc.), follow these steps:

## STEP 1: Create Component-Specific Tables

Add new functions similar to:

- populate_resistor_styles()
- populate_resistor_factors()
- populate_inductor_styles()
- populate_inductor_factors()

## STEP 2: Define Table Schema

Create tables following this pattern:

## STEP 3: Add Data Population in create_database()

---

Call your new populate functions:

## STEP 4: Reference MIL-HDBK-217F Documentation

---

- Use Section 9 for Resistors
- Use Section 11 for Inductors
- Use Section 6 for Diodes and Transistors
- Extract data from official MIL-HDBK-217F tables

Current Tables:

- capacitor_styles
- temperature_factors
- capacitance_factors
- voltage_stress_factors
- quality_factors
- environment_factors
- # series_resistance_factors
  =============================================================================
  """

# File: src/static/js/app.js, in the class constructor

class EnhancedReliabilityCalculator {
constructor() {
// ==========================================================================
// DEVELOPER NOTE: Component Type System
// ==========================================================================
// Current implementation supports CAPACITORS only.
//
// To add new component types:
// 1. Add to this.availableComponentTypes array
// 2. Create generateXXXComponentHTML() function (copy from generateComponentHTML)
// 3. Update selectComponentType() to enable new type
// 4. Update getComponentsData() to collect component-specific parameters
// 5. Update backend API endpoint to handle new component calculations
//
// Component type structure:
// {
// type: 'resistor',
// name: 'Resistors',
// available: true, // set to true when implemented
// formula: 'λP = λb × πT × πP × πQ × πE',
// parameters: ['power', 'temperature', 'quality', 'environment']
// }
// ==========================================================================

    this.currentProject = null;
    this.componentCounter = 0;
    this.selectedComponentType = null; // Currently: 'capacitor' only

================================================================================
================# Developer Guide - Adding New Component Types==================
================================================================================

## Overview

This application currently implements **Capacitor** reliability calculations based on MIL-HDBK-217F standard. This guide explains how to add new component types (Resistors, Inductors, Semiconductors, etc.).

## Architecture

### Current Implementation

- **Component Type**: Capacitors only
- **Formula**: λP = λb × πT × πC × πV × πQ × πE × πSR
- **Database Tables**: capacitor_styles, temperature_factors, capacitance_factors, voltage_stress_factors
- **Frontend**: Capacitor-specific form in `app.js`

## Step-by-Step Guide to Add New Components

=======================================

### Examples of component types

=======================================

### 1. Database Setup (`database/init_db.py`)

    1.1 Create Component Style Table

    ```python
    def create_resistor_tables(cursor):

    ```

### 2. Backend Calculation (app.py)

2.1 Create Component-Specific Calculation Function
pythondef calculate_resistor_reliability(conn, component):
"""
Calculate resistor reliability using MIL-HDBK-217F Section 9
Formula: λP = λb × πT × πP × πQ × πE
""" # Implementation here
pass

    2.2 Update Main Calculation Router
    python def calculate_component_reliability(conn, component):
    component_type = component.get('component_type', 'capacitor')

    if component_type == 'capacitor':
        return calculate_capacitor_reliability(conn, component)
    elif component_type == 'resistor':
        return calculate_resistor_reliability(conn, component)
    # Add more types...

### 3. Frontend Implementation (static/js/app.js)

    3.1 Enable Component Type
    javascriptshowComingSoon(componentType) {
    // Remove this function call and implement:
    if (componentType === 'resistor') {
    this.selectComponentType('resistor');
    }
    }

    3.2 Create Component Form Generator
    javascriptgenerateResistorHTML(id) {
    return `  <div class="component-header">...</div>
    <div class="component-content">
        <!-- Resistor-specific fields -->
        <input id="power_rating_${id}" ...>
        <input id="resistance_value_${id}" ...>
        ...
    </div>`;
    }

    3.3 Update Data Collection
    javascriptgetComponentsData() {
    if (this.selectedComponentType === 'resistor') {
    return this.getResistorData();
    }
    // ... existing capacitor logic
    }

### 4. Styling (static/css/styles.css)

    Add component-specific styles if needed:
    css.component-type-card[data-type="resistor"] .card-icon {
    /_ Custom resistor icon styling _/
    }

# Key Files to Modify:

# - database/init_db.py (add tables and data)

# - app.py (add calculation functions)

# - static/js/app.js (add form generators)

# - templates/index.html (update component selection)
