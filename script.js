document.addEventListener('DOMContentLoaded', () => {
    const goals = [
        'The Golden Granary', 'Canal Lake', 'Shoreside Expanse', 'Mages Valley', 'Sentinel Wood', 'Treetower',
        'Stoneside Forest', 'Greenbough', 'Lost Barony', 'Borderlands', 'The Cauldrons', 'The Broken Road',
        'Wildholds', 'Great City', 'Shieldgate', 'Greengold Plains'
    ];

    // Populate goal dropdowns
    const goalDropdowns = ['goalA', 'goalB', 'goalC', 'goalD'];
    goalDropdowns.forEach(dropdown => {
        const select = document.getElementById(dropdown);
        goals.forEach(goal => {
            const option = document.createElement('option');
            option.value = goal;
            option.innerText = goal;
            select.appendChild(option);
        });
    });

    let selectedTerrain = null;

    const grid = document.querySelector('.grid');
    const seasonSelect = document.getElementById('season');
    let currentSeason = seasonSelect.value;

    seasonSelect.addEventListener('change', () => {
        currentSeason = seasonSelect.value;
        updateCoins();
        updateMonsters();
        updateGoals();
        updateSeasonTotal();
        updateFinalScore();
    });

    // Create grid cells
    for (let i = 0; i < 11; i++) { // Adjusted to 11
        for (let j = 0; j < 11; j++) { // Adjusted to 11
            const cell = document.createElement('div');
            // Add mountain and ruin tiles
            if ((i === 2 && j === 3) || (i === 1 && j === 5) || (i === 2 && j === 9) ||
                (i === 8 && j === 2) || (i === 9 && j === 5) || (i === 9 && j === 9)) {
                cell.classList.add('ruin');
            }
            if ((i === 1 && j === 3) || (i === 2 && j === 8) || (i === 8 && j === 3) ||
                (i === 9 && j === 7) || (i === 5 && j === 5)) {
                cell.classList.add('mountain');
                cell.style.backgroundImage = "url('mountain.svg')";
            }
            cell.addEventListener('click', () => {
                if (!cell.classList.contains('mountain')) {
                    if (cell.dataset.terrain) {
                        cell.removeAttribute('data-terrain');
                        cell.style.backgroundColor = '';
                    } else if (selectedTerrain) {
                        cell.dataset.terrain = selectedTerrain;
                        cell.style.backgroundColor = getTerrainColor(selectedTerrain);
                    }
                }
                updateGoals();
                updateMonsters();
                updateSeasonTotal();
                updateFinalScore();
            });
            grid.appendChild(cell);
        }
    }

    // Handle terrain selection
    document.querySelectorAll('.terrain-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTerrain = btn.dataset.terrain;
            document.querySelectorAll('.terrain-btn').forEach(btn => btn.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Create circular slots
    const circleSlots = document.querySelector('.circle-slots');
    for (let i = 0; i < 14; i++) {
        const circle = document.createElement('div');
        circle.addEventListener('click', () => {
            circle.classList.toggle('filled');
            updateCoins();
            updateGoals();
            updateSeasonTotal();
            updateFinalScore();
        });
        circleSlots.appendChild(circle);
    }

    // Clear all coins
    document.getElementById('clear-coins').addEventListener('click', () => {
        document.querySelectorAll('.circle-slots .filled').forEach(circle => {
            circle.classList.remove('filled');
        });
        updateCoins();
        updateGoals();
        updateSeasonTotal();
        updateFinalScore();
    });

    // Clear all inputs
    document.getElementById('clear-all').addEventListener('click', () => {
        document.querySelectorAll('.grid div').forEach(cell => {
            cell.removeAttribute('data-terrain');
            cell.style.backgroundColor = '';
        });
        document.querySelectorAll('.circle-slots .filled').forEach(circle => {
            circle.classList.remove('filled');
        });
        document.querySelectorAll('.season-grid input').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('.season-total input').forEach(input => {
            input.value = '';
        });
        document.getElementById('final-score').value = '';
    });

    // Update coins for selected season
    function updateCoins() {
        const filledCoins = document.querySelectorAll('.circle-slots .filled').length;
        document.getElementById(`${currentSeason}-coins`).value = filledCoins;
    }

    // Update monster score for selected season
    function updateMonsters() {
        let monsterCount = 0;
        const countedCells = new Set();
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                const cell = grid.children[i * 11 + j]; // Adjusted to 11
                if (cell.dataset.terrain === 'monster') {
                    monsterCount += countAdjacentEmptyCells(i, j, countedCells);
                }
            }
        }
        document.getElementById(`${currentSeason}-monsters`).value = -monsterCount;
    }

    // Count empty cells adjacent to a given cell
    function countAdjacentEmptyCells(i, j, countedCells) {
        let count = 0;
        const adjacentCoords = [
            [i - 1, j], [i + 1, j],
            [i, j - 1], [i, j + 1]
        ];
        adjacentCoords.forEach(([x, y]) => {
            if (x >= 0 && x < 11 && y >= 0 && y < 11) { // Adjusted to 11
                const adjacentCell = grid.children[x * 11 + y]; // Adjusted to 11
                const cellIndex = x * 11 + y; // Adjusted to 11
                if (!adjacentCell.dataset.terrain && !countedCells.has(cellIndex)) {
                    count++;
                    countedCells.add(cellIndex);
                }
            }
        });
        return count;
    }

    // Update total score for selected season
    function updateSeasonTotal() {
        const goal1 = parseInt(document.getElementById(`${currentSeason}-goal1`).value) || 0;
        const goal2 = parseInt(document.getElementById(`${currentSeason}-goal2`).value) || 0;
        const coins = parseInt(document.getElementById(`${currentSeason}-coins`).value) || 0;
        const monsters = parseInt(document.getElementById(`${currentSeason}-monsters`).value) || 0;
        const total = goal1 + goal2 + coins + monsters;
        document.getElementById(`${currentSeason}-total`).value = total;
    }

    // Update final score
    function updateFinalScore() {
        let finalScore = 0;
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        seasons.forEach(season => {
            finalScore += parseInt(document.getElementById(`${season}-total`).value) || 0;
        });
        document.getElementById('final-score').value = finalScore;
    }

    // Update season goals based on selected goals
    function updateSeasonGoals() {
        updateGoals();
    }

    // Update goal scores based on the grid content
    function updateGoals() {
        const goals = {
            'The Golden Granary': scoreTheGoldenGranary,
            'Canal Lake': scoreCanalLake,
            'Shoreside Expanse': scoreShoresideExpanse,
            'Mages Valley': scoreMagesValley,
            'Sentinel Wood': scoreSentinelWood,
            'Treetower': scoreTreetower,
            'Stoneside Forest': scoreStonesideForest,
            'Greenbough': scoreGreenbough,
            'Lost Barony': scoreLostBarony,
            'Borderlands': scoreBorderlands,
            'The Cauldrons': scoreTheCauldrons,
            'The Broken Road': scoreTheBrokenRoad,
            'Wildholds': scoreWildholds,
            'Great City': scoreGreatCity,
            'Shieldgate': scoreShieldgate,
            'Greengold Plains': scoreGreengoldPlains
        };

        const goalA = document.getElementById('goalA').value;
        const goalB = document.getElementById('goalB').value;
        const goalC = document.getElementById('goalC').value;
        const goalD = document.getElementById('goalD').value;

        document.getElementById('spring-goal1').dataset.goal = goalA;
        document.getElementById('spring-goal2').dataset.goal = goalB;
        document.getElementById('summer-goal1').dataset.goal = goalB;
        document.getElementById('summer-goal2').dataset.goal = goalC;
        document.getElementById('fall-goal1').dataset.goal = goalC;
        document.getElementById('fall-goal2').dataset.goal = goalD;
        document.getElementById('winter-goal1').dataset.goal = goalD;
        document.getElementById('winter-goal2').dataset.goal = goalA;

        document.querySelectorAll('.goal').forEach(goalInput => {
            if (goalInput.id.startsWith(currentSeason)) {
                const goal = goalInput.dataset.goal;
                goalInput.value = goals[goal]();
            }
        });
    }

    // Scoring functions for each goal
    function scoreTheGoldenGranary() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                const cell = grid.children[i * 11 + j]; // Adjusted to 11
                if (cell.dataset.terrain === 'water' && isAdjacentTo(i, j, 'ruin')) {
                    score++;
                } else if (cell.dataset.terrain === 'farm' && cell.classList.contains('ruin')) {
                    score += 3;
                }
            }
        }
        return score;
    }

    function scoreCanalLake() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                const cell = grid.children[i * 11 + j]; // Adjusted to 11
                if (cell.dataset.terrain === 'water' && isAdjacentTo(i, j, 'farm')) {
                    score++;
                } else if (cell.dataset.terrain === 'farm' && isAdjacentTo(i, j, 'water')) {
                    score++;
                }
            }
        }
        return score;
    }

    function scoreShoresideExpanse() {
        let score = 0;
        const farmClusters = getClusters('farm');
        const waterClusters = getClusters('water');
        farmClusters.forEach(cluster => {
            if (!isClusterAdjacentTo(cluster, 'water') && !isClusterTouchingEdge(cluster)) {
                score += 3;
            }
        });
        waterClusters.forEach(cluster => {
            if (!isClusterAdjacentTo(cluster, 'farm') && !isClusterTouchingEdge(cluster)) {
                score += 3;
            }
        });
        return score;
    }

    function scoreMagesValley() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                const cell = grid.children[i * 11 + j]; // Adjusted to 11
                if (cell.dataset.terrain === 'water' && isAdjacentTo(i, j, 'mountain')) {
                    score += 2;
                } else if (cell.dataset.terrain === 'farm' && isAdjacentTo(i, j, 'mountain')) {
                    score++;
                }
            }
        }
        return score;
    }

    function scoreSentinelWood() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                const cell = grid.children[i * 11 + j]; // Adjusted to 11
                if (cell.dataset.terrain === 'forest' && (i === 0 || i === 10 || j === 0 || j === 10)) {
                    score++;
                }
            }
        }
        return score;
    }

    function scoreTreetower() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                const cell = grid.children[i * 11 + j]; // Adjusted to 11
                if (cell.dataset.terrain === 'forest' && isSurrounded(i, j)) {
                    score++;
                }
            }
        }
        return score;
    }

    function scoreStonesideForest() {
        let score = 0;
        const mountainClusters = getClusters('mountain');
        mountainClusters.forEach(cluster => {
            if (isClusterConnectedBy(cluster, 'forest')) {
                score += 3;
            }
        });
        return score;
    }

    function scoreGreenbough() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            let rowHasForest = false;
            let colHasForest = false;
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                if (grid.children[i * 11 + j].dataset.terrain === 'forest') {
                    rowHasForest = true;
                }
                if (grid.children[j * 11 + i].dataset.terrain === 'forest') {
                    colHasForest = true;
                }
            }
            if (rowHasForest) score++;
            if (colHasForest) score++;
        }
        return score;
    }

    function scoreLostBarony() {
        const filledSpaces = getLargestSquareOfFilledSpaces();
        return Math.sqrt(filledSpaces.length) * 3; // Changed to square root of length
    }

    function scoreBorderlands() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            let rowFilled = true;
            let colFilled = true;
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                if (!grid.children[i * 11 + j].dataset.terrain) {
                    rowFilled = false;
                }
                if (!grid.children[j * 11 + i].dataset.terrain) {
                    colFilled = false;
                }
            }
            if (rowFilled) score += 6;
            if (colFilled) score += 6;
        }
        return score;
    }

    function scoreTheCauldrons() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                if (!grid.children[i * 11 + j].dataset.terrain && isSurrounded(i, j)) {
                    score++;
                }
            }
        }
        return score;
    }

    function scoreTheBrokenRoad() {
        let score = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                if (isDiagonalLineOfFilledSpaces(i, j)) {
                    score += 3;
                }
            }
        }
        return score;
    }

    function scoreWildholds() {
        let score = 0;
        const villageClusters = getClusters('village');
        villageClusters.forEach(cluster => {
            if (cluster.length >= 6) {
                score += 8;
            }
        });
        return score;
    }

    function scoreGreatCity() {
        let score = 0;
        const villageClusters = getClusters('village');
        villageClusters.forEach(cluster => {
            if (!isClusterAdjacentTo(cluster, 'mountain')) {
                score += cluster.length;
            }
        });
        return score;
    }

    function scoreShieldgate() {
        const villageClusters = getClusters('village');
        const sortedClusters = villageClusters.sort((a, b) => b.length - a.length);
        if (sortedClusters.length > 1) {
            return sortedClusters[1].length * 2;
        }
        return 0;
    }

    function scoreGreengoldPlains() {
        let score = 0;
        const villageClusters = getClusters('village');
        villageClusters.forEach(cluster => {
            const terrainTypes = new Set();
            cluster.forEach(([x, y]) => {
                const adjacents = getAdjacentCells(x, y);
                adjacents.forEach(adj => {
                    if (adj.dataset.terrain && adj.dataset.terrain !== 'village') {
                        terrainTypes.add(adj.dataset.terrain);
                    }
                });
            });
            if (terrainTypes.size >= 3) {
                score += 3;
            }
        });
        return score;
    }

    function isAdjacentTo(x, y, terrain) {
        const adjacents = getAdjacentCells(x, y);
        if (terrain === 'ruin' || terrain === 'mountain' ) {
            return adjacents.some(cell => cell.classList.contains(terrain));
        }
        return adjacents.some(cell => cell.dataset.terrain === terrain);
    }

    function getAdjacentCells(x, y) {
        const adjacents = [];
        const coords = [
            [x - 1, y], [x + 1, y],
            [x, y - 1], [x, y + 1]
        ];
        coords.forEach(([i, j]) => {
            if (i >= 0 && i < 11 && j >= 0 && j < 11) { // Adjusted to 11
                adjacents.push(grid.children[i * 11 + j]); // Adjusted to 11
            }
        });
        return adjacents;
    }

    function isSurrounded(x, y) {
        const adjacents = getAdjacentCells(x, y);
        return adjacents.every(cell => cell.dataset.terrain);
    }

    function getClusters(terrain) {
        const visited = new Set();
        const clusters = [];
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                if (grid.children[i * 11 + j].dataset.terrain === terrain && !visited.has(i * 11 + j)) { // Adjusted to 11
                    const cluster = [];
                    const stack = [[i, j]];
                    while (stack.length) {
                        const [x, y] = stack.pop();
                        const cellIndex = x * 11 + y; // Adjusted to 11
                        if (!visited.has(cellIndex)) {
                            visited.add(cellIndex);
                            cluster.push([x, y]);
                            const adjacents = getAdjacentCells(x, y);
                            adjacents.forEach(adj => {
                                if (adj.dataset.terrain === terrain && !visited.has(adj.dataset.index)) {
                                    stack.push([parseInt(adj.dataset.row), parseInt(adj.dataset.col)]);
                                }
                            });
                        }
                    }
                    clusters.push(cluster);
                }
            }
        }
        return clusters;
    }

    function isClusterAdjacentTo(cluster, terrain) {
        return cluster.some(([x, y]) => isAdjacentTo(x, y, terrain));
    }

    function isClusterTouchingEdge(cluster) {
        return cluster.some(([x, y]) => x === 0 || x === 10 || y === 0 || y === 10); // Adjusted to 11
    }

    function isClusterConnectedBy(cluster, terrain) {
        return cluster.every(([x, y]) => isAdjacentTo(x, y, terrain));
    }

    function getLargestSquareOfFilledSpaces() {
        const dp = Array(11).fill().map(() => Array(11).fill(0)); // Adjusted to 11
        let maxSquare = 0;
        for (let i = 0; i < 11; i++) { // Adjusted to 11
            for (let j = 0; j < 11; j++) { // Adjusted to 11
                if (grid.children[i * 11 + j].dataset.terrain) { // Adjusted to 11
                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
                    maxSquare = Math.max(maxSquare, dp[i][j]);
                }
            }
        }
        const filledSpaces = [];
        for (let i = 1; i <= maxSquare; i++) {
            for (let j = 1; j <= maxSquare; j++) {
                filledSpaces.push([maxSquare - i, maxSquare - j]);
            }
        }
        return filledSpaces;
    }

    function isDiagonalLineOfFilledSpaces(x, y) {
        return x === y || x + y === 10; // Adjusted to 11
    }

    function getTerrainColor(terrain) {
        switch (terrain) {
            case 'farm':
                return 'yellow';
            case 'village':
                return 'red';
            case 'water':
                return 'lightblue';
            case 'monster':
                return 'purple';
            case 'forest':
                return 'green';
            default:
                return '';
        }
    }

    // Initialize the page by updating goals and scores for the default season (spring)
    updateSeasonGoals();
    updateCoins();
    updateMonsters();
    updateGoals();
    updateSeasonTotal();
    updateFinalScore();

    // Listen for changes in goal dropdowns and update goals accordingly
    document.querySelectorAll('#goalA, #goalB, #goalC, #goalD').forEach(dropdown => {
        dropdown.addEventListener('change', () => {
            updateSeasonGoals();
            updateGoals();
            updateSeasonTotal();
            updateFinalScore();
        });
    });
});
