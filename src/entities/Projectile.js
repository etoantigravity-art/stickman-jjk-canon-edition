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
        // Fix the scene reference by using this.scene
        let scene = this.scene;

        if (this.projType === 'red') {
            this.body.setSize(30, 30);
            this.body.setVelocityX(this.dirX * 600);
            this.damage = 25;
            this.knockX = this.dirX * 300;
            this.knockY = -150;
            this.lifeTime = 1000;
        } else if (this.projType === 'blue') {
            this.body.setSize(100, 100);
            this.body.setVelocityX(0); // Blue stays still and pulls
            this.damage = 5; // Damage over time
            this.knockX = 0;
            this.knockY = 0;
            this.lifeTime = 2000;
        } else if (this.projType === 'purple') {
            this.body.setSize(220, 220);
            this.body.setVelocityX(this.dirX * 400);
            this.damage = 40; // No more 100 damage instakill
            this.knockX = this.dirX * 500;
            this.knockY = -250;
            this.lifeTime = 4000;
        } else if (this.projType === 'dismantle') {
            this.body.setSize(100, 100);
            this.body.setVelocityX(this.dirX * 1400); // Much faster
            this.damage = 15;
            this.knockX = this.dirX * 100;
            this.knockY = -50;
            this.lifeTime = 1500;
            
            // Native Canon Image Injection - Fixed using 'scene'
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
        } else if (this.projType === 'cursed_speech') {
            this.body.setSize(60, 60);
            this.body.setVelocityX(this.dirX * 600);
            this.damage = 15;
            this.knockX = this.dirX * 50;
            this.knockY = 0;
            this.lifeTime = 800;
        } else if (this.projType === 'rika_claw') {
            this.body.setSize(100, 100);
            this.body.setVelocityX(this.dirX * 350);
            this.damage = 30;
            this.knockX = this.dirX * 450;
            this.knockY = -200;
            this.lifeTime = 1000;
        } else if (this.projType === 'thin_ice') {
            this.body.setSize(80, 80);
            this.body.setVelocityX(this.dirX * 600);
            this.damage = 45;
            this.knockX = this.dirX * 350;
            this.knockY = -150;
            this.lifeTime = 600;
        } else if (this.projType === 'water_beam') {
            this.body.setSize(50, 50);
            this.body.setVelocityX(this.dirX * 800);
            this.damage = 18;
            this.knockX = this.dirX * 200;
            this.knockY = -80;
            this.lifeTime = 1200;
        } else if (this.projType === 'detailed_fish') {
            this.body.setSize(65, 45);
            this.body.setVelocityX(this.dirX * 550);
            this.damage = 12;
            this.knockX = this.dirX * 150;
            this.knockY = -100;
            this.lifeTime = 2000;
            this.startY = this.y;
        } else if (this.projType === 'tsunami') {
            this.body.setSize(120, 300);
            this.body.setVelocityX(this.dirX * 400);
            this.damage = 45;
            this.knockX = this.dirX * 400;
            this.knockY = -350;
            this.lifeTime = 3000;
        } else {
            // General settings for remaining character specials
            this.body.setSize(70, 70);
            this.body.setVelocityX(this.dirX * 600);
            this.damage = 25;
            this.knockX = this.dirX * 250;
            this.knockY = -150;
            this.lifeTime = 1200;
            
            // Adjust speeds/damages for specific generic project names
            if (this.projType === 'piercing_blood') {
                this.body.setSize(20, 20);
                this.body.setVelocityX(this.dirX * 1700);
                this.damage = 25;
            } else if (this.projType === 'black_flash') {
                this.damage = 40;
                this.body.setVelocityX(this.dirX * 700);
            } else if (this.projType === 'black_flash_combo') {
                this.damage = 60;
                this.body.setVelocityX(this.dirX * 800);
            } else if (this.projType === 'mahoraga') {
                this.damage = 70;
                this.body.setSize(140, 140);
            } else if (this.projType === 'uzumaki') {
                this.damage = 65;
                this.body.setSize(160, 160);
            }
        }
    }

    drawDetailedFish(graphics, x, y, scaleX, scaleY, color) {
        graphics.save();
        graphics.translate(x, y);
        graphics.scale(scaleX, scaleY);
        
        // Body (torpedo shape)
        graphics.fillStyle(color, 1);
        graphics.beginPath();
        graphics.moveTo(-20, 0);
        graphics.quadraticCurveTo(0, -12, 15, -5); // Upper body
        graphics.lineTo(25, -8); // Dorsal fin back
        graphics.lineTo(20, 0); // Dorsal fin base
        graphics.lineTo(15, 5); // Lower body
        graphics.quadraticCurveTo(0, 12, -20, 0);
        graphics.fillPath();
        
        // Tail fin (gorgeous dual-lobe tail)
        graphics.beginPath();
        graphics.moveTo(-20, 0);
        graphics.lineTo(-32, -12);
        graphics.quadraticCurveTo(-28, 0, -32, 12);
        graphics.closePath();
        graphics.fillPath();
        
        // Pectoral fin (slightly darker)
        let darkColor = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
        graphics.fillStyle(darkColor, 1);
        graphics.beginPath();
        graphics.moveTo(-5, 2);
        graphics.lineTo(-12, 10);
        graphics.lineTo(-2, 8);
        graphics.closePath();
        graphics.fillPath();
        
        // Eye (high fidelity piranha-like eye)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, -3, 3);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(9, -3, 1.5);
        
        // Gill cover
        graphics.lineStyle(1.5, 0x000000, 0.4);
        graphics.beginPath();
        graphics.moveTo(3, -6);
        graphics.quadraticCurveTo(0, 0, 3, 6);
        graphics.strokePath();

        graphics.restore();
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
            }
        } else if (this.projType === 'purple') {
            this.graphics.fillStyle(0xaa00ff, 0.9);
            this.graphics.fillCircle(0, 0, 110 + Math.sin(t*3)*10);
            this.graphics.fillStyle(0xffffff, 0.8);
            this.graphics.fillCircle(0, 0, 55);
            this.scene.cameras.main.shake(100, 0.005);
        } else if (this.projType === 'dismantle') {
            // Handled by the image
        } else if (this.projType === 'fuga') {
            this.graphics.fillStyle(0xff5500, 1);
            this.graphics.fillCircle(0, 0, 40);
            this.graphics.fillStyle(0xffff00, 0.5);
            this.graphics.fillCircle(0, 0, 20 + Math.sin(t*8)*10);
        } else if (this.projType === 'cursed_speech') {
            // Concentric shockwaves
            this.graphics.lineStyle(3, 0xffbbbb, 0.8);
            this.graphics.strokeCircle(0, 0, 10 + (time % 500) / 10);
            this.graphics.strokeCircle(0, 0, 25 + (time % 500) / 10);
        } else if (this.projType === 'rika_claw') {
            this.graphics.fillStyle(0x7700aa, 0.7);
            this.graphics.beginPath();
            this.graphics.moveTo(-20, -40);
            this.graphics.lineTo(20, -10);
            this.graphics.lineTo(15, 30);
            this.graphics.lineTo(-20, 20);
            this.graphics.closePath();
            this.graphics.fillPath();
            // Claw tips
            this.graphics.fillStyle(0xffffff, 1);
            this.graphics.fillCircle(20, -10, 4);
            this.graphics.fillCircle(15, 10, 4);
            this.graphics.fillCircle(10, 30, 4);
        } else if (this.projType === 'thin_ice') {
            // Glass crack visuals
            this.graphics.lineStyle(2.5, 0xaaddff, 0.8);
            for(let i=0; i<6; i++) {
                let ang = (i * Math.PI * 2) / 6;
                this.graphics.beginPath();
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(Math.cos(ang)*35, Math.sin(ang)*35);
                this.graphics.strokePath();
            }
        } else if (this.projType === 'water_beam') {
            this.graphics.fillStyle(0x00aaff, 0.8);
            this.graphics.fillCircle(0, 0, 20);
            this.graphics.fillStyle(0xffffff, 0.5);
            this.graphics.fillCircle(Math.sin(t)*5, Math.cos(t)*5, 10);
        } else if (this.projType === 'detailed_fish') {
            // Sinusoidal swimming path
            this.y = this.startY + Math.sin(time / 80) * 45;
            this.drawDetailedFish(this.graphics, 0, 0, this.dirX * 1.3, 1.3, 0xff5555);
        } else if (this.projType === 'tsunami') {
            this.graphics.fillStyle(0x0044ff, 0.75);
            // Draw a giant water wave block
            this.graphics.fillRect(-40, -150, 80, 300);
            this.graphics.fillStyle(0xffffff, 0.9);
            // White foam crest
            this.graphics.fillCircle(0, -150, 45);
            this.graphics.fillCircle(-25, -130, 30);
            this.graphics.fillCircle(25, -130, 30);
        } else {
            // General fallback drawings based on name
            if (this.projType === 'piercing_blood') {
                this.graphics.fillStyle(0xcc0000, 1);
                this.graphics.fillRect(-15, -4, 30, 8);
                this.graphics.fillStyle(0xff0000, 0.8);
                this.graphics.fillCircle(15 * this.dirX, 0, 6);
            } else if (this.projType.includes('black_flash')) {
                // Black/red lightning bolt drawing
                this.graphics.lineStyle(3, 0x000000, 1);
                this.graphics.beginPath();
                this.graphics.moveTo(-20, 15);
                this.graphics.lineTo(5, -10);
                this.graphics.lineTo(-5, -5);
                this.graphics.lineTo(20, -25);
                this.graphics.strokePath();
                
                this.graphics.lineStyle(2, 0xff0033, 0.8);
                this.graphics.strokeCircle(0, 0, 20 + Math.sin(t*4)*5);
            } else if (this.projType === 'mahoraga') {
                // Spinning wheel
                this.graphics.lineStyle(4, 0xddddcc, 1);
                this.graphics.strokeCircle(0, 0, 45);
                for(let i=0; i<8; i++) {
                    let ang = (i * Math.PI * 2) / 8;
                    this.graphics.beginPath();
                    this.graphics.moveTo(0,0);
                    this.graphics.lineTo(Math.cos(ang)*45, Math.sin(ang)*45);
                    this.graphics.strokePath();
                }
            } else if (this.projType === 'uzumaki') {
                // Swirling vortex of colors
                this.graphics.fillStyle(0x111111, 0.9);
                this.graphics.fillCircle(0, 0, 70);
                for(let i=0; i<4; i++) {
                    let ang = (i * Math.PI / 2) + t;
                    this.graphics.fillStyle(i % 2 === 0 ? 0x9900ee : 0x00ff88, 0.6);
                    this.graphics.fillCircle(Math.cos(ang)*40, Math.sin(ang)*40, 25);
                }
            } else {
                // Generic projectile
                this.graphics.fillStyle(this.owner.tintColor, 0.9);
                this.graphics.fillCircle(0, 0, 22);
            }
        }
    }
}
