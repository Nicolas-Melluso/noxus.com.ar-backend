-- Migración para el módulo Noxura
-- Sistema de calorías, recetas y ranking

-- Tabla de recetas de usuarios
CREATE TABLE IF NOT EXISTS noxura_recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ingredients JSON NOT NULL,
  totalCalories INT NOT NULL,
  category VARCHAR(50),
  preparation TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de comidas diarias
CREATE TABLE IF NOT EXISTS noxura_daily_meals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  date DATE NOT NULL,
  meals JSON NOT NULL,
  totalCalories INT NOT NULL,
  validated BOOLEAN DEFAULT FALSE,
  validatedBy INT,
  validatedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (userId, date),
  INDEX idx_userId (userId),
  INDEX idx_date (date),
  INDEX idx_validated (validated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de perfiles de usuario (ranking, puntos, liga)
CREATE TABLE IF NOT EXISTS noxura_user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  league VARCHAR(20) DEFAULT 'bronce',
  validationsGiven INT DEFAULT 0,
  validationsReceived INT DEFAULT 0,
  consecutiveDays INT DEFAULT 0,
  lastLoginDate DATE,
  achievements JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_points (points DESC),
  INDEX idx_league (league)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
