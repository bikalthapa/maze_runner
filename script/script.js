const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Adjust for device pixel ratio
const dpr = window.devicePixelRatio || 1;
canvas.width = 400 * dpr;
canvas.height = 400 * dpr;
canvas.style.width = '400px';
canvas.style.height = '400px';
ctx.scale(dpr, dpr);


// Game data
let rowlen = 25;
let collen = 25;
let cellWidth = 15;
let startPos = { x: 7, y: 7 };
let lineColor = "blue";
let lineWidth = 2;

let board = new Array(rowlen).fill().map(() => new Array(collen));
class Cell {
    constructor(color, lineWidth, cellPos, dimension) {
        this.color = color; // Line color
        this.lineWidth = lineWidth; // Line thickness
        this.width = dimension.width; // Cell width
        this.height = dimension.height; // Cell height
        this.isVisited = false;
        this.walls = [true,true,true,true];//Initially top, right, buttom and left are set with walls
        this.neighbour = { pos: [], selectOrder: [], count: 0 };
        this.pos = { x: cellPos.x, y: cellPos.y }; // Position on canvas
        this.index = { x: Math.floor(cellPos.x / dimension.width), y: Math.floor(cellPos.y / dimension.height) };
    }

    // This function will draw the cell
    drawCell(ctx, line_dir) {
        ctx.strokeStyle = this.color; // Set line color
        ctx.lineWidth = this.lineWidth; // Set line thickness

        ctx.beginPath();
        switch (line_dir) {
            case "top":
                ctx.moveTo(this.pos.x, this.pos.y);
                ctx.lineTo(this.pos.x + this.width, this.pos.y);
                break;
            case "right":
                ctx.moveTo(this.pos.x + this.width, this.pos.y);
                ctx.lineTo(this.pos.x + this.width, this.pos.y + this.height);
                break;
            case "bottom":
                ctx.moveTo(this.pos.x, this.pos.y + this.height);
                ctx.lineTo(this.pos.x + this.width, this.pos.y + this.height);
                break;
            case "left":
                ctx.moveTo(this.pos.x, this.pos.y);
                ctx.lineTo(this.pos.x, this.pos.y + this.height);
                break;
            default:
                console.warn(`Invalid line direction: ${line_dir}`);
        }
        ctx.stroke();
    }

    // This function will erase the line 
    eraseLine(ctx, line_dir) {
        switch (line_dir) {
            case "top":
                // Clear the top line with full thickness
                ctx.clearRect(this.pos.x + this.lineWidth / 2, this.pos.y - this.lineWidth / 2, this.width - this.lineWidth, this.lineWidth);
                break;
            case "right":
                // Clear the right line with full thickness
                ctx.clearRect(this.pos.x + this.width - this.lineWidth / 2, this.pos.y + this.lineWidth / 2, this.lineWidth, this.height - this.lineWidth);
                break;
            case "bottom":
                // Clear the bottom line with full thickness
                ctx.clearRect(this.pos.x + this.lineWidth / 2, this.pos.y + this.height - this.lineWidth / 2, this.width - this.lineWidth, this.lineWidth);
                break;
            case "left":
                // Clear the left line with full thickness
                ctx.clearRect(this.pos.x - this.lineWidth / 2, this.pos.y + this.lineWidth / 2, this.lineWidth, this.height - this.lineWidth);
                break;
            default:
                console.warn(`Invalid line direction: ${line_dir}`);
        }
    }
    indicateCell(ctx, color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.pos.x + this.lineWidth / 2, this.pos.y + this.lineWidth / 2, this.width - this.lineWidth, this.height - this.lineWidth);
        return true;
    }
    // This function will find all the neighbours and set it into this.neighbour and returns the index of available neighbour from this.neighbours
    findUnvisitedNeighbour(totalRow, totalCol) {
        let neighbourIndex = [];
    
        // Clear previous neighbour positions
        this.neighbour.pos = [null, null, null, null];
    
        // Check the top neighbor
        let tempPos = { x: this.index.x, y: this.index.y - 1 };
        if (tempPos.y >= 0 && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[0] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(0);
        }
    
        // Check the right neighbor
        tempPos = { x: this.index.x + 1, y: this.index.y };
        if (tempPos.x < totalCol && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[1] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(1);
        }
    
        // Check the bottom neighbor
        tempPos = { x: this.index.x, y: this.index.y + 1 };
        if (tempPos.y < totalRow && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[2] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(2);
        }
    
        // Check the left neighbor
        tempPos = { x: this.index.x - 1, y: this.index.y };
        if (tempPos.x >= 0 && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[3] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(3);
        }
    
        // Shuffle the valid neighbour indices
        for (let i = neighbourIndex.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbourIndex[i], neighbourIndex[j]] = [neighbourIndex[j], neighbourIndex[i]];
        }
    
        // Store the shuffled order of neighbors
        this.neighbour.selectOrder = neighbourIndex;
    }
    
    // This function will check whether the neighbour is remained to visit if remain returns true
    isNeighbourLeft() {
        if (this.neighbour.selectOrder.length!=0) {
            return true;
        }
        return false;
    }
    // This function will return the index of next neighbour
    getNextNeighbourIndx() {
        return (this.neighbour.pos[this.neighbour.selectOrder[this.neighbour.count]]);
    }
    setWalls(border,value){
        if(border=="top"){
            this.walls[0] = value;
        }else if(border=="right"){
            this.walls[1] = value;
        }else if(border=="bottom"){
            this.walls[2] = value;
        }else{
            this.walls[3] = value;
        }
    }
    findAllWalls(totalRow, totalCol) {
        let neighbourIndex = [];
    
        
    
        // Check the top neighbor
        let tempPos = { x: this.index.x, y: this.index.y - 1 };
        if (tempPos.y >= 0 && !board[tempPos.x][tempPos.y].isVisited) {
            this.walls[0]
        }
    
        // Check the right neighbor
        tempPos = { x: this.index.x + 1, y: this.index.y };
        if (tempPos.x < totalCol && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[1] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(1);
        }
    
        // Check the bottom neighbor
        tempPos = { x: this.index.x, y: this.index.y + 1 };
        if (tempPos.y < totalRow && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[2] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(2);
        }
    
        // Check the left neighbor
        tempPos = { x: this.index.x - 1, y: this.index.y };
        if (tempPos.x >= 0 && !board[tempPos.x][tempPos.y].isVisited) {
            this.neighbour.pos[3] = { x: tempPos.x, y: tempPos.y };
            neighbourIndex.push(3);
        }
    }
}





