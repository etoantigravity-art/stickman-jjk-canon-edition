import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, dirX, owner) {
        super(scene, x, y);
        this.projType = type;
        this.owner = owner;
        this.dirX = dirX; // 1 or -1
        this.lifeTime = 5000; // ms
        
        // Add graphics for drawing
        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.projectiles.add(this); // Add to GameScene group

        this.body.setAllowGravity(false);
        this.activeHit = true;

        this.setupVisuals();
    }

    setupVisuals() {
        if (this.projType === 'red') {
            this.body.setSize(30, 30);
            this.body.setVelocityX(this.dirX * 600);
            this.damage = 25;
            this.knockX = this.dirX * 300;
            this.knockY = -150;
            this.lifeTime = 1000;
        } else if (this.projType === 'blue') {
            this.body.setSize(100, 100);
            this.body.setVelocityX(0); // Blue says still and pulls
            this.damage = 5; // Damage over time
            this.knockX = 0;
            this.knockY = 0;
            this.lifeTime = 2000;
        } else if (this.projType === 'purple') {
            this.body.setSize(300, 300);
            this.body.setVelocityX(this.dirX * 400);
            this.damage = 100; // Instakill chunk
            this.knockX = this.dirX * 600;
            this.knockY = -300;
            this.lifeTime = 4000;
        } else if (this.projType === 'dismantle') {
            this.body.setSize(100, 100);
            this.body.setVelocityX(this.dirX * 1400); // Much faster
            this.damage = 15;
            this.knockX = this.dirX * 100;
            this.knockY = -50;
            this.lifeTime = 1500;
            
            // Native Canon Image Injection
            let slashImg = scene.add.image(0, 0, 'slash_vfx');
            slashImg.setScale(0.8);
            if (this.dirX === -1) slashImg.setFlipX(true); // Mirror if shooting left
            slashImg.setBlendMode(Phaser.BlendModes.ADD); // Glow effect
            
            scene.tweens.add({
                targets: slashImg,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: {from: 1, to: 0.6},
                yoyo: true, repeat: -1, duration: 50
            });
            this.add(slashImg);
        } else if (this.projType === 'fuga') {
            this.body.setSize(80, 80);
            this.body.setAllowGravity(true);
            this.body.setVelocityY(-200);
            this.body.setVelocityX(this.dirX * 400);
            this.damage = 35;
            this.knockX = this.dirX * 250;
            this.knockY = -250;
            this.lifeTime = 3000;
        }
    }

    update(time, delta) {
        this.lifeTime -= delta;
        if (this.lifeTime <= 0) {
            this.destroy();
            return;
        }

        // Draw visuals procedurally
        this.graphics.clear();
        
        let t = time / 100;

        if (this.projType === 'red') {
            this.graphics.fillStyle(0xff3333, 1);
            this.graphics.fillCircle(0, 0, 15 + Math.sin(t*5)*3);
            this.graphics.lineStyle(2, 0xff0000);
            this.graphics.strokeCircle(0, 0, 20);
        } else if (this.projType === 'blue') {
            this.graphics.fillStyle(0x000000, 1);
            this.graphics.fillCircle(0, 0, 30);
            this.graphics.lineStyle(5, 0x0066ff, 0.8 + Math.sin(t*2)*0.2);
            this.graphics.strokeCircle(0, 0, 35 + Math.sin(t)*5);
            
            // Continuous heavy pull logic
            let enemy = this.owner.enemy;
            let dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist < 350) {
                let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.x, this.y);
                enemy.body.velocity.x += Math.cos(angle) * 800 * (delta/1000);
                // Also deal micro damage
                if (Math.random() < 0.1) enemy.takeDamage(1); 
            }
        } else if (this.projType === 'purple') {
            this.graphics.fillStyle(0xaa00ff, 0.9);
            this.graphics.fillCircle(0, 0, 150 + Math.sin(t*3)*10);
            this.graphics.fillStyle(0xffffff, 0.8);
            this.graphics.fillCircle(0, 0, 75);
            
            // Screen shake effect
            this.scene.cameras.main.shake(100, 0.005);
        } else if (this.projType === 'dismantle') {
            // VFX is fully handled by the glowing Image added in setupVisuals()

        } else if (this.projType === 'fuga') {
            this.graphics.fillStyle(0xff5500, 1);
            this.graphics.fillCircle(0, 0, 40);
            this.graphics.fillStyle(0xffff00, 0.5);
            this.graphics.fillCircle(0, 0, 20 + Math.sin(t*8)*10);
        }
    }
}
