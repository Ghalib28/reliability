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