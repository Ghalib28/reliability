#!/usr/bin/env python3
"""
Database initialization script for MIL-HDBK-217F Reliability Prediction
Creates SQLite database with capacitor reliability data
"""

import sqlite3
import os
import math

def create_database():
    db_path = os.path.join(os.path.dirname(__file__), 'mil_hdbk_217.db')
    
    # Remove existing database
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    create_tables(cursor)
    
    # Populate tables with data from MIL-HDBK-217F images
    populate_capacitor_styles(cursor)
    populate_temperature_factors(cursor)
    populate_capacitance_factors(cursor)
    populate_voltage_stress_factors(cursor)
    populate_quality_factors(cursor)
    populate_environment_factors(cursor)
    
    # Setelah populate_environment_factors(cursor)
    populate_resistor_styles(cursor)
    populate_resistor_temperature_factors(cursor)
    populate_resistor_power_factors(cursor)
    populate_resistor_stress_factors(cursor)
    populate_resistor_quality_factors(cursor)
    populate_resistor_environment_factors(cursor)

    populate_inductor_styles(cursor)
    populate_inductor_temperature_factors(cursor)
    populate_inductor_quality_factors(cursor)
    populate_inductor_environment_factors(cursor)

    conn.commit()
    conn.close()
    print(f"Database created successfully at: {db_path}")

