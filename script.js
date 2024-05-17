document.addEventListener('DOMContentLoaded', () => {
    const goals = [
        'The Golden Granary', 'Canal Lake', 'Shoreside Expanse', 'Mages Valley', 'Sentinel Wood', 'Treetower',
        'Stoneside Forest', 'Greenbough', 'Lost Barony', 'Borderlands', 'The Cauldrons', 'The Broken Road',
        'Wildholds', 'Great City', 'Shieldgate', 'Greengold Plains'
    ];

    const goalDropdowns = ['goalA', 'goalB', 'goalC', 'goalD'];
    const terrainColors = {
        'farm': 'yellow',
        'water': 'lightblue',
        'village': 'red',
        'forest': 'green',
        'monster': 'purple'
    };

    const grid = document.querySelector('.grid');
    const seasonSelect = document.getElementById('season');
    const circleSlots = document.querySelector('.circle-slots');
    let selectedTerrain = null;
    let currentSeason = seasonSelect.value;

    initDropdowns();
    initGrid();
    initCircleSlots();
    initListeners();
    updateAll();

    function initDropdowns() {
        goalDropdowns.forEach(dropdownId => {
            const select = document.getElementById(dropdownId);
            goals.forEach(goal => {
                const option = document.createElement('option');
                option.value = goal;
                option.innerText = goal;
                select.appendChild(option);
            });
        });
    }

    function initGrid() {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                const cell = document.createElement('div');
                addSpecialTiles(cell, i, j);
                cell.addEventListener('click', () => handleCellClick(cell));
                grid.appendChild(cell);
            }
        }
    }

    function addSpecialTiles(cell, i, j) {
        if (isRuinTile(i, j)) {
            cell.classList.add('ruin');
        }
        if (isMountainTile(i, j)) {
            cell.classList.add('mountain');
            cell.style.backgroundImage = "url('mountain.svg')";
        }
    }

    function isRuinTile(i, j) {
        const ruins = [[2, 1], [1, 5], [2, 9], [8, 1], [9, 5], [8, 9]];
        return ruins.some(coord => coord[0] === i && coord[1] === j);
    }

    function isMountainTile(i, j) {
        const mountains = [[1, 3], [2, 8], [8, 2], [9, 7], [5, 5]];
        return mountains.some(coord => coord[0] === i && coord[1] === j);
    }

    function handleCellClick(cell) {
        if (!cell.classList.contains('mountain')) {
            if (cell.dataset.terrain) {
                cell.removeAttribute('data-terrain');
                cell.style.backgroundColor = '';
            } else if (selectedTerrain) {
                cell.dataset.terrain = selectedTerrain;
                cell.style.backgroundColor = terrainColors[selectedTerrain] || '';
            }
        }
        updateAll();
    }

    function initCircleSlots() {
        for (let i = 0; i < 14; i++) {
            const circle = document.createElement('div');
            circle.addEventListener('click', () => {
                circle.classList.toggle('filled');
                updateAll();
            });
            circleSlots.appendChild(circle);
        }
    }

    function initListeners() {
        seasonSelect.addEventListener('change', () => {
            currentSeason = seasonSelect.value;
            updateAll();
        });

        document.querySelectorAll('.terrain-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedTerrain = btn.dataset.terrain;
                document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        document.getElementById('clear-coins').addEventListener('click', () => {
            document.querySelectorAll('.circle-slots .filled').forEach(circle => circle.classList.remove('filled'));
            updateAll();
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            document.querySelectorAll('.grid div').forEach(cell => {
                cell.removeAttribute('data-terrain');
                cell.style.backgroundColor = '';
            });
            document.querySelectorAll('.circle-slots .filled').forEach(circle => circle.classList.remove('filled'));
            document.querySelectorAll('.season-grid input, .season-total input, .final-score input').forEach(input => input.value = '');
        });

        document.querySelectorAll('#goalA, #goalB, #goalC, #goalD').forEach(dropdown => {
            dropdown.addEventListener('change', () => {
                updateGoals();
                updateAll();
            });
        });
    }

    function updateAll() {
        updateCoins();
        updateMonsters();
        updateGoals();
        updateSeasonTotal();
        updateFinalScore();
    }

    function updateCoins() {
        const filledCoins = document.querySelectorAll('.circle-slots .filled').length;
        document.getElementById(`${currentSeason}-coins`).value = filledCoins;
    }

    function updateMonsters() {
        let monsterCount = 0;
        const countedCells = new Set();
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === 'monster') {
                monsterCount += countAdjacentEmptyCells(i, j, countedCells);
            }
        });
        document.getElementById(`${currentSeason}-monsters`).value = -monsterCount;
    }

    function countAdjacentEmptyCells(i, j, countedCells) {
        let count = 0;
        const adjacentCoords = [
            [i - 1, j], [i + 1, j],
            [i, j - 1], [i, j + 1]
        ];
        adjacentCoords.forEach(([x, y]) => {
            if (isValidCoord(x, y)) {
                const adjacentCell = grid.children[x * 11 + y];
                const cellIndex = x * 11 + y;
                if (!adjacentCell.dataset.terrain && !countedCells.has(cellIndex)) {
                    count++;
                    countedCells.add(cellIndex);
                }
            }
        });
        return count;
    }

    function isValidCoord(x, y) {
        return x >= 0 && x < 11 && y >= 0 && y < 11;
    }

    function updateSeasonTotal() {
        const goal1 = parseInt(document.getElementById(`${currentSeason}-goal1`).value) || 0;
        const goal2 = parseInt(document.getElementById(`${currentSeason}-goal2`).value) || 0;
        const coins = parseInt(document.getElementById(`${currentSeason}-coins`).value) || 0;
        const monsters = parseInt(document.getElementById(`${currentSeason}-monsters`).value) || 0;
        const total = goal1 + goal2 + coins + monsters;
        document.getElementById(`${currentSeason}-total`).value = total;
    }

    function updateFinalScore() {
        let finalScore = 0;
        ['spring', 'summer', 'fall', 'winter'].forEach(season => {
            finalScore += parseInt(document.getElementById(`${season}-total`).value) || 0;
        });
        document.getElementById('final-score').value = finalScore;
    }

    function updateGoals() {
        const goalsMap = {
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

        const goalsForSeason = {
            'spring': [document.getElementById('goalA').value, document.getElementById('goalB').value],
            'summer': [document.getElementById('goalB').value, document.getElementById('goalC').value],
            'fall': [document.getElementById('goalC').value, document.getElementById('goalD').value],
            'winter': [document.getElementById('goalD').value, document.getElementById('goalA').value]
        };

        ['spring', 'summer', 'fall', 'winter'].forEach(season => {
            const [goal1, goal2] = goalsForSeason[season];
            document.getElementById(`${season}-goal1`).value = goalsMap[goal1]();
            document.getElementById(`${season}-goal2`).value = goalsMap[goal2]();
        });
    }

    function iterateGrid(callback) {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                const cell = grid.children[i * 11 + j];
                callback(i, j, cell);
            }
        }
    }

    function getClusters(terrain) {
        const visited = new Set();
        const clusters = [];
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === terrain && !visited.has(i * 11 + j)) {
                const cluster = [];
                const stack = [[i, j]];
                while (stack.length) {
                    const [x, y] = stack.pop();
                    const cellIndex = x * 11 + y;
                    if (!visited.has(cellIndex)) {
                        visited.add(cellIndex);
                        cluster.push([x, y]);
                        getAdjacentCells(x, y).forEach(adj => {
                            if (adj.dataset.terrain === terrain && !visited.has(adj.dataset.index)) {
                                stack.push([parseInt(adj.dataset.row), parseInt(adj.dataset.col)]);
                            }
                        });
                    }
                }
                clusters.push(cluster);
            }
        });
        return clusters;
    }

    function getAdjacentCells(x, y) {
        const adjacents = [];
        const coords = [
            [x - 1, y], [x + 1, y],
            [x, y - 1], [x, y + 1]
        ];
        coords.forEach(([i, j]) => {
            if (isValidCoord(i, j)) {
                adjacents.push(grid.children[i * 11 + j]);
            }
        });
        return adjacents;
    }

    function isClusterTouchingEdge(cluster) {
        return cluster.some(([x, y]) => x === 0 || x === 10 || y === 0 || y === 10);
    }

    function isClusterAdjacentTo(cluster, terrain) {
        return cluster.some(([x, y]) => getAdjacentCells(x, y).some(adj => adj.dataset.terrain === terrain));
    }

    function scoreTheGoldenGranary() {
        let score = 0;
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === 'water' && isAdjacentTo(i, j, 'ruin')) {
                score++;
            } else if (cell.dataset.terrain === 'farm' && cell.classList.contains('ruin')) {
                score += 3;
            }
        });
        return score;
    }

    function scoreCanalLake() {
        let score = 0;
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === 'water' && isAdjacentTo(i, j, 'farm')) {
                score++;
            } else if (cell.dataset.terrain === 'farm' && isAdjacentTo(i, j, 'water')) {
                score++;
            }
        });
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
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === 'water' && isAdjacentTo(i, j, 'mountain')) {
                score += 2;
            } else if (cell.dataset.terrain === 'farm' && isAdjacentTo(i, j, 'mountain')) {
                score++;
            }
        });
        return score;
    }

    function scoreSentinelWood() {
        let score = 0;
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === 'forest' && (i === 0 || i === 10 || j === 0 || j === 10)) {
                score++;
            }
        });
        return score;
    }

    function scoreTreetower() {
        let score = 0;
        iterateGrid((i, j, cell) => {
            if (cell.dataset.terrain === 'forest' && isSurrounded(i, j)) {
                score++;
            }
        });
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
        for (let i = 0; i < 11; i++) {
            let rowHasForest = false;
            let colHasForest = false;
            for (let j = 0; j < 11; j++) {
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
        return Math.sqrt(filledSpaces.length) * 3;
    }

    function scoreBorderlands() {
        let score = 0;
        for (let i = 0; i < 11; i++) {
            let rowFilled = true;
            let colFilled = true;
            for (let j = 0; j < 11; j++) {
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
        iterateGrid((i, j, cell) => {
            if (!cell.dataset.terrain && isSurrounded(i, j)) {
                score++;
            }
        });
        return score;
    }

    function scoreTheBrokenRoad() {
        let score = 0;
        iterateGrid((i, j) => {
            if (isDiagonalLineOfFilledSpaces(i, j)) {
                score += 3;
            }
        });
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
                getAdjacentCells(x, y).forEach(adj => {
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

    function getLargestSquareOfFilledSpaces() {
        const dp = Array(11).fill().map(() => Array(11).fill(0));
        let maxSquare = 0;
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if (grid.children[i * 11 + j].dataset.terrain) {
                    dp[i][j] = Math.min(dp[i - 1]?.[j] || 0, dp[i][j - 1] || 0, dp[i - 1]?.[j - 1] || 0) + 1;
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

    function isSurrounded(x, y) {
        return getAdjacentCells(x, y).every(cell => cell.dataset.terrain);
    }

    function isDiagonalLineOfFilledSpaces(x, y) {
        return x === y || x + y === 10;
    }

    function isAdjacentTo(x, y, terrain) {
        const adjacents = getAdjacentCells(x, y);
        if (terrain === 'ruin' || terrain === 'mountain' ) {
            return adjacents.some(cell => cell.classList.contains(terrain));
        }
        return adjacents.some(cell => cell.dataset.terrain === terrain);
    }

    function isClusterConnectedBy(cluster, terrain) {
        return cluster.every(([x, y]) => isAdjacentTo(x, y, terrain));
    }
});
