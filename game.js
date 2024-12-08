class Game {
    constructor(playerName) {
        // Canvas and context setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Player name
        this.playerName = playerName;
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 150;
        
        // Game state
        this.score = 0;
        this.highScore = 0;
        this.speed = 5;
        this.gameOver = false;

        // Story and dialogue management
        this.storyManager = new StoryManager(this);
        
        // Ground properties
        this.ground = {
            y: this.canvas.height - 20,
            height: 20
        };
        
        // Player properties
        this.player = {
            x: 50,
            y: this.canvas.height - 40 - this.ground.height,
            width: 70,
            height: 30,
            velocityY: 0,
            jumpForce: -10,
            gravity: 0.5,
            isJumping: false
        };

         // Add a new property to track game initialization
         this.isInitialized = false;
        
        // Obstacle properties
        this.obstacles = [];
        this.minObstacleDistance = 200;
        this.lastObstacleX = this.canvas.width;
        this.obstacleTimer = 0;
        this.obstacleInterval = 60;
        
        // Dubai background properties
        this.buildings = [];
        this.createBuildings();
        
        // Day/night cycle
        this.timeOfDay = 0; // 0 to 2400
        this.skyGradients = {
            dawn: ['#FF9A5C', '#FFCC80'],
            day: ['#87CEEB', '#E0F7FA'],
            dusk: ['#FF6B6B', '#4A148C'],
            night: ['#1A237E', '#000051']
        };
        
        // Setup game elements
        this.setupEventListeners();
        this.gameLoop();

        // Manage high scores
        this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        this.updateHighScoresList();
    }

    createBuildings() {
        this.buildings = [
            { x: 50, width: 30, height: 80, type: 'building' },
            { x: 150, width: 60, height: 100, type: 'burjKhalifa' },
            { x: 250, width: 40, height: 60, type: 'building' },
            { x: 350, width: 40, height: 40, type: 'burjAlArab' },
            { x: 450, width: 35, height: 70, type: 'building' }
        ];
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.player.isJumping && !this.gameOver) {
                this.jump();
            }
            if (e.code === 'Space' && this.gameOver) {
                this.restart();
            }
        });

        document.addEventListener('touchstart', () => {
            if (!this.player.isJumping && !this.gameOver) {
                this.jump();
            }
            if (this.gameOver) {
                this.restart();
            }
        });
    }

    jump() {
        this.player.isJumping = true;
        this.player.velocityY = this.player.jumpForce;
    }

    createObstacle() {
        this.obstacleTimer++;
        
        if (this.obstacleTimer >= this.obstacleInterval) {
            const types = ['camel', 'palmTree', 'signboard'];
            const type = types[Math.floor(Math.random() * types.length)];
            const height = type === 'camel' ? 40 : (type === 'signboard' ? 30 : 50);
            
            this.obstacles.push({
                x: this.canvas.width,
                y: type === 'signboard' ? this.canvas.height - height - 60 : this.canvas.height - height - this.ground.height,
                width: type === 'signboard' ? 100 : 30,
                height: height,
                type: type
            });
            
            this.obstacleTimer = 0;
            this.obstacleInterval = Math.max(30, 60 - Math.floor(this.score / 500));
        }
    }

    update() {
        if (this.gameOver) return;

        this.timeOfDay = (this.timeOfDay + 1) % 2400;
        
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // Ensure player lands on ground correctly
        const groundLevel = this.canvas.height - this.player.height - this.ground.height;
        if (this.player.y > groundLevel) {
            this.player.y = groundLevel;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }

        this.createObstacle();
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.speed;
            
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            if (this.checkCollision(this.player, this.obstacles[i])) {
                this.handleGameOver(); // Use new method instead of directly setting gameOver
                break;
            }
        }

        if (!this.gameOver) {
            this.score++;
            this.speed = 5 + Math.floor(this.score / 500);
        }
    }

    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.width > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }

    drawSky() {
        let colors;
        
        if (this.timeOfDay < 600) {
            colors = this.skyGradients.dawn;
        } else if (this.timeOfDay < 1800) {
            colors = this.skyGradients.day;
        } else if (this.timeOfDay < 2000) {
            colors = this.skyGradients.dusk;
        } else {
            colors = this.skyGradients.night;
        }
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cycleProgress = (this.timeOfDay / 2400) * Math.PI * 2;
        const celestialY = Math.sin(cycleProgress) * (this.canvas.height * 0.4) + 50;
        const celestialX = (this.timeOfDay / 2400) * this.canvas.width;
        
        if (this.timeOfDay >= 600 && this.timeOfDay < 1800) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(celestialX, celestialY, 15, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(celestialX, celestialY, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Add this method to the Game class
    drawPlayer() {
        const groundLevel = this.player.y;
    
        // Car body in a vibrant red
        this.ctx.fillStyle = '#FF4500'; // Bright orange-red color
        
        // Main car body (more rectangular shape)
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 10, groundLevel + 20);
        this.ctx.lineTo(this.player.x + 40, groundLevel + 20);
        this.ctx.lineTo(this.player.x + 45, groundLevel + 10);
        this.ctx.lineTo(this.player.x + 5, groundLevel + 10);
        this.ctx.closePath();
        this.ctx.fill();
    
        // Windshield (slightly tilted)
        this.ctx.fillStyle = '#87CEEB'; // Light blue windshield
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 15, groundLevel + 10);
        this.ctx.lineTo(this.player.x + 35, groundLevel + 10);
        this.ctx.lineTo(this.player.x + 30, groundLevel);
        this.ctx.lineTo(this.player.x + 20, groundLevel);
        this.ctx.closePath();
        this.ctx.fill();
    
        const wheelRadius = 6;
        const rimWidth = 2;
    
        // Front wheel
        this.ctx.save();
        this.ctx.translate(this.player.x + 15, groundLevel + 25);
        
        // Outer wheel (black)
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wheel rim
        this.ctx.fillStyle = '#888';
        const wheelRotation = Date.now() / 100;
        for (let i = 0; i < 6; i++) {
            this.ctx.save();
            this.ctx.rotate(wheelRotation + (Math.PI / 3 * i));
            this.ctx.fillRect(-rimWidth/2, -wheelRadius, rimWidth, wheelRadius * 2);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    
        // Back wheel
        this.ctx.save();
        this.ctx.translate(this.player.x + 35, groundLevel + 25);
        
        // Outer wheel (black)
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wheel rim
        this.ctx.fillStyle = '#888';
        for (let i = 0; i < 6; i++) {
            this.ctx.save();
            this.ctx.rotate(wheelRotation + (Math.PI / 3 * i));
            this.ctx.fillRect(-rimWidth/2, -wheelRadius, rimWidth, wheelRadius * 2);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    
        // Headlights
        this.ctx.fillStyle = '#FFFF00'; // Bright yellow
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + 12, groundLevel + 15, 2, 0, Math.PI * 2);
        this.ctx.arc(this.player.x + 38, groundLevel + 15, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBuilding(building) {
        const isDaytime = this.timeOfDay >= 600 && this.timeOfDay < 1800;
        const buildingColor = isDaytime ? '#4A4A4A' : '#2C2C2C';
    
        if (building.type !== 'burjAlArab' && building.type !== 'burjKhalifa') {
            // Regular building rendering
            this.ctx.fillStyle = buildingColor;
            this.ctx.fillRect(
                building.x,
                this.canvas.height - building.height - this.ground.height,
                building.width,
                building.height
            );
    
            // Add windows
            const windowWidth = 8;
            const windowHeight = 12;
            const windowSpacing = 5;
            const horizontalWindowSpacing = 10;
            const windowRows = Math.floor(building.height / (windowHeight + windowSpacing));
            const windowColumns = Math.floor(building.width / (windowWidth + horizontalWindowSpacing));
    
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowColumns; col++) {
                    const windowX = building.x + col * (windowWidth + horizontalWindowSpacing) + 5;
                    const windowY = this.canvas.height - building.height - this.ground.height + row * (windowHeight + windowSpacing) + windowSpacing;
    
                    // Randomly determine if this window should light up
                    const shouldLightUp = Math.random() < 0.1; // 10% chance to light up
    
                    // Window color based on day/night
                    if (isDaytime) {
                        this.ctx.fillStyle = '#FFFFFF'; // White windows during day
                        this.ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
                    } else {
                        if (shouldLightUp) {
                            this.ctx.fillStyle = '#FFFF99'; // Warm yellow light
                            this.ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
                        } else {
                            this.ctx.fillStyle = '#666666'; // Grey window when not lit
                            this.ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
                        }
                    }
                }
            }
        } 
        else if (building.type === 'burjKhalifa') {
            // Burj Khalifa rendering (mostly unchanged)
            this.ctx.fillStyle = isDaytime ? '#4A4A4A' : '#2C2C2C';
            this.ctx.fillRect(
                building.x,
                this.canvas.height - building.height - this.ground.height,
                building.width,
                building.height
            );
        }
        
        else if (building.type === 'burjAlArab') {
            // Burj Al Arab rendering (unchanged)
            const baseX = building.x;
            const baseY = this.canvas.height - building.height - this.ground.height;
    
            // Sail (curve shape)
            this.ctx.fillStyle = isDaytime ? '#FFFFFF' : '#ADD8E6';
            this.ctx.beginPath();
            this.ctx.moveTo(baseX, baseY + building.height);
            this.ctx.quadraticCurveTo(
                baseX + building.width * 2,
                baseY + building.height * 1.5,
                baseX + building.width * 0.25,
                baseY - building.height
            );
            this.ctx.lineTo(baseX + building.width * 0.25, baseY - building.height);
            this.ctx.lineTo(baseX, baseY - building.height);
            this.ctx.closePath();
            this.ctx.fill();
    
            // Windows (horizontal strips within the sail)
            if (!isDaytime) {
                const shouldLightUp = Math.random() < 0.5; // 10% chance to light up
                this.ctx.fillStyle = shouldLightUp ? '#FFFF99' : '#FFCC66'; // Warmer yellow if not lit
                const windowHeight = 2;
                const windowSpacing = 5;
                const sailWidth = building.width * 0.7;
                const sailOffsetX = baseX + building.width * 0.15;
                for (let y = baseY + building.height * 0.2; y < baseY + building.height; y += windowHeight + windowSpacing) {
                    const blink = Math.random() < 0.3; // 30% chance to blink
                    this.ctx.fillStyle = blink ? '#FFFF99' : '#FFCC66'; // Randomly blink with warmer yellow
                    this.ctx.fillRect(sailOffsetX, y, sailWidth, windowHeight);
                }
            } else {
                // Morning white window strips
                this.ctx.fillStyle = '#808080'; // Grey windows during the day
                const windowHeight = 2;
                const windowSpacing = 5;
                const sailWidth = building.width * 0.7;
                const sailOffsetX = baseX + building.width * 0.15;
                for (let y = baseY + building.height * 0.2; y < baseY + building.height; y += windowHeight + windowSpacing) {
                    this.ctx.fillRect(sailOffsetX, y, sailWidth, windowHeight);
                }
            }
    
            // Spine (on top of the sail)
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(
                baseX + building.width * 0.1,
                baseY - building.height,
                building.width * 0.1,
                building.height + this.ground.height+20
            );
        }
    }
        
    drawObstacle(obstacle) {
        if (obstacle.type === 'camel') {
            this.ctx.fillStyle = '#8B4513';
            
            // Body
            this.ctx.fillRect(
                obstacle.x + 5,
                obstacle.y + 10,
                obstacle.width - 10,
                obstacle.height - 20
            );
            
            // Legs with simple animation
            const legOffset = Math.sin(Date.now() / 100) * 3;
            for (let i = 0; i < 2; i++) {
                this.ctx.fillRect(
                    obstacle.x + 10 + (i * 10),
                    obstacle.y + obstacle.height - 10 + (i % 2 === 0 ? legOffset : -legOffset),
                    5,
                    10
                );
            }
            
            // Neck
            this.ctx.fillRect(
                obstacle.x + obstacle.width - 12,
                obstacle.y,
                8,
                15
            );
            
            // Head
            this.ctx.beginPath();
            this.ctx.ellipse(
                obstacle.x + obstacle.width - 8,
                obstacle.y,
                6,
                4,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Eye
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(
                obstacle.x + obstacle.width - 6,
                obstacle.y - 1,
                1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Humps
            this.ctx.fillStyle = '#8B4513';
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x + 10, obstacle.y + 10, 5, 0, Math.PI, true);
            this.ctx.arc(obstacle.x + 20, obstacle.y + 10, 5, 0, Math.PI, true);
            this.ctx.fill();
        } else if (obstacle.type === 'palmTree') {
            this.ctx.fillStyle = '#4A2810';
            this.ctx.fillRect(
                obstacle.x + obstacle.width/2 - 3,
                obstacle.y + 15,
                6,
                obstacle.height - 15
            );
            
            this.ctx.fillStyle = '#228B22';
            const swayAngle = Math.sin(Date.now() / 100) * 0.1;
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + swayAngle;
                this.ctx.save();
                this.ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + 15);
                this.ctx.rotate(angle);
                this.ctx.beginPath();
                this.ctx.ellipse(0, -15, 4, 15, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        } else if (obstacle.type === 'signboard') {
            this.ctx.fillStyle = '#FFD700'; // Yellow background
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            this.ctx.fillStyle = '#000'; // Black text
            this.ctx.font = '16px Arial'; // Adjusted font size
            this.ctx.textAlign = 'center'; // Center the text
            this.ctx.fillText('Noon ;)', obstacle.x + obstacle.width / 2, obstacle.y + 20); // Centered text
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawSky();
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(0, this.ground.y, this.canvas.width, this.ground.height);

        this.buildings.forEach(building => {
            this.drawBuilding(building);
        });
        
        // Replace the previous player drawing with the new method
        this.drawPlayer();

        this.obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle);
        });

        const scoreElement = document.querySelector('.score');
        scoreElement.textContent = `HI ${String(this.highScore).padStart(5, '0')} ${String(this.score).padStart(5, '0')}`;

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Game Over, ${this.playerName}! Press Space to Restart`, this.canvas.width / 2, this.canvas.height / 2);
        }
 
    }

    restart() {       
        this.updateHighScores();
        
        this.score = 0;
        this.speed = 5;
        this.gameOver = false;
        this.player.y = this.canvas.height - this.player.height - this.ground.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 60;
        this.lastObstacleX = this.canvas.width;
        this.isInitialized = true; // Pause the game

       // Hide game over overlay
       const playerNameModal = document.getElementById('player-name-modal');
       playerNameModal.style.display = 'none';
     
    }
    // Add method to handle game over
    handleGameOver() {
        this.gameOver = true;
        
        // Show game over modal without resetting story
        const playerNameModal = document.getElementById('player-name-modal');
        const playerNameInput = document.getElementById('player-name-input');
        
        // Pre-fill the player name
        playerNameInput.value = this.playerName;
        playerNameModal.style.display = 'flex';
    }

    updateHighScores() {
        // Only add score if it's higher than 0
        if (this.score > 0) {
            this.highScores.push({
                name: this.playerName,
                score: this.score
            });

            // Sort high scores in descending order
            this.highScores.sort((a, b) => b.score - a.score);

            // Keep only top 5 scores
            this.highScores = this.highScores.slice(0, 5);

            // Save to local storage
            localStorage.setItem('highScores', JSON.stringify(this.highScores));

            // Update high score display
            this.updateHighScoresList();

            // Update high score for this game session
            this.highScore = Math.max(this.score, this.highScore);
        }
    }

    updateHighScoresList() {
        const highScoresList = document.getElementById('high-scores-list');
        highScoresList.innerHTML = ''; // Clear existing list

        this.highScores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span class="badge bg-primary">${entry.score}</span>
            `;
            highScoresList.appendChild(li);
        });
    }

    gameLoop() {
        // Only proceed if the story is complete and game is initialized
        if (!this.storyManager.isStoryComplete || !this.isInitialized) {
            this.render();
            requestAnimationFrame(() => this.gameLoop());
            return;
        }

        this.update();
        this.render();
        
        // Check for special dialogue triggers
        this.storyManager.checkDialogueTriggers(this.score);

        requestAnimationFrame(() => this.gameLoop());
    }
    
}

window.addEventListener('load', () => {
    const playerNameModal = document.getElementById('player-name-modal');
    const playerNameInput = document.getElementById('player-name-input');
    const startGameBtn = document.getElementById('start-game-btn');
    let game = null;

    startGameBtn.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        
        if (playerName) {
            // Hide the modal
            playerNameModal.style.display = 'none';
            
           // Start or restart the game with the player name
            if (game) {
                game.playerName = playerName;
                game.restart(); // Use restart method instead of manual reset
            } else {
                game = new Game(playerName);
                game.isInitialized = true;
            }
        } else {
            alert('Please enter a player name');
        }
    });
    // Allow pressing Enter in the input field
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGameBtn.click();
        }
    });
});