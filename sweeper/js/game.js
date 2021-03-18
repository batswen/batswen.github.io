"use strict"

class Game {
    constructor(WIDTH, HEIGHT, BOMBS) {
        this.WIDTH = WIDTH; this.HEIGHT = HEIGHT; this.BOMBS = BOMBS
        this.revealed = 0
        const page = document.getElementById("sweeper-game")

        this.cells = []
        let grid = []
        this.running = true
        for (let i = 0; i < this.WIDTH * this.HEIGHT - this.BOMBS; i++) {
            grid.push("ok")
        }
        for (let i = 0; i < this.BOMBS; i++) {
            grid.push("bomb")
        }
        for (let i = grid.length - 1; i > 0; i--) {
            let j, h
            j = Math.floor(Math.random() * (i + 1))
            h = grid[i]
            grid[i] = grid[j]
            grid[j] = h
        }
        for (let i = 0; i < this.WIDTH * this.HEIGHT; i++) {
            const cell = document.createElement("DIV")
            let bombs
            cell.classList.add(grid[i])
            cell.setAttribute("data-i", i)
            bombs = 0
            if (i % this.WIDTH > 0) {
                // links
                if (grid[i - 1] === "bomb") {
                    bombs++
                }
                // links oben
                if (i > this.WIDTH && grid[i - this.WIDTH - 1] === "bomb") {
                    bombs++
                }
                // links unten
                if (i < this.WIDTH * this.HEIGHT - this.WIDTH && grid[i + this.WIDTH - 1] === "bomb") {
                    bombs++
                }
            }
            // oben
            if (i > this.WIDTH -1 && grid[i - this.WIDTH] === "bomb") {
                bombs++
            }
            // unten
            if (i <  this.WIDTH * this.HEIGHT - this.WIDTH && grid[i + this.WIDTH] === "bomb") {
                bombs++
            }
            if (i % this.WIDTH < this.WIDTH -1) {
                // rechts
                if (grid[i + 1] === "bomb") {
                    bombs++
                }
                // rechts oben
                if (i > this.WIDTH -1 && grid[i - this.WIDTH + 1] === "bomb") {
                    bombs++
                }
                // rechts unten
                if (i < this.WIDTH * this.HEIGHT - this.WIDTH - 1 && grid[i + this.WIDTH + 1] === "bomb") {
                    bombs++
                }
            }
            cell.setAttribute("data-neighbors", bombs)
            cell.addEventListener("click", e => {
                this.clicked(cell)
            })
            cell.addEventListener("contextmenu", e => {
                e.preventDefault()
                this.toggleFlag(cell)
            })
            this.cells.push(cell)
            page.appendChild(cell)
        }
    }
    clicked(cell) {
        const i = parseInt(cell.getAttribute("data-i"))
        //console.log("run:",this.running,"cell",cell)
        if (!this.running || cell.classList.contains("revealed")) {
            return false
        }
        if (cell.innerHTML === "") { // only allow left click if there is no flag
            if (cell.classList.contains("ok")) {
                cell.classList.remove("ok")
                this.reveal(i)
            }
            if (cell.classList.contains("bomb")) {
                cell.classList.add("red")
                cell.innerHTML = "💣"
                this.revealAll()
                this.myAlert("Game over", "Loser you are")
                this.running = false
            }
        }
    }
    // change cell text "" -> "🏴" -> "🏴?" -> ""
    toggleFlag(cell) {
        if (this.running) {
            if (cell.innerHTML === "" && !cell.classList.contains("revealed")) {
                cell.innerHTML = "🏴"
            } else if (cell.innerHTML === "🏴") {
                cell.innerHTML = "🏴?"
            } else if (cell.innerHTML === "🏴?"){
                cell.innerHTML = ""
            }
        }
    }
    // show all cells (duh)
    revealAll() {
        for (let i = 0; i < this.WIDTH * this.HEIGHT; i++) {
            if (!this.cells[i].classList.contains("revealed")) {
                this.cells[i].classList.add("revealed")
            }
            if (this.cells[i].classList.contains("bomb")) {
                this.cells[i].innerHTML = "💣"
            }
        }
    }
    // reveal clicked and adjacent
    reveal(i) {
        const c = this.cells[i]
        if (c.classList.contains("revealed") || c.classList.contains("bomb")) {
            return false
        }
        c.classList.add("revealed")
        this.revealed++
        if (this.revealed === this.WIDTH * this.HEIGHT - this.BOMBS) {
            this.running = false
            this.revealAll()
            this.myAlert("Game over!", "Winner you are!")
        }
        if (!c.classList.contains("bomb")) {
            if (parseInt(c.getAttribute("data-neighbors")) > 0) {
                c.innerHTML = c.getAttribute("data-neighbors")
                return false
            }
        }
        if (i % this.WIDTH > 0) {
            // links
            this.reveal(i - 1)
            // links oben
            if (i > this.WIDTH) this.reveal(i - this.WIDTH - 1)
            // links unten
            if (i < this.WIDTH * this.HEIGHT - this.WIDTH) this.reveal(i + this.WIDTH - 1)
        }
        // oben
        if (i > this.WIDTH - 1) this.reveal(i - this.WIDTH)
        // unten
        if (i < this.WIDTH * this.HEIGHT - this.WIDTH) this.reveal(i + this.WIDTH)
        if (i % this.WIDTH < this.WIDTH - 1) {
            // rechts
            this.reveal(i + 1)
            // rechts oben
            if (i > this.WIDTH - 1) this.reveal(i - this.WIDTH + 1)
            // rechts unten
            if (i < this.WIDTH * this.HEIGHT - this.WIDTH - 1) this.reveal(i + this.WIDTH + 1)
        }
    }
    myAlert(header, body) {
        document.getElementById("modalHeader").textContent = header
        document.getElementById("modalP").textContent = body
        document.getElementById("modalDiv").style.display = "block"
    }
}
