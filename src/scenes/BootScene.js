import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load some basic fallback images or generate graphics here
        let graphics = this.make.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 40, 100);
        graphics.generateTexture('base_stickman', 40, 100);
        graphics.clear();
        
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('red_blast', 20, 20);
        graphics.clear();

        graphics.fillStyle(0x0066ff, 1);
        graphics.fillCircle(20, 20, 20);
        graphics.generateTexture('blue_vortex', 40, 40);
        graphics.clear();

        // 100% Canon Domain Assets
        this.load.image('void_bg', '/assets/domains/void.png');
        this.load.image('shrine_bg', '/assets/domains/shrine.png');
        
        // Custom VFX
        this.load.image('slash_vfx', '/assets/vfx/slash.png');
    }

    create() {
        // We do not start GameScene here. The HTML UI handles starting the game.
        // The screen stays black/empty and lets the DOM overlay dominate.
    }
}
