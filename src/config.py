#!/usr/bin/env python3
"""
Enhanced Configuration file for MIL-HDBK-217F Reliability Prediction Application
Project-based application with enhanced features
"""

import os
import sys

class Config:
    # Database configuration with proper path resolution
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Check if running in PyInstaller bundle or Electron packaged app
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller bundle
        DATABASE_PATH = os.path.join(sys._MEIPASS, 'database', 'mil_hdbk_217.db')
    elif os.path.exists(os.path.join(BASE_DIR, '..', 'resources', 'app')):
        # Electron packaged app
        DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'mil_hdbk_217.db')
    else:
        # Development mode
        DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'mil_hdbk_217.db')
    
    # Flask configuration
    SECRET_KEY = 'enhanced-reliability-prediction-secret-key-2025'
    DEBUG = False
    HOST = '127.0.0.1'
    PORT = 5000
    
    # Application settings
    APP_NAME = 'Enhanced Reliability Lambda Predict'
    VERSION = '1.1.0'
    DESCRIPTION = 'Project-Based MIL-HDBK-217F Reliability Prediction Calculator'
    
    # Application features
    FEATURES = {
        'project_management': True,
        'enhanced_parameters': True,
        'component_tracking': True,
        'export_formats': ['json', 'csv', 'xlsx'],
        'auto_save': True,
        'validation': True,
        'history_logging': True,
        'splash_screen': True
    }
    
    # Calculation settings
    DEFAULT_TEMPERATURE = 25  # Celsius
    DEFAULT_QUALITY = 'M'     # Military
    DEFAULT_ENVIRONMENT = 'GB'  # Ground Benign
    
    # Temperature factor equation constants
    TEMP_FACTOR_EA_COLUMN1 = 0.15
    TEMP_FACTOR_EA_COLUMN2 = 0.35
    BOLTZMANN_CONSTANT = 8.617e-5  # eV/K
    REFERENCE_TEMP = 298  # 25°C in Kelvin (25 + 273)
    
    # Capacitance factor equation exponents
    CAP_FACTOR_EXP_COLUMN1 = 0.09
    CAP_FACTOR_EXP_COLUMN2 = 0.23
    
    @classmethod
    def get_database_path(cls):
        """Get database path with fallback options"""
        possible_paths = [
            cls.DATABASE_PATH,
            os.path.join(cls.BASE_DIR, 'database', 'mil_hdbk_217.db'),
            os.path.join(os.path.dirname(cls.BASE_DIR), 'database', 'mil_hdbk_217.db'),
            os.path.join(sys.path[0], 'database', 'mil_hdbk_217.db')
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        # If no database found, return the default path for creation
        return cls.DATABASE_PATH