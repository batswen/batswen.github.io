const WIDTH = 10, HEIGHT = 20, SIZE = 20

const canvasElement = document.getElementById("game")
const pointsElement = document.getElementById("points")
const messageElement = document.getElementById("message")
const newGameElement = document.getElementById("newgame")
const canvas = canvasElement.getContext("2d")

let isRunning = true, points = 0, time

window.addEventListener("keydown", keypressed)
newGameElement.addEventListener("click", newgame)

const colors = [
    "#abc", // Background
    "#333", // Piece #1
    "#33c",
    "#3c3",
    "#3cc",
    "#c33",
    "#c3c",
    "#cc3"  // Piece #8
]
const pieces = [
    ".#...#...#...#..", // Line
    ".....##..##.....", // Cube
    ".#...##...#.....", // Z1
    "..#..##..#......", // Z2
    ".##..#...#......", // L1
    ".##...#...#.....", // L2
    "....###..#......"  // T
]
const current_piece = { x: 0, y: 0, nr: 0, rotation: 0 }
const map = new Array(WIDTH * HEIGHT)

function getMap(x, y) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
        return 1
    }
    return map[x + y * WIDTH]
}

function init() {
    canvasElement.width = WIDTH * SIZE
    canvasElement.height = HEIGHT * SIZE
    messageElement.textContent = ""
    points = 0
    map.fill(0)
    addPointsAndUpdateSpan(0)
}

function addPointsAndUpdateSpan(addPoints) {
    points += addPoints
    pointsElement.textContent = `Poitns: ${points}`
}

function renderMap() {
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            canvas.fillStyle = colors[map[x + y * WIDTH]]
            canvas.fillRect(x * SIZE, y * SIZE, SIZE, SIZE)
        }
    }
}

function addPieceToMapAndAddPoints() {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (getRotatedPiece(x, y, current_piece.rotation) === "#") {
                map[(current_piece.x + x) + (current_piece.y + y) * WIDTH] = current_piece.nr + 1
            }
        }
    }
    addPointsAndUpdateSpan(10)
}

function moveLinesDown(last_y) {
    for (let y = last_y; y >= 1; y--) {
        for (let x = 0; x < WIDTH; x++) {
            map[x + y * WIDTH] = map[x + (y - 1)* WIDTH]
        }
    }
    // clear first line
    for (let x = 0; x < WIDTH; x++) {
        map[x] = 0
    }
}

function findAndRemoveLineAndAddPoints() {
    let lines_found = [], blocks_this_line
    for (let y = 0; y < HEIGHT; y++) {
        blocks_this_line = 0
        for (let x = 0; x < WIDTH; x++) {
           if (getMap(x, y) > 0) {
                blocks_this_line++
           }
        }
        if (blocks_this_line === WIDTH) {
            lines_found.push(y)
        }
    }
    if (lines_found.length > 0) {
        for (const line of lines_found) {
            moveLinesDown(line)
        }
        addPointsAndUpdateSpan(50 << lines_found.length)
    }
}

function keypressed(event) {
    switch (event.key) {
        case "ArrowLeft": case "a":
            if (isPieceFit(current_piece.x - 1, current_piece.y, current_piece.rotation)) {
                current_piece.x--
            }
            break
        case "ArrowRight": case "d":
            if (isPieceFit(current_piece.x + 1, current_piece.y, current_piece.rotation)) {
                current_piece.x++
            }
            break
        case "ArrowDown": case "s":
            if (isPieceFit(current_piece.x, current_piece.y + 1, current_piece.rotation)) {
                current_piece.y++
            }
            break
        case "q":
            if (isPieceFit(current_piece.x, current_piece.y, current_piece.rotation + 3)) {
                current_piece.rotation += 3
            }
            break
        case "e": case"w": case "ArrowUp":
            if (isPieceFit(current_piece.x, current_piece.y, current_piece.rotation + 1)) {
                current_piece.rotation++
            }
            break
        case "Escape":
            isRunning = false
    }
}

function renderCurrentPiece() {
    canvas.fillStyle = colors[current_piece.nr + 1]
    canvas.stroke = "#000"
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (getRotatedPiece(x, y, current_piece.rotation) === "#") {
                canvas.fillRect((current_piece.x + x) * SIZE, (current_piece.y + y) * SIZE, SIZE, SIZE)
                //canvas.strokeRect((current_piece.x + x) * SIZE, (current_piece.y + y) * SIZE, SIZE, SIZE)
            }
        }
    }
}

function isPieceFit(xPos, yPos, rotation) {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (getRotatedPiece(x, y, rotation) === "#" && getMap(xPos + x, yPos + y) > 0) {
                return false
            }
        }
    }
    return true
}

function getRotatedPiece(x, y, rotation) {
    switch (rotation % 4) {
        case 0: return pieces[current_piece.nr].charAt(x + y * 4)
        case 1: return pieces[current_piece.nr].charAt((12 - x * 4) + y)
        case 2: return pieces[current_piece.nr].charAt((15 - x) - y * 4)
        case 3: return pieces[current_piece.nr].charAt((x * 4 + 3) - y)
    }
}

function forcePieceDown() {
    if (isPieceFit(current_piece.x, current_piece.y + 1, current_piece.rotation)) {
        current_piece.y++
    } else {
        addPieceToMapAndAddPoints()
        findAndRemoveLineAndAddPoints()
        createNewPiece()
        if (!isPieceFit(current_piece.x, current_piece.y, current_piece.rotation)) {
            isRunning = false
            messageElement.textContent = "Game Über"
        }
    }
}

function gameloop() {
    if (time + 1000 < Date.now()) {
        time = Date.now()
        forcePieceDown()
    }
    if (isRunning) {
        renderMap()
        renderCurrentPiece()
        requestAnimationFrame(gameloop)
    } else {
        window.removeEventListener("keyup", keypressed)
    }
}

function createNewPiece() {
    current_piece.nr = Math.floor(Math.random() * pieces.length)
    current_piece.rotation = 0
    current_piece.x = 3
    current_piece.y = 0
}
function newgame() {
    init()
    createNewPiece()
    time = Date.now()
    gameloop()
}

newgame()