def create_tables(cursor):
    """Create all necessary tables"""
     # Capacitor styles table
    cursor.execute('''
    CREATE TABLE capacitor_styles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        style TEXT NOT NULL,
        spec_number TEXT,
        description TEXT,
        lambda_b REAL NOT NULL,
        pi_t_column INTEGER,
        pi_c_column INTEGER,
        pi_v_column INTEGER,
        pi_sr REAL DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Temperature factor table
    cursor.execute('''
    CREATE TABLE temperature_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature INTEGER NOT NULL,
        column_1 REAL,
        column_2 REAL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Capacitance factor table
    cursor.execute('''
    CREATE TABLE capacitance_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        capacitance REAL NOT NULL,
        column_1 REAL,
        column_2 REAL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Voltage stress factor table
    cursor.execute('''
    CREATE TABLE voltage_stress_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voltage_stress REAL NOT NULL,
        column_1 REAL,
        column_2 REAL,
        column_3 REAL,
        column_4 REAL,
        column_5 REAL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Quality factor table
    cursor.execute('''
    CREATE TABLE quality_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quality_level TEXT NOT NULL,
        pi_q REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Environment factor table
    cursor.execute('''
    CREATE TABLE environment_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        environment TEXT NOT NULL,
        pi_e REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Series resistance factor table
    cursor.execute('''
    CREATE TABLE series_resistance_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resistance_range TEXT NOT NULL,
        pi_sr REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')
    
    # Enhanced calculations history table (not used for results storage anymore)
    cursor.execute('''
    CREATE TABLE calculations_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT,
        component_name TEXT,
        style TEXT,
        lambda_b REAL,
        pi_t REAL,
        pi_c REAL,
        pi_v REAL,
        pi_q REAL,
        pi_e REAL,
        pi_sr REAL DEFAULT 1.0,
        lambda_p REAL,
        temperature REAL,
        capacitance REAL,
        voltage_stress REAL,
        quality_level TEXT,
        environment TEXT,
        series_resistance REAL,
        description TEXT,
        manufacturer TEXT,
        part_number TEXT,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

        # Resistor styles table
    cursor.execute('''
    CREATE TABLE resistor_styles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        style TEXT NOT NULL,
        spec_number TEXT,
        description TEXT,
        lambda_b REAL NOT NULL,
        pi_t_column INTEGER,
        pi_s_column INTEGER,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Resistor temperature factor table
    cursor.execute('''
    CREATE TABLE resistor_temperature_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature INTEGER NOT NULL,
        column_1 REAL,
        column_2 REAL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Resistor power factor table
    cursor.execute('''
    CREATE TABLE resistor_power_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        power_dissipation REAL NOT NULL,
        pi_p REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Resistor stress factor table
    cursor.execute('''
    CREATE TABLE resistor_stress_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        power_stress REAL NOT NULL,
        column_1 REAL,
        column_2 REAL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Resistor quality factor table
    cursor.execute('''
    CREATE TABLE resistor_quality_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quality_level TEXT NOT NULL,
        pi_q REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Resistor environment factor table
    cursor.execute('''
    CREATE TABLE resistor_environment_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        environment TEXT NOT NULL,
        pi_e REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

        # Inductor styles table
    cursor.execute('''
    CREATE TABLE inductor_styles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inductor_type TEXT NOT NULL,
        lambda_b REAL NOT NULL,
        pi_t_column INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Inductor temperature factor table
    cursor.execute('''
    CREATE TABLE inductor_temperature_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature INTEGER NOT NULL,
        pi_t REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Inductor quality factor table
    cursor.execute('''
    CREATE TABLE inductor_quality_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quality_level TEXT NOT NULL,
        pi_q REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

    # Inductor environment factor table
    cursor.execute('''
    CREATE TABLE inductor_environment_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        environment TEXT NOT NULL,
        pi_e REAL NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+7 hours'))
    )
    ''')

def populate_capacitor_styles(cursor):
    """Populate capacitor styles from MIL-HDBK-217F data"""
    
    capacitor_data = [
        # From Image 1
        ('CP', '25', 'Capacitor, Fixed, Paper-Dielectric, Direct Current (Hermetically Sealed in Metal Cases)', 0.00037, 1, 1, 1, 1.0),
        ('CA', '12889', 'Capacitor, By-Pass, Radio Interference Reduction, Paper Dielectric, AC and DC (Hermetically sealed in Metallic Case)', 0.00037, 1, 1, 1, 1.0),
        ('CZ, CZR', '11693', 'Capacitor, Feed through, Radio Interference Reduction AC and DC (Hermetically sealed in metal cases), Established and Nonestablished Reliability', 0.00037, 1, 1, 1, 1.0),
        ('CQ, CQR', '19978', 'Capacitor, Fixed Plastic (or Paper-Plastic) Dielectric (Hermetically sealed in metal, ceramic, or glass cases), Established and Nonestablished Reliability', 0.00051, 1, 1, 1, 1.0),
        ('CH', '18312', 'Capacitor, Fixed, Metallized (Paper, Paper Plastic or Plastic Film) Dielectric, Direct Current (Hermetically Sealed in Metal Cases)', 0.00037, 1, 1, 1, 1.0),
        ('CHR', '39022', 'Capacitor, Fixed, Metallized Paper, Paper-Plastic Film or Plastic Film Dielectric', 0.00051, 1, 1, 1, 1.0),
        ('CFR', '55514', 'Capacitor, Fixed, Plastic (or Metallized Plastic) Dielectric, Direct Current in Non-Metal Cases', 0.00051, 1, 1, 1, 1.0),
        ('CRH', '83421', 'Capacitor, Fixed Supermetallized Plastic Film Dielectric (DC, AC or DC and AC) Hermetically sealed Established Reliability', 0.00051, 1, 1, 1, 1.0),
        ('CM', '5', 'Capacitor, Fixed, Mica Dielectric', 0.00076, 2, 1, 2, 1.0),
        ('CMR', '39001', 'Capacitor, Fixed, Mica Dielectric, Established Reliability', 0.00076, 2, 1, 2, 1.0),
        ('CB', '10950', 'Capacitor, Fixed, Mica Dielectric, Button Style', 0.00076, 2, 1, 2, 1.0),
        ('CY', '11272', 'Capacitor, Fixed, Glass Dielectric', 0.00076, 2, 1, 2, 1.0),
        ('CYR', '23269', 'Capacitor, Fixed, Glass Dielectric, Established Reliability', 0.00076, 2, 1, 2, 1.0),
        
        # From Image 2
        ('CK', '11015', 'Capacitor, Fixed, Ceramic Dielectric (General Purpose)', 0.00099, 2, 1, 3, 1.0),
        ('CKR', '39014', 'Capacitor, Fixed, Ceramic Dielectric (General Purpose), Established Reliability', 0.00099, 2, 1, 3, 1.0),
        ('CC, CCR', '20', 'Capacitor, Fixed, Ceramic Dielectric (Temperature Compensating), Established and Nonestablished Reliability', 0.00099, 2, 1, 3, 1.0),
        ('CDR', '55681', 'Capacitor, Chip, Multiple Layer, Fixed, Ceramic Dielectric, Established Reliability', 0.0020, 2, 1, 3, 1.0),
        ('CSR', '39003', 'Capacitor, Fixed, Electrolytic (Solid Electrolyte), Tantalum, Established Reliability', 0.00040, 1, 2, 4, 1.0),
        ('CWR', '55365', 'Capacitor, Fixed, Electrolytic (Tantalum), Chip, Established Reliability', 0.00005, 1, 2, 4, 1.0),
        ('CL', '3965', 'Capacitor, Fixed, Electrolytic (Nonsolid Electrolyte), Tantalum', 0.00040, 1, 2, 4, 1.0),
        ('CLR', '39006', 'Capacitor, Fixed, Electrolytic (Nonsolid Electrolyte), Tantalum, Established Reliability', 0.00040, 1, 2, 4, 1.0),
        ('CRL', '83500', 'Capacitor, Fixed, Electrolytic (Nonsolid Electrolyte), Tantalum Cathode', 0.00040, 1, 2, 4, 1.0),
        ('CU, CUR', '39018', 'Capacitor, Fixed, Electrolytic (Aluminum Oxide), Established Reliability and Nonestablished Reliability', 0.00012, 2, 2, 1, 1.0),
        ('CE', '62', 'Capacitor, Fixed Electrolytic (DC, Aluminum, Dry Electrolyte, Polarized)', 0.00012, 2, 2, 1, 1.0),
        ('CV', '81', 'Capacitor, Variable, Ceramic Dielectric (Trimmer)', 0.0079, 1, 1, 5, 1.0),
        ('PC', '14409', 'Capacitor, Variable (Piston Type, Tubular Trimmer)', 0.0060, 2, 1, 5, 1.0),
        ('CT', '92', 'Capacitor, Variable, Air Dielectric (Trimmer)', 0.0000072, 2, 1, 5, 1.0),
        ('CG', '23183', 'Capacitor, Fixed or Variable, Vacuum Dielectric', 0.0060, 1, 1, 5, 1.0),
    ]
    
    cursor.executemany('''
        INSERT INTO capacitor_styles 
        (style, spec_number, description, lambda_b, pi_t_column, pi_c_column, pi_v_column, pi_sr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', capacitor_data)

def populate_temperature_factors(cursor):
    """Populate temperature factors from Image 3"""
    
    temp_data = [
        (20, 0.91, 0.79),
        (30, 1.1, 1.3),
        (40, 1.3, 1.9),
        (50, 1.6, 2.9),
        (60, 1.8, 4.2),
        (70, 2.2, 6.0),
        (80, 2.5, 8.4),
        (90, 2.8, 11),
        (100, 3.2, 15),
        (110, 3.7, 21),
        (120, 4.1, 27),
        (130, 4.6, 35),
        (140, 5.1, 44),
        (150, 5.6, 56)
    ]
    
    cursor.executemany('''
        INSERT INTO temperature_factors (temperature, column_1, column_2)
        VALUES (?, ?, ?)
    ''', temp_data)

def populate_capacitance_factors(cursor):
    """Populate capacitance factors from Image 3"""
    
    cap_data = [
        (0.000001, 0.29, 0.04),
        (0.00001, 0.35, 0.07),
        (0.0001, 0.44, 0.12),
        (0.001, 0.54, 0.20),
        (0.01, 0.66, 0.35),
        (0.05, 0.76, 0.50),
        (0.1, 0.81, 0.59),
        (0.5, 0.94, 0.85),
        (1.0, 1.0, 1.0),
        (3.0, 1.1, 1.3),
        (10.0, 1.2, 1.6),
        (30.0, 1.3, 1.9),
        (100.0, 1.4, 2.3),
        (300.0, 1.6, 3.4),
        (1000.0, 1.9, 4.9),
        (3000.0, 2.1, 6.3),
        (10000.0, 2.3, 8.3),
        (30000.0, 2.5, 11),
        (60000.0, 2.7, 13),
        (120000.0, 2.9, 15)
    ]
    
    cursor.executemany('''
        INSERT INTO capacitance_factors (capacitance, column_1, column_2)
        VALUES (?, ?, ?)
    ''', cap_data)

def populate_voltage_stress_factors(cursor):
    """Populate voltage stress factors from Image 4"""
    
    voltage_data = [
        (0.1, 1.0, 1.0, 1.0, 1.0, 1.0),
        (0.2, 1.0, 1.0, 1.0, 1.0, 1.1),
        (0.3, 1.0, 1.0, 1.1, 1.0, 1.2),
        (0.4, 1.1, 1.0, 1.3, 1.0, 1.5),
        (0.5, 1.4, 1.2, 1.6, 1.0, 2.0),
        (0.6, 2.0, 2.0, 2.0, 2.0, 2.7),
        (0.7, 3.2, 5.7, 2.6, 15, 3.7),
        (0.8, 5.2, 19, 3.4, 130, 5.1),
        (0.9, 8.6, 59, 4.4, 990, 6.8),
        (1.0, 14, 166, 5.6, 5900, 9.0)
    ]
    
    cursor.executemany('''
        INSERT INTO voltage_stress_factors 
        (voltage_stress, column_1, column_2, column_3, column_4, column_5)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', voltage_data)

def populate_quality_factors(cursor):
    """Populate quality factors from Image 5"""
    
    quality_data = [
        ('D', 0.001),
        ('C', 0.01),
        ('S,B', 0.03),
        ('R', 0.1),
        ('P', 0.3),
        ('M', 1.0),
        ('L', 1.5),
        ('Non-Established Reliability', 3.0),
        ('Commercial or Unknown', 10.0)
    ]
    
    cursor.executemany('''
        INSERT INTO quality_factors (quality_level, pi_q)
        VALUES (?, ?)
    ''', quality_data)

def populate_environment_factors(cursor):
    """Populate environment factors from Image 5"""
    
    environment_data = [
        ('GB', 1.0),
        ('GF', 10),
        ('GM', 20),
        ('NS', 7.0),
        ('NU', 15),
        ('AIC', 12),
        ('AIF', 15),
        ('AUC', 25),
        ('AUF', 30),
        ('ARW', 40),
        ('SF', 0.50),
        ('MF', 20),
        ('ML', 50),
        ('CL', 570)
    ]
    
    cursor.executemany('''
        INSERT INTO environment_factors (environment, pi_e)
        VALUES (?, ?)
    ''', environment_data)
    
    # Also populate series resistance factors for tantalum capacitors
    resistance_data = [
        ('>0.8', 0.66),
        ('>0.6 to 0.8', 1.0),
        ('>0.4 to 0.6', 1.3),
        ('>0.2 to 0.4', 2.0),
        ('>0.1 to 0.2', 2.7),
        ('0 to 0.1', 3.3)
    ]
    
    cursor.executemany('''
        INSERT INTO series_resistance_factors (resistance_range, pi_sr)
        VALUES (?, ?)
    ''', resistance_data)

def populate_resistor_styles(cursor):
    """Populate resistor styles from MIL-HDBK-217F data"""
    
    resistor_data = [
        ('RC', '11', 'Resistor, Fixed, Composition (Insulated)', 0.0017, 1, 2),
        ('RCR', '39008', 'Resistor, Fixed, Composition (Insulated) Est. Rel.', 0.0017, 1, 2),
        ('RL', '22684', 'Resistor, Fixed, Film, Insulated', 0.0037, 2, 1),
        ('RLR', '39017', 'Resistor, Fixed, Film (Insulated), Est. Rel.', 0.0037, 2, 1),
        ('RN (R, C or N)', '55182', 'Resistor, Fixed, Film, Established Reliability', 0.0037, 2, 1),
        ('RM', '55342', 'Resistor, Fixed, Film, Chip, Established Reliability', 0.0037, 2, 1),
        ('RN', '10509', 'Resistor, Fixed Film (High Stability)', 0.0037, 2, 1),
        ('RD', '11804', 'Resistor, Fixed, Film (Power Type)', 0.0037, 1, 1),
        ('RZ', '83401', 'Resistor Networks, Fixed, Film', 0.0019, 1, 1),
        ('RB', '93', 'Resistor, Fixed, Wirewound (Accurate)', 0.0024, 2, 1),
        ('RBR', '39005', 'Resistor, Fixed, Wirewound (Accurate) Est. Rel.', 0.0024, 2, 1),
        ('RW', '26', 'Resistor, Fixed, Wirewound (Power Type)', 0.0024, 2, 2),
        ('RWR', '39007', 'Resistor, Fixed, Wirewound (Power Type) Est. Rel.', 0.0024, 2, 2),
        ('RE', '18546', 'Resistor, Fixed, Wirewound (Power Type, Chassis Mounted)', 0.0024, 2, 2),
        ('RER', '39009', 'Resistor, Fixed, Wirewound (Power Type, Chassis Mounted) Est. Rel.', 0.0024, 2, 2),
        ('RTH', '23648', 'Thermistor, (Thermally Sensitive Resistor), Insulated', 0.0019, 1, 1),
        ('RT', '27208', 'Resistor, Variable, Wirewound (Lead Screw Activated)', 0.0024, 2, 1),
        ('RTR', '39015', 'Resistor, Variable, Wirewound (Lead Screw Activated), Established Reliability', 0.0024, 2, 1),
        ('RR', '12934', 'Resistor, Variable, Wirewound, Precision', 0.0024, 2, 1),
        ('RA', '19', 'Resistor, Variable, Wirewound (Low Operating Temperature)', 0.0024, 1, 1),
        ('RK', '39002', 'Resistor, Variable, Wirewound, Semi-Precision', 0.0024, 1, 1),
        ('RP', '22', 'Resistor, Wirewound, Power Type', 0.0024, 2, 1),
        ('RJ', '22097', 'Resistor, Variable, Nonwirewound', 0.0037, 2, 1),
        ('RJR', '39035', 'Resistor, Variable, Nonwirewound Est. Rel.', 0.0037, 2, 1),
        ('RV', '94', 'Resistor, Variable, Composition', 0.0037, 2, 1),
        ('RQ', '39023', 'Resistor, Variable, Nonwirewound, Precision', 0.0037, 1, 1),
        ('RVC', '23285', 'Resistor, Variable, Nonwirewound', 0.0037, 1, 1)
    ]
    
    cursor.executemany('''
        INSERT INTO resistor_styles 
        (style, spec_number, description, lambda_b, pi_t_column, pi_s_column)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', resistor_data)

def populate_resistor_temperature_factors(cursor):
    """Populate resistor temperature factors"""
    
    temp_data = [
        (20, 0.88, 0.95),
        (30, 1.1, 1.1),
        (40, 1.5, 1.2),
        (50, 1.8, 1.3),
        (60, 2.3, 1.4),
        (70, 2.8, 1.5),
        (80, 3.4, 1.6),
        (90, 4.0, 1.7),
        (100, 4.8, 1.9),
        (110, 5.6, 2.0),
        (120, 6.6, 2.1),
        (130, 7.6, 2.3),
        (140, 8.7, 2.4),
        (150, 10, 2.5)
    ]
    
    cursor.executemany('''
        INSERT INTO resistor_temperature_factors (temperature, column_1, column_2)
        VALUES (?, ?, ?)
    ''', temp_data)

def populate_resistor_power_factors(cursor):
    """Populate resistor power dissipation factors"""
    
    power_data = [
        (0.001, 0.068),
        (0.01, 0.17),
        (0.13, 0.44),
        (0.25, 0.58),
        (0.50, 0.76),
        (0.75, 0.89),
        (1.0, 1.0),
        (2.0, 1.3),
        (3.0, 1.5),
        (4.0, 1.7),
        (5.0, 1.9),
        (10, 2.5),
        (25, 3.5),
        (50, 4.6),
        (100, 6.0),
        (150, 7.1)
    ]
    
    cursor.executemany('''
        INSERT INTO resistor_power_factors (power_dissipation, pi_p)
        VALUES (?, ?)
    ''', power_data)

def populate_resistor_stress_factors(cursor):
    """Populate resistor power stress factors"""
    
    stress_data = [
        (0.1, 0.79, 0.66),
        (0.2, 0.88, 0.81),
        (0.3, 0.99, 1.0),
        (0.4, 1.1, 1.2),
        (0.5, 1.2, 1.5),
        (0.6, 1.4, 1.8),
        (0.7, 1.5, 2.3),
        (0.8, 1.7, 2.8),
        (0.9, 1.9, 3.4)
    ]
    
    cursor.executemany('''
        INSERT INTO resistor_stress_factors (power_stress, column_1, column_2)
        VALUES (?, ?, ?)
    ''', stress_data)

def populate_resistor_quality_factors(cursor):
    """Populate resistor quality factors"""
    
    quality_data = [
        ('S', 0.03),
        ('R', 0.1),
        ('P', 0.3),
        ('M', 1.0),
        ('Non-Established Reliability', 3.0),
        ('Commercial or Unknown', 10)
    ]
    
    cursor.executemany('''
        INSERT INTO resistor_quality_factors (quality_level, pi_q)
        VALUES (?, ?)
    ''', quality_data)

def populate_resistor_environment_factors(cursor):
    """Populate resistor environment factors"""
    
    environment_data = [
        ('GB', 1.0),
        ('GF', 4.0),
        ('GM', 16),
        ('NS', 12),
        ('NU', 42),
        ('AIC', 18),
        ('AIF', 23),
        ('AUC', 31),
        ('AUF', 43),
        ('ARW', 63),
        ('SF', 0.50),
        ('MF', 37),
        ('ML', 87),
        ('CL', 1728)
    ]
    
    cursor.executemany('''
        INSERT INTO resistor_environment_factors (environment, pi_e)
        VALUES (?, ?)
    ''', environment_data)

def populate_inductor_styles(cursor):
    """Populate inductor styles from MIL-HDBK-217F data"""
    
    inductor_data = [
        ('Fixed Inductor or Choke', 0.000030, 1),
        ('Variable Inductor', 0.000050, 1)
    ]
    
    cursor.executemany('''
        INSERT INTO inductor_styles 
        (inductor_type, lambda_b, pi_t_column)
        VALUES (?, ?, ?)
    ''', inductor_data)

def populate_inductor_temperature_factors(cursor):
    """Populate inductor temperature factors"""
    
    temp_data = [
        (20, 0.93),
        (30, 1.1),
        (40, 1.2),
        (50, 1.4),
        (60, 1.6),
        (70, 1.8),
        (80, 1.9),
        (90, 2.2),
        (100, 2.4),
        (110, 2.6),
        (120, 2.8),
        (130, 3.1),
        (140, 3.3),
        (150, 3.5),
        (160, 3.8),
        (170, 4.1),
        (180, 4.3),
        (190, 4.6)
    ]
    
    cursor.executemany('''
        INSERT INTO inductor_temperature_factors (temperature, pi_t)
        VALUES (?, ?)
    ''', temp_data)

def populate_inductor_quality_factors(cursor):
    """Populate inductor quality factors"""
    
    quality_data = [
        ('S', 0.03),
        ('R', 0.10),
        ('P', 0.30),
        ('M', 1.0),
        ('MIL-SPEC', 1.0),
        ('Lower', 3.0)
    ]
    
    cursor.executemany('''
        INSERT INTO inductor_quality_factors (quality_level, pi_q)
        VALUES (?, ?)
    ''', quality_data)

def populate_inductor_environment_factors(cursor):
    """Populate inductor environment factors"""
    
    environment_data = [
        ('GB', 1.0),
        ('GF', 6.0),
        ('GM', 12),
        ('NS', 5.0),
        ('NU', 16),
        ('AIC', 6.0),
        ('AIF', 8.0),
        ('AUC', 7.0),
        ('AUF', 9.0),
        ('ARW', 24),
        ('SF', 0.50),
        ('MF', 13),
        ('ML', 34),
        ('CL', 610)
    ]
    
    cursor.executemany('''
        INSERT INTO inductor_environment_factors (environment, pi_e)
        VALUES (?, ?)
    ''', environment_data)

def calculate_temperature_factor(temperature, column):
    """Calculate temperature factor using equation if not in table"""
    if column == 1:
        ea = 0.15
    else:  # column == 2
        ea = 0.35
    
    # π_T = exp(-Ea/8.617 x 10^-5 * (1/(T + 273) - 1/298))
    factor = math.exp(-ea / (8.617e-5) * (1/(temperature + 273) - 1/298))
    return factor

def calculate_capacitance_factor(capacitance, column):
    """Calculate capacitance factor using power law if not in table"""
    if column == 1:
        # π_C = C^-0.09
        factor = capacitance ** 0.09
    else:  # column == 2
        # π_C = C^-0.23
        factor = capacitance ** 0.23
    
    return factor

if __name__ == '__main__':
    create_database()