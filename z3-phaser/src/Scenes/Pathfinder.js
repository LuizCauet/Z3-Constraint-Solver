import Phaser from 'phaser';
import EasyStar from 'easystarjs';

export class PathfinderScene extends Phaser.Scene {
    constructor() {
        super('pathfinderScene');
    }

    init() {
        this.TILESIZE   = 16;
        this.SCALE      = 2.0;
        this.TILEWIDTH  = 40;
        this.TILEHEIGHT = 25;

        // Sprite container (was the global `my` in the original project)
        this.my = { sprite: {} };
    }

    preload() { }

    create() {
        // ── Tilemap ──────────────────────────────────────────────────────────
        this.map = this.add.tilemap(
            'three-farmhouses',
            this.TILESIZE,
            this.TILESIZE,
            this.TILEHEIGHT,
            this.TILEWIDTH,
        );

        this.tileset = this.map.addTilesetImage('kenney-tiny-town', 'tilemap_tiles');

        this.groundLayer = this.map.createLayer('Ground-n-Walkways', this.tileset, 0, 0);
        this.treesLayer  = this.map.createLayer('Trees-n-Bushes',    this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer('Houses-n-Fences',   this.tileset, 0, 0);

        // ── Townsfolk sprite ─────────────────────────────────────────────────
        this.my.sprite.purpleTownie = this.add
            .sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), 'purple')
            .setOrigin(0, 0);

        // ── Camera ───────────────────────────────────────────────────────────
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);

        // ── EasyStar pathfinder ──────────────────────────────────────────────
        const tinyTownGrid = this.layersToGrid([
            this.groundLayer,
            this.treesLayer,
            this.housesLayer,
        ]);

        // Tile IDs that are walkable in this tileset
        const walkables = [1, 2, 3, 30, 40, 41, 42, 43, 44, 95, 13, 14, 15, 25, 26, 27, 37, 38, 39, 70, 84];

        this.finder = new EasyStar.js();
        this.finder.setGrid(tinyTownGrid);
        this.finder.setAcceptableTiles(walkables);

        this.activeCharacter = this.my.sprite.purpleTownie;

        // ── Input ────────────────────────────────────────────────────────────
        this.input.on('pointerup', this.handleClick, this);

        this.cKey    = this.input.keyboard.addKey('C');
        this.lowCost = false;

        // ── Instructions text ────────────────────────────────────────────────
        this.add.text(8, 8, 'Click to move  |  C = toggle tile cost', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 4 },
        }).setScrollFactor(0).setDepth(10);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            if (!this.lowCost) {
                this.setCost(this.tileset);
                this.lowCost = true;
            } else {
                this.resetCost(this.tileset);
                this.lowCost = false;
            }
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    tileXtoWorld(tileX) { return tileX * this.TILESIZE; }
    tileYtoWorld(tileY) { return tileY * this.TILESIZE; }

    /**
     * Build a 2-D grid of tile IDs from the provided layers.
     * For each cell the topmost non-null tile wins.
     * The result is handed to EasyStar.
     */
    layersToGrid(layers) {
        const grid = [];
        for (let y = 0; y < this.TILEHEIGHT; y++) {
            const row = [];
            for (let x = 0; x < this.TILEWIDTH; x++) {
                let tileId = 0;
                for (const layer of layers) {
                    const tile = layer.getTileAt(x, y);
                    if (tile && tile.index > 0) {
                        tileId = tile.index;
                    }
                }
                row.push(tileId);
            }
            grid.push(row);
        }
        return grid;
    }

    handleClick(pointer) {
        // pointer.worldX/Y are already in world-space (camera zoom is handled by Phaser)
        const toX   = Math.floor(pointer.worldX / this.TILESIZE);
        const toY   = Math.floor(pointer.worldY / this.TILESIZE);
        const fromX = Math.floor(this.activeCharacter.x / this.TILESIZE);
        const fromY = Math.floor(this.activeCharacter.y / this.TILESIZE);

        console.log(`Going from (${fromX},${fromY}) to (${toX},${toY})`);

        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null) {
                console.warn('Path not found.');
            } else {
                this.moveCharacter(path, this.activeCharacter);
            }
        });
        this.finder.calculate();
    }

    moveCharacter(path, character) {
        const tweens = [];
        for (let i = 0; i < path.length - 1; i++) {
            tweens.push({
                x:        path[i + 1].x * this.map.tileWidth,
                y:        path[i + 1].y * this.map.tileHeight,
                duration: 200,
            });
        }
        this.tweens.chain({ targets: character, tweens });
    }

    /**
     * Apply tile-cost properties from the tileset to EasyStar,
     * making grassy paths cheaper than roads etc.
     */
    setCost(tileset) {
        for (let tileID = tileset.firstgid; tileID < tileset.firstgid + tileset.total; tileID++) {
            const props = tileset.getTileProperties(tileID);
            if (props != null && props.cost != null) {
                this.finder.setTileCost(tileID, props.cost);
            }
        }
    }

    resetCost(tileset) {
        for (let tileID = tileset.firstgid; tileID < tileset.firstgid + tileset.total; tileID++) {
            const props = tileset.getTileProperties(tileID);
            if (props != null && props.cost != null) {
                this.finder.setTileCost(tileID, 1);
            }
        }
    }
}
