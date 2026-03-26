import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;
        
        this.add.text(width/2, height/3, 'JJK PHASER FIGHTER', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        let startText = this.add.text(width/2, height/2, 'CLICK TO FIGHT (GOJO VS SUKUNA)', { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
        
        startText.setInteractive();
        startText.on('pointerdown', () => {
            this.scene.start('GameScene', { p1: 'Gojo', p2: 'Sukuna' });
        });
    }
}