// This function will create the grid in canvas
function createGrid(startPos, cellWidth, rowlen, collen, color, lineWidth) {
    // This is for making grid layout
    let prevPosX = startPos.x;
    let prevPosY = startPos.y;
    for (let i = 0; i < rowlen; i++) {
        for (let j = 0; j < collen; j++) {
            board[j][i] = new Cell(color, lineWidth, { x: prevPosX, y: prevPosY }, { height: cellWidth, width: cellWidth });
            board[j][i].drawCell(ctx, 'right');
            board[j][i].drawCell(ctx, 'top');
            board[j][i].drawCell(ctx, 'bottom');
            board[j][i].drawCell(ctx, 'left');
            prevPosX += cellWidth;
        }
        prevPosX = startPos.x;
        prevPosY += cellWidth;
    }


}

// This function will remove the line between two cells
function removeLineBetwen(currCell, nextCell) {
    if (currCell.index.x == nextCell.index.x) {// Next cell is at either top or bottom side of current cell
        if (currCell.index.y > nextCell.index.y) {//Next cell lies at top
            currCell.eraseLine(ctx, 'top');
            currCell.setWalls("top",false);
            nextCell.setWalls("bottom",false);
        } else {// Next cell lies at bottom
            currCell.eraseLine(ctx, 'bottom');
            currCell.setWalls("bottom",false);
            nextCell.setWalls("top",false);
        }
    } else if (currCell.index.y == nextCell.index.y) {// Next cell is at either left or right side of current cell 
        if (currCell.index.x > nextCell.index.x) {
            currCell.eraseLine(ctx, 'left');
            currCell.setWalls("left",false);
            nextCell.setWalls("right",false);
        } else {
            currCell.eraseLine(ctx, 'right');
            currCell.setWalls("right",false);
            nextCell.setWalls("left",false);
        }
    }
}

/*
1. hoose the initial cell, mark it as visited and push it to the stack
2. While the stack is not empty
    1.Pop a cell from the stack and make it a current cell
    2.If the current cell has any neighbours which have not been visited
        1. Push the current cell to the stack
        2. Choose one of the unvisited neighbours
        3. Remove the wall between the current cell and the chosen cell
        4.Mark the chosen cell as visited and push it to the stack
*/

