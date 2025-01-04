const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Adjust for device pixel ratio
const dpr = window.devicePixelRatio || 1;
canvas.width = 500 * dpr;
canvas.height = 500 * dpr;
canvas.style.width = '500px';
canvas.style.height = '500px';
ctx.scale(dpr, dpr);

// Cell class for maze cell
class Cell {
    constructor(color, lineWidth, cellPos, dimension) {
        this.color = color; // Line color
        this.lineWidth = lineWidth; // Line thickness
        this.width = dimension.width; // Cell width
        this.height = dimension.height; // Cell height
        this.isVisited = false;
        this.walls = [true, true, true, true];//Initially top, right, buttom and left are set with walls
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

    // This function will check whether the neighbour is remained to visit if remain returns true
    isNeighbourLeft() {
        if (this.neighbour.selectOrder.length != 0) {
            return true;
        }
        return false;
    }
    // This function will return the index of next neighbour
    getNextNeighbourIndx() {
        return (this.neighbour.pos[this.neighbour.selectOrder[this.neighbour.count]]);
    }
    setWalls(border, value) {
        if (border == "top") {
            this.walls[0] = value;
        } else if (border == "right") {
            this.walls[1] = value;
        } else if (border == "bottom") {
            this.walls[2] = value;
        } else {
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

class Maze {
    constructor(rowlen, collen) {
        this.row = rowlen;
        this.col = collen;
        this.board = new Array(rowlen).fill().map(() => new Array(collen));
        this.character = null;
    }

    // This function will create the grid in canvas
    createGrid(ctx, selected) {
        let startPos = selected.startPos;
        let prevPosX = startPos.x;
        let prevPosY = startPos.y;
        for (let i = 0; i < selected.row; i++) {
            for (let j = 0; j < selected.col; j++) {
                this.board[j][i] = new Cell(
                    selected.lineColor,
                    selected.lineWidth,
                    { x: prevPosX, y: prevPosY },
                    { height: selected.cellWidth, width: selected.cellWidth }
                );
                this.board[j][i].drawCell(ctx, 'right');
                this.board[j][i].drawCell(ctx, 'top');
                this.board[j][i].drawCell(ctx, 'bottom');
                this.board[j][i].drawCell(ctx, 'left');
                prevPosX += selected.cellWidth;
            }
            prevPosX = startPos.x;
            prevPosY += selected.cellWidth;
        }
    }

    // This function will remove the line between two cells
    removeLineBetween(ctx, currCell, nextCell) {
        if (currCell.index.x == nextCell.index.x) {
            if (currCell.index.y > nextCell.index.y) {
                currCell.eraseLine(ctx, 'top');
                currCell.setWalls("top", false);
                nextCell.setWalls("bottom", false);
            } else {
                currCell.eraseLine(ctx, 'bottom');
                currCell.setWalls("bottom", false);
                nextCell.setWalls("top", false);
            }
        } else if (currCell.index.y == nextCell.index.y) {
            if (currCell.index.x > nextCell.index.x) {
                currCell.eraseLine(ctx, 'left');
                currCell.setWalls("left", false);
                nextCell.setWalls("right", false);
            } else {
                currCell.eraseLine(ctx, 'right');
                currCell.setWalls("right", false);
                nextCell.setWalls("left", false);
            }
        }
    }

    // This function will find all the neighbours and set it into this.neighbour and returns the index of available neighbour from this.neighbours
    findUnvisitedNeighbour(selectedIndx) {
        let neighbourIndex = [];
        let selected_cell = this.board[selectedIndx.x][selectedIndx.y];

        // Clear previous neighbour positions
        selected_cell.neighbour.pos = [null, null, null, null];

        // Check the top neighbor
        let tempPos = { x: selectedIndx.x, y: selectedIndx.y - 1 };
        if (tempPos.y >= 0) {
            if(!this.board[tempPos.x][tempPos.y].isVisited){
                selected_cell.neighbour.pos[0] = { x: tempPos.x, y: tempPos.y };
                neighbourIndex.push(0);
            }
        }

        // Check the right neighbor
        tempPos = { x: selectedIndx.x + 1, y: selectedIndx.y };
        if (tempPos.x < this.row) {
            if(!this.board[tempPos.x][tempPos.y].isVisited){
                selected_cell.neighbour.pos[1] = { x: tempPos.x, y: tempPos.y };
                neighbourIndex.push(1);
            }
        }

        // Check the bottom neighbor
        tempPos = { x: selectedIndx.x, y: selectedIndx.y + 1 };
        if (tempPos.y < this.row) {
            if(!this.board[tempPos.x][tempPos.y].isVisited){
                selected_cell.neighbour.pos[2] = { x: tempPos.x, y: tempPos.y };
                neighbourIndex.push(2);
            }
        }

        // Check the left neighbor
        tempPos = { x: selectedIndx.x - 1, y: selectedIndx.y };
        if (tempPos.x >= 0) {
            if(!this.board[tempPos.x][tempPos.y].isVisited){
                selected_cell.neighbour.pos[3] = { x: tempPos.x, y: tempPos.y };
                neighbourIndex.push(3);
            }
        }

        // Shuffle the valid neighbour indices
        for (let i = neighbourIndex.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbourIndex[i], neighbourIndex[j]] = [neighbourIndex[j], neighbourIndex[i]];
        }

        // Store the shuffled order of neighbors
        selected_cell.neighbour.selectOrder = neighbourIndex;
    }

    // This function will generate maze using DFS recursive backtracking algorithm
    applyDFS(ctx, startIndx) {
        let stack = [];
        let currentIndx = startIndx;
        let currentCell = this.board[currentIndx.x][currentIndx.y];
    
        stack.push(currentCell);
        currentCell.isVisited = true;
    
        let longestPath = [];
        let longestPathLength = 0;
        let destinationCell = currentCell;
    
        while (stack.length > 0) {
            currentCell = stack[stack.length - 1];
            currentIndx = { x: currentCell.index.x, y: currentCell.index.y }; // Update currentIndx
    
            this.findUnvisitedNeighbour(currentIndx);
    
            if (currentCell.isNeighbourLeft()) {
                let nextIndx = currentCell.getNextNeighbourIndx();
                let nextCell = this.board[nextIndx.x][nextIndx.y];
    
                if (!nextCell.isVisited) {
                    this.removeLineBetween(ctx, currentCell, nextCell);
    
                    nextCell.isVisited = true;
                    stack.push(nextCell);
    
                    if (stack.length > longestPathLength) {
                        longestPathLength = stack.length;
                        longestPath = [...stack];
                        destinationCell = nextCell;
                    }
                }
            } else {
                stack.pop();
            }
        }
    }

    // This function will generate maze using PRIMS algorithm
    applyPRIMS(ctx, startIndx) {
        let startCell = this.board[startIndx.x][startIndx.y];
        let walls = [];
        let directions = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 }
        ];

        startCell.visited = true;

        directions.forEach(dir => {
            let newX = startIndx.x + dir.x;
            let newY = startIndx.y + dir.y;
            if (newX >= 0 && newX < this.board.length && newY >= 0 && newY < this.board[0].length) {
                walls.push({ from: startIndx, to: { x: newX, y: newY } });
            }
        });

        while (walls.length > 0) {
            let randomWallIndex = Math.floor(Math.random() * walls.length);
            let wall = walls[randomWallIndex];
            let fromCell = this.board[wall.from.x][wall.from.y];
            let toCell = this.board[wall.to.x][wall.to.y];

            if (fromCell.visited !== toCell.visited) {
                toCell.visited = true;

                this.removeLineBetween(ctx, fromCell, toCell);

                directions.forEach(dir => {
                    let newX = wall.to.x + dir.x;
                    let newY = wall.to.y + dir.y;
                    if (newX >= 0 && newX < this.board.length && newY >= 0 && newY < this.board[0].length) {
                        walls.push({ from: wall.to, to: { x: newX, y: newY } });
                    }
                });
            }

            walls.splice(randomWallIndex, 1);
        }
    }

    // This function will set the character to the maze
    setCharacter(character, atIndx) {
        this.character = character;
        this.board[atIndx.x][atIndx.y].indicateCell(ctx, "red");
    }
}

class Character {
    constructor(img, w, h, totalFrame, frameRate, scale) {
        this.energy = 100;
        this.position = { x: 0, y: 0 }; // Character's position on canvas
        this.prevPosition = { x: 0, y: 0 }; // Previous position for clearing
        this.currState = "idle"; // Default state
        this.frames = {
            image: img,
            width: w,
            height: h,
            totalFrames: totalFrame,
            frameRate: frameRate,
            scale: scale,
            anim: { row: 0, col: 0 }
        };
        this.animId = null;
        this.currentFrame = 0;
    }

