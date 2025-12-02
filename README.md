# Hough Transform Visualizer

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=323330)
![License](https://img.shields.io/badge/License-MIT-blue)

An interactive web application for visualizing the **Hough Transform** algorithm, demonstrating real-time detection of lines and circles in 2D space.

## 🎯 About

The Hough Transform is a powerful feature extraction technique used in image analysis and computer vision. This visualizer provides an intuitive, interactive way to understand how the algorithm works by transforming points from Cartesian space to parameter space.

**Live Demo:** [https://MatiasCarabella.github.io/hough-transform](https://MatiasCarabella.github.io/hough-transform)

## 📸 Screenshots

### Line Detection (ρ-θ space)
<img width="1696" height="699" alt="Captura de pantalla 2025-12-01 234037" src="https://github.com/user-attachments/assets/cfb70ae1-a145-4ad3-902e-70df8cd2daaa" />

### Circle Detection (xo-yo space)
<img width="1690" height="697" alt="Captura de pantalla 2025-12-01 234054" src="https://github.com/user-attachments/assets/b965bcda-41f9-4a50-bade-6e88dc45450a" />

## ✨ Features

- **Line Detection (ρ-θ space)**: Visualize how collinear points create sinusoidal curves that intersect in Hough space
- **Circle Detection (xo-yo space)**: Detect circles with known radius by voting for possible centers
- **Real-time Visualization**: See both the original space and Hough space side-by-side
- **Interactive Controls**: Adjust threshold, radius, and generate new sample points
- **Heat Map Representation**: Color-coded accumulator visualization (blue = low votes, red = high votes)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MatiasCarabella/hough-transform.git

# Navigate to project directory
cd hough-transform

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ Technology Stack

- **React 19.2** - UI framework
- **Vite 7.2** - Build tool and dev server
- **Lucide React** - Icon library
- **Canvas API** - 2D rendering
- **ESLint** - Code quality

## 📖 How It Works

### Line Detection
The algorithm uses the polar coordinate representation: `ρ = x·cos(θ) + y·sin(θ)`
- Each point generates a sinusoidal curve in (ρ,θ) space
- Collinear points produce curves that intersect at a single point
- Local maxima in the accumulator reveal detected lines

### Circle Detection
For circles with known radius R: `(x-xo)² + (y-yo)² = R²`
- Each point votes for all possible circle centers at distance R
- Creates a circular voting pattern in (xo,yo) space
- Local maxima indicate circle centers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
