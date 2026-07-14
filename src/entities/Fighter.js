import Phaser from 'phaser';
import { CHAR_STATS, PHYSICS } from '../utils/constants';
import Projectile from './Projectile';

export default class Fighter extends Phaser.GameObjects.Container {
    constructor(scene, x, y, characterName, playerNum, keys) {
        super(scene, x, y);
        
        this.characterName = characterName;
        this.playerNum = playerNum;
        this.keys = keys;
        
        this.hp = 500;
        this.maxHp = 500;
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
        // Energy Regeneration: 3x for Yuta inside any domain
        let regenRate = 12;
        if (this.scene.domainType) {
            if (this.characterName === 'Yuta') {
                regenRate = 36; // Tripled!
            }
        }

        if (this.energy < this.maxEnergy) {
            this.energy += regenRate * (delta / 1000);
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
        
        // Draw Cursed Energy Aura
        let t = this.scene.time.now / 150;
        let auraAlpha = 0.2 + Math.abs(Math.sin(t * 1.5)) * 0.15;
        this.graphics.fillStyle(this.tintColor, auraAlpha);
        
        // Larger aura if domain is active or high energy
        let auraRadius = 35 + (this.energy / this.maxEnergy) * 15;
        if (this.scene.domainOwner === this) {
            auraRadius += 20;
            this.graphics.fillStyle(this.tintColor, auraAlpha * 1.5);
        }
        
        // Draw character aura shapes (Gojo = Blue/Cyan, Sukuna = Purple/Red, Yuta = Violet/Pink shadow)
        if (this.characterName === 'Yuta' && this.scene.domainType === 'love') {
            // Draw a faint giant Rika shadow behind Yuta
            this.graphics.fillStyle(0x7700aa, 0.15);
            this.graphics.fillCircle(flipX ? 20 : -20, -50, 45);
            this.graphics.fillCircle(flipX ? 15 : -15, -15, 30);
            this.graphics.fillStyle(this.tintColor, auraAlpha);
        }
        
        this.graphics.fillCircle(0, -10, auraRadius);

        // Core line styles
        this.graphics.lineStyle(4, strokeColor, 1);
        
        let isMoving = Math.abs(this.body.velocity.x) > 10 && this.body.touching.down;
        
        // 2-Joint IK Leg Animation System to fix the jump bug
        let leftThighAngle = 0.1;
        let leftCalfAngle = -0.1;
        let rightThighAngle = -0.1;
        let rightCalfAngle = 0.1;
        
        if (isMoving) {
            let swing = Math.sin(t * 1.3);
            leftThighAngle = swing * 0.5;
            leftCalfAngle = leftThighAngle - (swing > 0 ? swing * 0.8 : 0.1);
            
            rightThighAngle = -swing * 0.5;
            rightCalfAngle = rightThighAngle - (swing < 0 ? -swing * 0.8 : 0.1);
        } else if (!this.body.touching.down) {
            if (this.body.velocity.y < 0) {
                // Jumping up: bend knees
                leftThighAngle = -0.3; leftCalfAngle = -0.9;
                rightThighAngle = -0.1; rightCalfAngle = -0.5;
            } else {
                // Falling down: extend legs slightly forward
                leftThighAngle = 0.15; leftCalfAngle = 0.05;
                rightThighAngle = -0.05; rightCalfAngle = -0.1;
            }
        }
        
        let thighLen = 16;
        let calfLen = 16;
        
        this.graphics.beginPath();
        
        // Draw Left Leg
        let lKneeX = thighLen * Math.sin(leftThighAngle);
        let lKneeY = 20 + thighLen * Math.cos(leftThighAngle);
        let lFootX = lKneeX + calfLen * Math.sin(leftCalfAngle);
        let lFootY = lKneeY + calfLen * Math.cos(leftCalfAngle);
        this.graphics.moveTo(0, 20);
        this.graphics.lineTo(lKneeX, lKneeY);
        this.graphics.lineTo(lFootX, lFootY);
        
        // Draw Right Leg
        let rKneeX = thighLen * Math.sin(rightThighAngle);
        let rKneeY = 20 + thighLen * Math.cos(rightThighAngle);
        let rFootX = rKneeX + calfLen * Math.sin(rightCalfAngle);
        let rFootY = rKneeY + calfLen * Math.cos(rightCalfAngle);
        this.graphics.moveTo(0, 20);
        this.graphics.lineTo(rKneeX, rKneeY);
        this.graphics.lineTo(rFootX, rFootY);

        // Torso/Spine
        this.graphics.moveTo(0, -10);
        this.graphics.lineTo(0, 20);
        
        // Arms & Attacks
        let armExtendX = this.isAttacking ? (flipX ? -35 : 35) : (isMoving ? -Math.sin(t)*12 : 0);
        let blockOffset = this.isBlocking ? (flipX ? -12 : 12) : 0;
        let shoulderY = -5;
        
        if (this.isBlocking) {
            this.graphics.moveTo(0, shoulderY); this.graphics.lineTo(blockOffset, shoulderY + 5); this.graphics.lineTo(0, shoulderY - 15);
            this.graphics.moveTo(0, shoulderY); this.graphics.lineTo(blockOffset*1.5, shoulderY + 10); this.graphics.lineTo(blockOffset*0.5, shoulderY - 10);
        } else {
            // Draw Main Arm (Back)
            this.graphics.moveTo(0, shoulderY);
            this.graphics.lineTo(-15 + armExtendX, shoulderY + 15);
            
            // Draw Secondary Arm (Front)
            this.graphics.moveTo(0, shoulderY);
            this.graphics.lineTo(15 + armExtendX, shoulderY + 15);
            
            // Draw Sukuna's extra 2 arms (4 arms total!)
            if (this.characterName === 'Sukuna') {
                this.graphics.moveTo(0, shoulderY + 8);
                this.graphics.lineTo(-12 + armExtendX * 0.8, shoulderY + 22);
                this.graphics.moveTo(0, shoulderY + 8);
                this.graphics.lineTo(12 + armExtendX * 0.8, shoulderY + 22);
            }
        }
        
        this.graphics.strokePath();
        
        // Head
        let headY = this.isBlocking ? -15 : -25;
        this.graphics.fillStyle(strokeColor, 1);
        this.graphics.fillCircle(0, headY, 12);
        
        // CHARACTER-SPECIFIC VISUAL DECORATIONS
        this.graphics.lineStyle(2, strokeColor, 1);
        if (this.characterName === 'Gojo') {
            // Draw Blindfold
            this.graphics.fillStyle(0x111111, 1);
            this.graphics.fillRect(-7, headY - 3, 14, 6);
            // Draw spiky white hair
            this.graphics.fillStyle(0xffffff, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-10, headY - 8);
            this.graphics.lineTo(-13, headY - 20);
            this.graphics.lineTo(-5, headY - 12);
            this.graphics.lineTo(0, headY - 24);
            this.graphics.lineTo(5, headY - 12);
            this.graphics.lineTo(13, headY - 20);
            this.graphics.lineTo(10, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            
            // Draw glowing blue eyes underneath if in domain/attacking
            if (this.scene.domainType === 'void' || this.isAttacking) {
                this.graphics.fillStyle(0x00ccff, 1);
                this.graphics.fillCircle(-4, headY, 2.5);
                this.graphics.fillCircle(4, headY, 2.5);
            }
        } else if (this.characterName === 'Sukuna') {
            // Pink hair
            this.graphics.fillStyle(0xffaacc, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-10, headY - 8);
            this.graphics.lineTo(-12, headY - 18);
            this.graphics.lineTo(-4, headY - 11);
            this.graphics.lineTo(2, headY - 21);
            this.graphics.lineTo(6, headY - 11);
            this.graphics.lineTo(12, headY - 18);
            this.graphics.lineTo(10, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            // Forehead lines / tattoos
            this.graphics.lineStyle(1.5, 0x000000);
            this.graphics.beginPath();
            this.graphics.moveTo(-6, headY + 5);
            this.graphics.lineTo(6, headY + 5);
            this.graphics.moveTo(-3, headY - 4);
            this.graphics.lineTo(3, headY - 4);
            this.graphics.strokePath();
        } else if (this.characterName === 'Yuta') {
            // Black spiky messy hair
            this.graphics.fillStyle(0x111111, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-9, headY - 8);
            this.graphics.lineTo(-11, headY - 17);
            this.graphics.lineTo(-3, headY - 10);
            this.graphics.lineTo(1, headY - 19);
            this.graphics.lineTo(5, headY - 10);
            this.graphics.lineTo(11, headY - 16);
            this.graphics.lineTo(9, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            
            // Draw Katana in front hand if attacking
            let kX = 15 + armExtendX;
            let kY = shoulderY + 15;
            this.graphics.lineStyle(2, 0xcccccc, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(kX, kY);
            this.graphics.lineTo(kX + (flipX ? -35 : 35), kY - 10);
            this.graphics.strokePath();
            // Katana handle/hilt
            this.graphics.lineStyle(3, 0x884400, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(kX, kY);
            this.graphics.lineTo(kX - (flipX ? -5 : 5), kY + 2);
            this.graphics.strokePath();
        } else if (this.characterName === 'Dagon') {
            // Red head and tentacles
            this.graphics.fillStyle(0xff3333, 1);
            this.graphics.fillCircle(0, headY, 11);
            // tentacles
            this.graphics.lineStyle(2, 0xff5555, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-5, headY + 6); this.graphics.lineTo(-8, headY + 15);
            this.graphics.moveTo(0, headY + 8); this.graphics.lineTo(0, headY + 18);
            this.graphics.moveTo(5, headY + 6); this.graphics.lineTo(8, headY + 15);
            this.graphics.strokePath();
        } else if (this.characterName === 'Itadori') {
            // Pink hair with black sides
            this.graphics.fillStyle(0xff77aa, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-9, headY - 8);
            this.graphics.lineTo(-10, headY - 17);
            this.graphics.lineTo(-4, headY - 11);
            this.graphics.lineTo(1, headY - 18);
            this.graphics.lineTo(5, headY - 11);
            this.graphics.lineTo(10, headY - 17);
            this.graphics.lineTo(9, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            // Red collar/hood
            this.graphics.fillStyle(0xff3333, 1);
            this.graphics.fillCircle(0, shoulderY, 6);
        } else if (this.characterName === 'Toji') {
            // Black flat messy hair
            this.graphics.fillStyle(0x222222, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-9, headY - 8);
            this.graphics.lineTo(-10, headY - 14);
            this.graphics.lineTo(-3, headY - 11);
            this.graphics.lineTo(1, headY - 15);
            this.graphics.lineTo(6, headY - 11);
            this.graphics.lineTo(10, headY - 14);
            this.graphics.lineTo(9, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            
            // Draw Playful Cloud staff (red)
            let sX = 15 + armExtendX;
            let sY = shoulderY + 15;
            this.graphics.lineStyle(3, 0xee2222, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(sX - 10, sY - 15);
            this.graphics.lineTo(sX + 10, sY + 15);
            this.graphics.strokePath();
        } else if (this.characterName === 'Choso') {
            // Two high pigtails
            this.graphics.fillStyle(0x332222, 1);
            this.graphics.fillCircle(-8, headY - 8, 4);
            this.graphics.fillCircle(8, headY - 8, 4);
            // Black stripe nose mark
            this.graphics.lineStyle(3, 0x111111);
            this.graphics.beginPath();
            this.graphics.moveTo(-6, headY + 1);
            this.graphics.lineTo(6, headY + 1);
            this.graphics.strokePath();
            
            // Draw orbiting blood drops
            let bAngle = t * 2;
            this.graphics.fillStyle(0xcc0000, 0.8);
            this.graphics.fillCircle(Math.cos(bAngle)*20, headY + Math.sin(bAngle)*10, 4);
            this.graphics.fillCircle(Math.cos(bAngle + Math.PI)*20, headY + Math.sin(bAngle + Math.PI)*10, 4);
        } else if (this.characterName === 'Mahito') {
            // Light gray-blue hair
            this.graphics.fillStyle(0xbbaaee, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-9, headY - 8);
            this.graphics.lineTo(-12, headY - 16);
            this.graphics.lineTo(-4, headY - 10);
            this.graphics.lineTo(2, headY - 17);
            this.graphics.lineTo(6, headY - 10);
            this.graphics.lineTo(11, headY - 15);
            this.graphics.lineTo(9, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            // Stitch marks across face
            this.graphics.lineStyle(1.5, 0x000000, 0.5);
            this.graphics.beginPath();
            this.graphics.moveTo(-5, headY - 2); this.graphics.lineTo(5, headY - 2);
            this.graphics.moveTo(-2, headY - 5); this.graphics.lineTo(-2, headY + 1);
            this.graphics.moveTo(2, headY - 5); this.graphics.lineTo(2, headY + 1);
            this.graphics.strokePath();
        } else if (this.characterName === 'Megumi') {
            // Super spiky dark hair
            this.graphics.fillStyle(0x111122, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-10, headY - 8);
            this.graphics.lineTo(-16, headY - 22);
            this.graphics.lineTo(-6, headY - 12);
            this.graphics.lineTo(-2, headY - 25);
            this.graphics.lineTo(3, headY - 12);
            this.graphics.lineTo(12, headY - 23);
            this.graphics.lineTo(8, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
        } else if (this.characterName === 'Hakari') {
            // Pompadour blond hair
            this.graphics.fillStyle(0xffeebb, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-8, headY - 8);
            this.graphics.quadraticCurveTo(-15, headY - 25, 0, headY - 25);
            this.graphics.quadraticCurveTo(15, headY - 25, 8, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
        } else if (this.characterName === 'Naoya') {
            // Dyed blond styled hair
            this.graphics.fillStyle(0xeedd88, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(-9, headY - 8);
            this.graphics.lineTo(-6, headY - 19);
            this.graphics.lineTo(0, headY - 12);
            this.graphics.lineTo(6, headY - 18);
            this.graphics.lineTo(9, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
        } else if (this.characterName === 'Kenjaku') {
            // Hair with bun
            this.graphics.fillStyle(0x222222, 1);
            this.graphics.fillCircle(0, headY - 14, 6); // Bun
            this.graphics.beginPath();
            this.graphics.moveTo(-9, headY - 8);
            this.graphics.lineTo(-5, headY - 14);
            this.graphics.lineTo(5, headY - 14);
            this.graphics.lineTo(9, headY - 8);
            this.graphics.closePath();
            this.graphics.fillPath();
            // Stitch line on forehead
            this.graphics.lineStyle(1.5, 0xff0000, 0.8);
            this.graphics.beginPath();
            this.graphics.moveTo(-7, headY - 6);
            this.graphics.lineTo(7, headY - 6);
            this.graphics.strokePath();
        }
    }

    attack(flipX) {
        this.isAttacking = true;
        if (window.playHitSound) window.playHitSound();

        let reach = 55;
        let hx = flipX ? this.x - reach : this.x + reach;
        let hitbox = this.scene.add.rectangle(hx, this.y, 65, 45, 0xffffff, 0); 
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
        } else if (this.characterName === 'Yuta') {
            if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y - 20, 'cursed_speech', dir, this);
            else if (tier === 2) new Projectile(this.scene, this.x + dir*80, this.y, 'rika_claw', dir, this);
            else if (tier === 3) {
                this.scene.activateDomain('love', this);
                this.energy = Math.min(this.maxEnergy, this.energy * 3); // Instant 3x current CE
            }
            else if (tier === 4) new Projectile(this.scene, this.x + dir*70, this.y - 10, 'thin_ice', dir, this);
            
            if (window.playSwordSound) window.playSwordSound();
        } else if (this.characterName === 'Dagon') {
            if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'water_beam', dir, this);
            else if (tier === 2) {
                for(let i=0; i<3; i++) {
                    this.scene.time.delayedCall(i*150, () => new Projectile(this.scene, this.x + dir*60, this.y - 40 + i*30, 'detailed_fish', dir, this));
                }
            }
            else if (tier === 3) this.scene.activateDomain('beach', this);
            else if (tier === 4) new Projectile(this.scene, this.x + dir*100, this.y, 'tsunami', dir, this);
            
            if (window.playWaterSound) window.playWaterSound();
        } else {
            // Theme mechanics for remaining roster
            if (this.characterName === 'Itadori') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'divergent_fist', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'black_flash', dir, this);
                else if (tier === 3) this.scene.activateDomain('simple_domain', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'black_flash_combo', dir, this);
                if (window.playHitSound) window.playHitSound();
            } else if (this.characterName === 'Toji') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'playful_cloud', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'fly_heads', dir, this);
                else if (tier === 3) this.scene.activateDomain('null_domain', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*80, this.y, 'isoh_slash', dir, this);
                if (window.playSwordSound) window.playSwordSound();
            } else if (this.characterName === 'Choso') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'piercing_blood', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'supernova', dir, this);
                else if (tier === 3) this.scene.activateDomain('blood_armor', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'blood_meteor', dir, this);
                if (window.playBeamSound) window.playBeamSound();
            } else if (this.characterName === 'Mahito') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'soul_spike', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'body_repel', dir, this);
                else if (tier === 3) this.scene.activateDomain('perfection', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*80, this.y, 'distorted_killing', dir, this);
                if (window.playHitSound) window.playHitSound();
            } else if (this.characterName === 'Megumi') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'divine_dog', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'nue', dir, this);
                else if (tier === 3) this.scene.activateDomain('chimera', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'mahoraga', dir, this);
                if (window.playHitSound) window.playHitSound();
            } else if (this.characterName === 'Hakari') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'shutter', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'pachinko', dir, this);
                else if (tier === 3) this.scene.activateDomain('gamble', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'jackpot_strike', dir, this);
                if (window.playHitSound) window.playHitSound();
            } else if (this.characterName === 'Naoya') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'fps_dash', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'projection_strike', dir, this);
                else if (tier === 3) this.scene.activateDomain('time_palace', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'supersonic', dir, this);
                if (window.playSwordSound) window.playSwordSound();
            } else if (this.characterName === 'Kenjaku') {
                if (tier === 1) new Projectile(this.scene, this.x + dir*60, this.y, 'gravity', dir, this);
                else if (tier === 2) new Projectile(this.scene, this.x + dir*60, this.y, 'womb_spirits', dir, this);
                else if (tier === 3) this.scene.activateDomain('womb_profusion', this);
                else if (tier === 4) new Projectile(this.scene, this.x + dir*60, this.y, 'uzumaki', dir, this);
                if (window.playBeamSound) window.playBeamSound();
            }
        }

        this.scene.time.delayedCall(500, () => { this.isAttacking = false; });
        this.updateHUD();
    }

    updateHUD() {
        // Native UI Handled by GameScene
    }
}
