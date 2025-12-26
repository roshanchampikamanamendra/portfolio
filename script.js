
document.addEventListener('DOMContentLoaded', () => {

    // ==================== PARTICLE BACKGROUND ====================
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 80;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = '#00ff9d';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(0, 255, 157, ${1 - distance / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // ==================== MOBILE NAVIGATION ====================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.right = '0';
                navLinks.style.background = 'var(--glass-bg)';
                navLinks.style.width = '100%';
                navLinks.style.padding = '2rem';
                navLinks.style.backdropFilter = 'blur(10px)';
                navLinks.style.borderBottom = '1px solid var(--glass-border)';
            }
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    // ==================== ENHANCED GIS GEOGRAPHY GAME ====================
    const gameMapElement = document.getElementById('game-map');

    if (gameMapElement && typeof L !== 'undefined') {
        let gameMap, guessMarker, targetLocation, gameTimer, timeRemaining;
        let score = 0, totalGuesses = 0, correctGuesses = 0, currentStreak = 0;
        let currentDifficulty = 'easy';
        let hintsUsed = 0;

        // Extended locations database with extra hints
        const locationsDatabase = {
            easy: [
                { name: "Eiffel Tower, Paris", lat: 48.8584, lng: 2.2945, hint: "Famous iron lattice tower in France", extraHint: "Built for the 1889 World's Fair, in the City of Lights" },
                { name: "Statue of Liberty, New York", lat: 40.6892, lng: -74.0445, hint: "Iconic statue in the United States", extraHint: "Gift from France, located on Liberty Island" },
                { name: "Big Ben, London", lat: 51.5007, lng: -0.1246, hint: "Famous clock tower in England", extraHint: "Part of the Palace of Westminster, UK Parliament" },
                { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, hint: "Iconic performing arts center in Australia", extraHint: "Designed by Jørn Utzon, distinctive sail-like design" }
            ],
            medium: [
                { name: "Taj Mahal, India", lat: 27.1751, lng: 78.0421, hint: "White marble mausoleum in Agra", extraHint: "Built by Emperor Shah Jahan, UNESCO World Heritage Site" },
                { name: "Christ the Redeemer, Rio", lat: -22.9519, lng: -43.2105, hint: "Iconic statue in Brazil", extraHint: "Located on Corcovado mountain, overlooks Rio de Janeiro" },
                { name: "Colosseum, Rome", lat: 41.8902, lng: 12.4922, hint: "Ancient amphitheater in Italy", extraHint: "Built in 70-80 AD, largest ancient amphitheater" },
                { name: "Burj Khalifa, Dubai", lat: 25.1972, lng: 55.2744, hint: "Tallest building in the world", extraHint: "828 meters tall, in United Arab Emirates" },
                { name: "Machu Picchu, Peru", lat: -13.1631, lng: -72.5450, hint: "Ancient Incan city in the Andes", extraHint: "15th-century citadel, at 2,430 meters elevation" }
            ],
            hard: [
                { name: "Sigiriya Rock, Sri Lanka", lat: 7.9570, lng: 80.7603, hint: "Ancient rock fortress in Sri Lanka", extraHint: "Lion Rock, 5th-century fortress and palace" },
                { name: "Petra, Jordan", lat: 30.3285, lng: 35.4444, hint: "Ancient city carved into rock", extraHint: "Rose City, rediscovered in 1812" },
                { name: "Angkor Wat, Cambodia", lat: 13.4125, lng: 103.8670, hint: "Largest religious monument", extraHint: "12th-century temple complex, originally Hindu" },
                { name: "Mount Everest", lat: 27.9881, lng: 86.9250, hint: "Highest mountain on Earth", extraHint: "8,848.86 meters, on Nepal-Tibet border" },
                { name: "Great Pyramid of Giza", lat: 29.9792, lng: 31.1342, hint: "Ancient wonder in Egypt", extraHint: "Oldest of the Seven Wonders, built around 2560 BC" }
            ]
        };

        // Game elements
        const startGameBtn = document.getElementById('start-game');
        const submitGuessBtn = document.getElementById('submit-guess');
        const skipLocationBtn = document.getElementById('skip-location');
        const resetGameBtn = document.getElementById('reset-game');
        const extraHintBtn = document.getElementById('extra-hint-btn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        const mapOverlay = document.getElementById('map-overlay');

        const locationNameEl = document.getElementById('location-name');
        const locationHintEl = document.getElementById('location-hint');
        const locationDifficultyEl = document.getElementById('location-difficulty');
        const scoreEl = document.getElementById('score');
        const accuracyEl = document.getElementById('accuracy');
        const correctGuessesEl = document.getElementById('correct-guesses');
        const timerEl = document.getElementById('timer');
        const timerFillEl = document.getElementById('timer-fill');
        const feedbackEl = document.getElementById('game-feedback');

        // Achievements tracking
        const achievements = {
            'first-correct': false,
            'five-streak': false,
            'speed-demon': false,
            'perfect-accuracy': false,
            'master-cartographer': false
        };

        // Difficulty settings
        const difficultySettings = {
            easy: { time: 45, name: 'EXPLORER', pointMultiplier: 1 },
            medium: { time: 30, name: 'NAVIGATOR', pointMultiplier: 1.5 },
            hard: { time: 20, name: 'CARTOGRAPHER', pointMultiplier: 2 }
        };

        // Initialize map
        function initializeGameMap() {
            gameMap = L.map('game-map').setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(gameMap);

            gameMap.on('click', function (e) {
                if (!targetLocation) return;

                if (guessMarker) {
                    gameMap.removeLayer(guessMarker);
                }

                guessMarker = L.marker(e.latlng, {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(gameMap);

                submitGuessBtn.disabled = false;
            });
        }

        // Difficulty selection
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.difficulty;
            });
        });

        // Start game
        function startGame() {
            score = 0;
            totalGuesses = 0;
            correctGuesses = 0;
            currentStreak = 0;
            hintsUsed = 0;

            updateStats();
            nextLocation();

            mapOverlay.classList.add('hidden');
            startGameBtn.innerHTML = '<i class="fas fa-redo"></i><span>New Game</span>';
            submitGuessBtn.disabled = false;
            skipLocationBtn.disabled = false;
        }

        // Next location
        function nextLocation() {
            if (guessMarker) {
                gameMap.removeLayer(guessMarker);
                guessMarker = null;
            }

            const locations = locationsDatabase[currentDifficulty];
            targetLocation = locations[Math.floor(Math.random() * locations.length)];

            locationNameEl.textContent = `Find: ${targetLocation.name}`;
            locationHintEl.textContent = targetLocation.hint;
            locationDifficultyEl.textContent = difficultySettings[currentDifficulty].name;

            extraHintBtn.disabled = false;
            submitGuessBtn.disabled = true;
            feedbackEl.style.display = 'none';

            gameMap.setView([20, 0], 2);

            // Start timer
            const maxTime = difficultySettings[currentDifficulty].time;
            timeRemaining = maxTime;
            timerEl.textContent = timeRemaining;
            timerFillEl.style.width = '100%';

            clearInterval(gameTimer);
            gameTimer = setInterval(() => {
                timeRemaining--;
                timerEl.textContent = timeRemaining;
                timerFillEl.style.width = `${(timeRemaining / maxTime) * 100}%`;

                if (timeRemaining <= 0) {
                    clearInterval(gameTimer);
                    showFeedback(`Time's up! The location was ${targetLocation.name}`, 'error');
                    totalGuesses++;
                    currentStreak = 0;
                    updateStats();
                    setTimeout(nextLocation, 3000);
                }
            }, 1000);
        }

        // Extra hint
        extraHintBtn.addEventListener('click', () => {
            if (targetLocation && targetLocation.extraHint) {
                locationHintEl.textContent = targetLocation.extraHint;
                extraHintBtn.disabled = true;
                score = Math.max(0, score - 50);
                hintsUsed++;
                updateStats();
                showFeedback('Extra hint revealed! -50 points', 'info');
                setTimeout(() => feedbackEl.style.display = 'none', 2000);
            }
        });

        // Submit guess
        function submitGuess() {
            if (!guessMarker || !targetLocation) return;

            clearInterval(gameTimer);
            totalGuesses++;

            const guessLatLng = guessMarker.getLatLng();
            const targetLatLng = L.latLng(targetLocation.lat, targetLocation.lng);
            const distance = guessLatLng.distanceTo(targetLatLng);

            // Show actual location
            const actualMarker = L.marker(targetLatLng, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }).addTo(gameMap);

            // Draw line
            const line = L.polyline([guessLatLng, targetLatLng], {
                color: distance < 100000 ? '#10b981' : '#ef4444',
                weight: 3,
                dashArray: '10, 10'
            }).addTo(gameMap);

            gameMap.fitBounds([guessLatLng, targetLatLng], { padding: [50, 50] });

            // Calculate points
            const multiplier = difficultySettings[currentDifficulty].pointMultiplier;
            let points = 0;
            let isCorrect = false;

            if (distance < 50000) {
                points = Math.floor((200 + timeRemaining * 5) * multiplier);
                isCorrect = true;
            } else if (distance < 100000) {
                points = Math.floor((150 + timeRemaining * 3) * multiplier);
                isCorrect = true;
            } else if (distance < 500000) {
                points = Math.floor((100 + timeRemaining * 2) * multiplier);
                isCorrect = true;
            } else if (distance < 1000000) {
                points = Math.floor(50 * multiplier);
            }

            if (isCorrect) {
                correctGuesses++;
                currentStreak++;
                score += points;
                showFeedback(`🎯 Excellent! ${Math.round(distance / 1000)}km away. +${points} points!`, 'success');
                checkAchievements();
            } else {
                currentStreak = 0;
                showFeedback(`❌ Not quite! Distance: ${Math.round(distance / 1000)}km. Location was ${targetLocation.name}`, 'error');
            }

            updateStats();

            setTimeout(() => {
                gameMap.removeLayer(actualMarker);
                gameMap.removeLayer(line);
                nextLocation();
            }, 4000);
        }

        // Skip location
        function skipLocation() {
            clearInterval(gameTimer);
            totalGuesses++;
            currentStreak = 0;
            showFeedback(`Skipped! Location was ${targetLocation.name}`, 'info');
            updateStats();
            setTimeout(nextLocation, 2500);
        }

        // Reset game
        function resetGame() {
            clearInterval(gameTimer);
            score = 0;
            totalGuesses = 0;
            correctGuesses = 0;
            currentStreak = 0;
            hintsUsed = 0;

            if (guessMarker) gameMap.removeLayer(guessMarker);

            locationNameEl.textContent = 'Ready to explore the world?';
            locationHintEl.textContent = 'Select difficulty and click "Start Quest" to begin your journey!';
            timerEl.textContent = '--';
            mapOverlay.classList.remove('hidden');
            startGameBtn.innerHTML = '<i class="fas fa-play"></i><span>Start Quest</span>';

            updateStats();
            feedbackEl.style.display = 'none';
        }

        // Update stats
        function updateStats() {
            scoreEl.textContent = score;
            correctGuessesEl.textContent = `${correctGuesses}/${totalGuesses}`;
            const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0;
            accuracyEl.textContent = `${accuracy}%`;
        }

        // Show feedback
        function showFeedback(message, type) {
            feedbackEl.textContent = message;
            feedbackEl.className = `feedback-panel ${type}`;
        }

        // Check achievements
        function checkAchievements() {
            // First Victory
            if (!achievements['first-correct'] && correctGuesses === 1) {
                unlockAchievement('first-correct');
            }

            // 5 in a Row
            if (!achievements['five-streak'] && currentStreak >= 5) {
                unlockAchievement('five-streak');
            }

            // Speed Demon (correct guess with >15s remaining)
            if (!achievements['speed-demon'] && timeRemaining > 15) {
                unlockAchievement('speed-demon');
            }

            // Sharpshooter (100% accuracy with 10+ guesses)
            if (!achievements['perfect-accuracy'] && totalGuesses >= 10 && correctGuesses === totalGuesses) {
                unlockAchievement('perfect-accuracy');
            }

            // Master Cartographer (score > 5000)
            if (!achievements['master-cartographer'] && score > 5000) {
                unlockAchievement('master-cartographer');
            }
        }

        // Unlock achievement
        function unlockAchievement(achievementId) {
            achievements[achievementId] = true;
            const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
            if (achievementEl) {
                achievementEl.classList.remove('locked');
                achievementEl.classList.add('unlocked');
            }
        }

        // Event listeners
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                if (!gameMap) initializeGameMap();
                startGame();
            });
        }

        submitGuessBtn?.addEventListener('click', submitGuess);
        skipLocationBtn?.addEventListener('click', skipLocation);
        resetGameBtn?.addEventListener('click', resetGame);

        // Initialize map on load
        initializeGameMap();
    }

    // ==================== INTERACTIVE MAP EXPLORER ====================
    const explorerMapElement = document.getElementById('explorer-map');

    if (explorerMapElement && typeof L !== 'undefined') {
        const explorerMap = L.map('explorer-map').setView([7.8731, 80.7718], 7);

        const baseMaps = {
            osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri'
            }),
            terrain: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
                attribution: 'Map tiles by Stamen Design'
            })
        };

        baseMaps.osm.addTo(explorerMap);

        const cities = [
            { name: "Colombo", lat: 6.9271, lng: 79.8612 },
            { name: "Kandy", lat: 7.2906, lng: 80.6337 },
            { name: "Galle", lat: 6.0535, lng: 80.2210 },
            { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
            { name: "Badulla", lat: 6.9934, lng: 81.0550 }
        ];

        let citiesLayer = L.layerGroup();
        let markersLayer = L.layerGroup();

        cities.forEach(city => {
            L.marker([city.lat, city.lng])
                .bindPopup(`<b>${city.name}</b><br>Major city in Sri Lanka`)
                .addTo(citiesLayer);
        });

        document.querySelectorAll('input[name="basemap"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                Object.values(baseMaps).forEach(layer => explorerMap.removeLayer(layer));
                baseMaps[e.target.value].addTo(explorerMap);
            });
        });

        document.getElementById('cities-layer')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                citiesLayer.addTo(explorerMap);
            } else {
                explorerMap.removeLayer(citiesLayer);
            }
        });

        document.getElementById('markers-layer')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                L.marker([6.9934, 81.0550])
                    .bindPopup('<b>Badulla</b><br>Home District')
                    .addTo(markersLayer);
                L.marker([7.2906, 80.6337])
                    .bindPopup('<b>University of Peradeniya</b><br>Alma Mater')
                    .addTo(markersLayer);
                markersLayer.addTo(explorerMap);
            } else {
                markersLayer.clearLayers();
                explorerMap.removeLayer(markersLayer);
            }
        });

        explorerMap.on('move', () => {
            const center = explorerMap.getCenter();
            const zoom = explorerMap.getZoom();
            document.getElementById('map-coords').textContent =
                `Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`;
            document.getElementById('map-zoom').textContent = `Zoom: ${zoom}`;
        });
    }

    // ==================== ANIMATIONS ====================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.timeline-item, .skill-tag, .edu-card, .stat-card, .about-text, .cert-card, .project-card');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);
});
