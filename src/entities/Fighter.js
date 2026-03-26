import Phaser from 'phaser';
import { CHAR_STATS, PHYSICS } from '../utils/constants';
import Projectile from './Projectile';

export default class Fighter extends Phaser.GameObjects.Container {
    constructor(scene, x, y, characterName, playerNum, keys) {
        super(scene, x, y);
        
        this.characterName = characterName;
        this.playerNum = playerNum;
        this.keys = keys;
        
        this.hp = 250;
        this.maxHp = 250;
        this.energy = 0;
        this.maxEnergy = 200;
        this.speed = PHYSICS.MOVE_SPEED;
        
        this.isAttacking = false;
        this.isBlocking = false;
        
        this.tintColor = parseInt(CHAR_STATS[characterName].color.replace('#', '0x'));

        this.graphics = scene.add.graphics();
        this.add(this.graphics);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(40, 90);
        this.body.setOffset(-20, -45);
        this.body.setCollideWorldBounds(true);
        this.body.setDrag(PHYSICS.DRAG, 0);
    }

    update(delta) {
        // Energy Regeneration
        if (this.energy < this.maxEnergy) {
            this.energy += 12 * (delta / 1000); // 12 energy per second
            if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        }

        let flipX = false;
        if (!this.isAttacking && this.enemy) {
            flipX = this.x > this.enemy.x;
        }

        if (this.isStunned) {
            this.body.setVelocityX(0);
            this.isAttacking = false;
            this.isBlocking = false;
            // Slight shake effect when stunned
            this.x += (Math.random()-0.5)*2;
            this.drawStickman(flipX);
            this.updateHUD();
            return;
        }

        let isLeft = this.playerNum === 1 ? this.keys.A.isDown : this.keys.LEFT.isDown;
        let isRight = this.playerNum === 1 ? this.keys.D.isDown : this.keys.RIGHT.isDown;
        let isUp = this.playerNum === 1 ? Phaser.Input.Keyboard.JustDown(this.keys.W) : Phaser.Input.Keyboard.JustDown(this.keys.UP);
        let isDown = this.playerNum === 1 ? this.keys.S.isDown : this.keys.DOWN.isDown;
        let isAttack = this.playerNum === 1 ? Phaser.Input.Keyboard.JustDown(this.keys.F) : Phaser.Input.Keyboard.JustDown(this.keys.K);
        let isSpecial = this.playerNum === 1 ? Phaser.Input.Keyboard.JustDown(this.keys.G) : Phaser.Input.Keyboard.JustDown(this.keys.L);

        this.isBlocking = isDown;

        if (!this.isBlocking && !this.isAttacking) {
            if (isLeft) this.body.setVelocityX(-this.speed);
            else if (isRight) this.body.setVelocityX(this.speed);

            if (isUp && this.body.touching.down) {
                this.body.setVelocityY(PHYSICS.JUMP_POWER);
            }
        } else if (this.isBlocking && this.body.touching.down) {
            this.body.setVelocityX(0); // Stop when blocking
        }

        if (isAttack && !this.isBlocking && !this.isAttacking) {
            this.attack(flipX);
        }

        if (isSpecial && !this.isBlocking && !this.isAttacking) {
            if (this.energy >= 150 && this.hp <= this.maxHp * 0.3 && this.characterName === 'Gojo') this.useSpecial(4, flipX);
            else if (this.energy >= 100) this.useSpecial(3, flipX);
            else if (this.energy >= 60) this.useSpecial(2, flipX);
            else if (this.energy >= 30) this.useSpecial(1, flipX);
        }

        this.drawStickman(flipX);
        this.updateHUD();
    }