    // Draw current animation frame
    draw(ctx) {
        const { image, width, height, scale, anim } = this.frames;
        const column = anim.col;
        const row = this.currentFrame % (image.height/height);

        // Clear previous position
        ctx.clearRect(this.prevPosition.x, this.prevPosition.y, width * scale, height * scale);

        // Draw current frame
        ctx.drawImage(
            image,
            column * width,
            row * height,
            width,
            height,
            this.position.x,
            this.position.y,
            width * scale,
            height * scale
        );

        // Update previous position
        this.prevPosition.x = this.position.x;
        this.prevPosition.y = this.position.y;
    }

    // Animate character frames
    animateCharacter(ctx) {
        const { totalFrames } = this.frames;

        const updateFrame = () => {
            this.currentFrame = (this.currentFrame + 1) % totalFrames;
            this.draw(ctx);
            this.animId = requestAnimationFrame(updateFrame);
        };

        if (!this.animId) {
            this.animId = requestAnimationFrame(updateFrame);
        }
    }

    stopAnimation() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    // Move character based on direction
    moveCharacter(ctx, direction) {
        switch (direction) {
            case "ArrowUp":
                this.frames.anim.col = 2;
                this.position.y -= 5;
                this.currState = "movingUp";
                break;
            case "ArrowDown":
                this.frames.anim.col = 0;
                this.position.y += 5;
                this.currState = "movingDown";
                break;
            case "ArrowLeft":
                this.frames.anim.col = 1;
                this.position.x -= 5;
                this.currState = "movingLeft";
                break;
            case "ArrowRight":
                this.frames.anim.col = 3;
                this.position.x += 5;
                this.currState = "movingRight";
                break;
            default:
                this.currState = "idle";
                this.stopAnimation();
                return;
        }

        this.animateCharacter(ctx);
    }
}
var selected_level = 0;
var cellWidth = 30;
// Initializing the character images
let characterImg = [];
characterImg[0] = new Image();
characterImg[0].src = "characters/george.png";

let level_data = [
    {
        name: "Level 1",
        character: new Character(characterImg[0], 48, 48, 16, 10, (cellWidth-2) / 48),
        maze: {
            startPos: { x: 0, y: 0 },
            row: 10,
            col: 10,
            cellWidth: cellWidth,
            lineColor: "blue",
            lineWidth: 2
        }
    }
];



let rowlen = level_data[selected_level].maze.row;
let collen = level_data[selected_level].maze.col;
let maze = new Maze(rowlen, collen);
maze.createGrid(ctx, level_data[selected_level].maze);
maze.applyPRIMS(ctx, { x: 0, y: 0 });
maze.setCharacter(level_data[selected_level].character , {x:0,y:0});












document.addEventListener('keydown', function (event) {
    level_data[selected_level].character.moveCharacter(ctx, event.key);
});

document.addEventListener('keyup', function (event) {
    level_data[selected_level].character.stopAnimation();
    level_data[selected_level].character.animId = null;
});