function generateMazeDFS(startIndx) {
    let stack = []; // Stack to keep track of the visited cells
    let currentIndx = startIndx;
    let currentCell = board[currentIndx.x][currentIndx.y];

    // Push the start cell to the stack and mark it as visited
    stack.push(currentCell);
    currentCell.isVisited = true;

    let longestPath = []; // Array to store the longest path
    let longestPathLength = 0; // Store the length of the longest path
    let destinationCell = currentCell; // Track the destination cell (the farthest cell)

    while (stack.length > 0) {
        currentCell = stack[stack.length - 1]; // Peek at the top of the stack

        // Find all unvisited neighbors of the current cell
        currentCell.findUnvisitedNeighbour(rowlen, collen);

        // If there are any unvisited neighbors left
        if (currentCell.isNeighbourLeft()) {
            // Get the next unvisited neighbor using shuffled neighbor indices
            let nextIndx = currentCell.getNextNeighbourIndx(); // Gets the next shuffled neighbor
            let nextCell = board[nextIndx.x][nextIndx.y];

            // If the neighbor hasn't been visited yet
            if (!nextCell.isVisited) {
                // Remove the wall between the current cell and the chosen neighbor
                removeLineBetwen(currentCell, nextCell);

                // Mark the chosen neighbor as visited and push it to the stack
                nextCell.isVisited = true;
                stack.push(nextCell); // Move to the next cell

                // Check if the current stack size is the longest so far
                if (stack.length > longestPathLength) {
                    longestPathLength = stack.length; // Update the longest path length
                    longestPath = [...stack]; // Save the current path as the longest path
                    destinationCell = nextCell; // Update the destination to the farthest cell
                }
            }
        } else {
            // If no unvisited neighbors, backtrack by popping the stack
            stack.pop();
        }
    }

    // After the maze is generated, the longest path is stored in `longestPath`
    console.log("Longest Path Length:", longestPathLength);
    console.log("Longest Path:", longestPath);

    // Indicate the destination (the farthest point)
    indicateDestination(destinationCell, 'red'); // Indicate the destination cell with a red color
}


/*
This algorithm is a randomized version of Prim's algorithm.

1. Start with a grid full of walls.
2. Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
3. While there are walls in the list:
    1.Pick a random wall from the list. If only one of the cells that the wall divides is visited, then:
        1. Make the wall a passage and mark the unvisited cell as part of the maze.
        2. Add the neighboring walls of the cell to the wall list.
    2. Remove the wall from the list.
*/
function generateMazePRIMS(startIndx){
    let startCell = board[startIndx.x][startIndx.y];
    
}
// Function to indicate a specific cell (destination) on the canvas
function indicateDestination(cell, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cell.pos.x + cell.lineWidth / 2, cell.pos.y + cell.lineWidth / 2, cell.width - cell.lineWidth, cell.height - cell.lineWidth);
}





function getWallIndx(fromIndx, toIndx){
    if (fromIndx.x == toIndx.x) {
        if (fromIndx.y > toIndx.y) {
            return 0; // Top wall
        } else {
            return 2; // Bottom wall
        }
    } else if (fromIndx.y == toIndx.y) {
        if (fromIndx.x > toIndx.x) {
            return 3; // Left wall
        } else {
            return 1; // Right wall
        }
    }
    return false;
}

function moveCharacter(fromIndx, toIndx){
    let currentCell = board[fromIndx.x][fromIndx.y];
    let nextCell = board[toIndx.x][toIndx.y];
    currentCell.indicateCell(ctx, "white");
    nextCell.indicateCell(ctx, "red");
}

function isValidMoves(fromIndx, toIndx){
    if (toIndx.x >= 0 && toIndx.x < board.length && toIndx.y >= 0 && toIndx.y < board[0].length) {
        let wallIndx = getWallIndx(fromIndx, toIndx);
            let currentCell = board[fromIndx.x][fromIndx.y];
            if (currentCell.walls[wallIndx]==false) {
                return true;
            }
    }
    return false;
}

let characterIndx = {x: 0, y: 0};

document.addEventListener('keydown', function(event) {
    let tempPos;
    switch (event.key) {
        case 'ArrowDown':
            tempPos = {x: characterIndx.x, y: characterIndx.y + 1};
            if (isValidMoves(characterIndx, tempPos)) {
                moveCharacter(characterIndx, tempPos);
                characterIndx.y++;
            }
            break;
        case 'ArrowLeft':
            tempPos = {x: characterIndx.x - 1, y: characterIndx.y};
            if (isValidMoves(characterIndx, tempPos)) {
                moveCharacter(characterIndx, tempPos);
                characterIndx.x--;
            }
            break;
        case 'ArrowUp':
            tempPos = {x: characterIndx.x, y: characterIndx.y - 1};
            if (isValidMoves(characterIndx, tempPos)) {
                moveCharacter(characterIndx, tempPos);
                characterIndx.y--;
            }
            break;
        case 'ArrowRight':
            tempPos = {x: characterIndx.x + 1, y: characterIndx.y};
            if (isValidMoves(characterIndx, tempPos)) {
                moveCharacter(characterIndx, tempPos);
                characterIndx.x++;
            }
            break;
    }
});




createGrid(startPos, cellWidth, rowlen, collen, lineColor, lineWidth);
board[0][0].indicateCell(ctx, "red");

// board[0][1].isVisited = true;
// board[0][1].indicateCell(ctx, "green");
// board[1][0].isVisited = true;
// board[1][0].indicateCell(ctx, "yellow");

// board[0][0].findUnvisitedNeighbour(rowlen, collen);

// console.log(board[0][0].neighbour);
generateMazeDFS({ x: 0, y: 0 });
// generateMazePRIMS({ x: 0, y: 0 });