    drawStickman(flipX) {
        this.graphics.clear();
        
        let strokeColor = this.isBlocking ? 0x888888 : this.tintColor;
        this.graphics.lineStyle(4, strokeColor, 1);
        
        let t = this.scene.time.now / 150;
        let isMoving = this.body.velocity.x !== 0 && this.body.touching.down;
        let walkOffset = isMoving ? Math.sin(t) * 20 : 0;
        
        let armExtendX = this.isAttacking ? (flipX ? -30 : 30) : (isMoving ? -Math.sin(t)*15 : 0);
        let blockOffset = this.isBlocking ? (flipX ? -10 : 10) : 0;
        
        this.graphics.beginPath();
        this.graphics.moveTo(0, -10);
        this.graphics.lineTo(0, 20);
        
        if (this.isBlocking) {
            this.graphics.moveTo(0, 20); this.graphics.lineTo(-15, 30); this.graphics.lineTo(-10, 45);
            this.graphics.moveTo(0, 20); this.graphics.lineTo(15, 30); this.graphics.lineTo(10, 45);
        } else if (!this.body.touching.down) {
            this.graphics.moveTo(0, 20); this.graphics.lineTo(-10, 40);
            this.graphics.moveTo(0, 20); this.graphics.lineTo(15, 35);
        } else {
            this.graphics.moveTo(0, 20); this.graphics.lineTo(-15 + walkOffset, 45);
            this.graphics.moveTo(0, 20); this.graphics.lineTo(15 - walkOffset, 45);
        }

        let shoulderY = -5;
        if (this.isBlocking) {
            this.graphics.moveTo(0, shoulderY); this.graphics.lineTo(blockOffset, shoulderY + 5); this.graphics.lineTo(0, shoulderY - 15);
            this.graphics.moveTo(0, shoulderY); this.graphics.lineTo(blockOffset*1.5, shoulderY + 10); this.graphics.lineTo(blockOffset*0.5, shoulderY - 10);
        } else {
            this.graphics.moveTo(0, shoulderY);
            this.graphics.lineTo(-15 + armExtendX, shoulderY + 15);
            this.graphics.moveTo(0, shoulderY);
            this.graphics.lineTo(15 + armExtendX, shoulderY + 15);
        }
        
        this.graphics.strokePath();
        
        this.graphics.fillStyle(strokeColor, 1);
        let headY = this.isBlocking ? -15 : -25;
        this.graphics.fillCircle(0, headY, 12);
        
        if (this.characterName === 'Gojo') {
            this.graphics.lineStyle(4, 0x000000, 1);
            this.graphics.beginPath(); this.graphics.moveTo(-10, headY); this.graphics.lineTo(10, headY); this.graphics.strokePath();
        } else if (this.characterName === 'Sukuna') {
            this.graphics.lineStyle(2, 0xff0000, 1);
            this.graphics.beginPath(); this.graphics.moveTo(-8, headY-5); this.graphics.lineTo(8, headY-5); this.graphics.strokePath();
        }
    }

    attack(flipX) {
        this.isAttacking = true;
        if (window.playHitSound) window.playHitSound();

        let reach = 50;
        let hx = flipX ? this.x - reach : this.x + reach;
        let hitbox = this.scene.add.rectangle(hx, this.y, 60, 40, 0xffffff, 0); 
        this.scene.physics.add.existing(hitbox);
        
        this.scene.physics.add.overlap(hitbox, this.enemy, () => {
            if (!hitbox.hasHit) {
                hitbox.hasHit = true;
                if (this.enemy.isBlocking) {
                    this.enemy.body.setVelocityX(flipX ? -150 : 150);
                } else {
                    this.enemy.body.setVelocityX(flipX ? -400 : 400);
                    this.enemy.body.setVelocityY(-250);
                    this.enemy.takeDamage(10);
                    
                    let flash = this.scene.add.circle(this.enemy.x, this.enemy.y - 10, 30, 0xffffff, 0.8);
                    this.scene.tweens.add({ targets: flash, scale: 2, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
                }
            }
        });

        this.scene.time.delayedCall(150, () => {
            hitbox.destroy();
            this.isAttacking = false;
        });
    }

    takeDamage(amount) {
        if (this.characterName === 'Gojo' && this.isBlocking && this.energy >= 5) {
            this.energy -= 5;
            let flash = this.scene.add.circle(this.x, this.y, 50, 0x00aaff, 0.4);
            this.scene.tweens.add({ targets: flash, scale: 1.5, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
            return;
        }

        this.hp = Math.max(0, this.hp - amount);
        this.updateHUD();
    }

    useSpecial(tier, flipX) {
        let cost = tier === 4 ? 150 : (tier === 3 ? 100 : (tier === 2 ? 60 : 30));
        let dir = flipX ? -1 : 1;

        if (this.energy < cost) return;
        this.energy -= cost;
        this.isAttacking = true;

        if (this.characterName === 'Gojo') {
            if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'red', dir, this);
            else if (tier === 2) new Projectile(this.scene, this.x + dir*350, this.y - 50, 'blue', dir, this);
            else if (tier === 3) this.scene.activateDomain('void', this);
            else if (tier === 4) new Projectile(this.scene, this.x + dir*100, this.y - 150, 'purple', dir, this);
            
            if (window.playBeamSound) window.playBeamSound();
        } else if (this.characterName === 'Sukuna') {
            if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'dismantle', dir, this); 
            else if (tier === 2) {
                for(let i=0; i<3; i++) {
                    this.scene.time.delayedCall(i*100, () => new Projectile(this.scene, this.x + dir*60, this.y - 20 + Math.random()*40, 'dismantle', dir, this));
                }
            }
            else if (tier === 3) this.scene.activateDomain('shrine', this);
            else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'fuga', dir, this);
            
            if (window.playSwordSound) window.playSwordSound();
        }

        this.scene.time.delayedCall(500, () => { this.isAttacking = false; });
        this.updateHUD();
    }

    updateHUD() {
        // Native UI Handled by GameScene
    }
}
