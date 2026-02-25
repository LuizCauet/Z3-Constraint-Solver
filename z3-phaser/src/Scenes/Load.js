import Phaser from 'phaser';

export class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        // Assets live in /assets/ (served from public/assets/)
        this.load.setPath('./assets/');

        // Townsfolk sprites
        this.load.image('purple', 'purple_townie.png');
        this.load.image('blue', 'blue_townie.png');

        // Tilemap and its packed spritesheet
        this.load.image('tilemap_tiles', 'tilemap_packed.png');
        this.load.tilemapTiledJSON('three-farmhouses', 'three-farmhouses.tmj');
    }

    create() {
        this.scene.start('pathfinderScene');
    }

    update() { }
}
