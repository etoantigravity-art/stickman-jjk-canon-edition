import Phaser from 'phaser';
import Fighter from '../entities/Fighter';
import { PHYSICS } from '../utils/constants';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.p1Char = data.p1 || 'Gojo';
        this.p2Char = data.p2 || 'Sukuna';
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.bg = this.add.rectangle(0, 0, width, height, 0x111116).setOrigin(0);
        
        // Floor
        this.floor = this.add.rectangle(width/2, PHYSICS.FLOOR_Y + 100, width, 200, 0x222222);
        this.physics.add.existing(this.floor, true); 

        // Projectiles Group
        this.projectiles = this.physics.add.group();

        // Inputs
        this.p1Keys = this.input.keyboard.addKeys('W,A,S,D,F,G');
        this.p2Keys = this.input.keyboard.addKeys('UP,LEFT,DOWN,RIGHT,K,L');

        // Players
        this.p1 = new Fighter(this, 300, PHYSICS.FLOOR_Y - 100, this.p1Char, 1, this.p1Keys);
        this.p2 = new Fighter(this, width - 300, PHYSICS.FLOOR_Y - 100, this.p2Char, 2, this.p2Keys);

        this.p1.enemy = this.p2;
        this.p2.enemy = this.p1;

        // Collisions
        this.physics.add.collider(this.p1, this.floor);
        this.physics.add.collider(this.p2, this.floor);
        
        // Projectile Hits
        this.physics.add.overlap(this.projectiles, [this.p1, this.p2], (fighter, proj) => {
            if (proj.owner === fighter || !proj.activeHit) return;
            
            // Continuous damage / pull from blue shouldn't despawn it
            if (proj.projType === 'blue' || proj.projType === 'purple') {
                fighter.takeDamage(10);
                return;
            }

            // Normal Hit
            proj.activeHit = false;
            proj.destroy();

            // Guard logic
            if (fighter.isBlocking && fighter.characterName === 'Gojo' && fighter.energy >= 5) {
                fighter.takeDamage(0); // Infinity activates
            } else {
                fighter.takeDamage(proj.damage);
                fighter.body.setVelocityX(proj.knockX);
                fighter.body.setVelocityY(proj.knockY);
                
                let flash = this.add.circle(fighter.x, fighter.y, 40, proj.projType==='red'?0xff0000:0xffffff, 0.8);
                this.tweens.add({ targets: flash, scale: 2, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
            }
        });

        // UI is handled natively now
        this.createHUD();
    }

    createHUD() {
        this.hudTop = this.add.container(0, 0).setDepth(200);
        this.hudGraphics = this.add.graphics();
        this.hudTop.add(this.hudGraphics);
        
        this.p1NameText = this.add.text(120, 15, "GOJO SATORU", { fontSize: '26px', fontStyle: 'bold', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 });
        this.p2NameText = this.add.text(this.scale.width - 320, 15, "RYOMEN SUKUNA", { fontSize: '26px', fontStyle: 'bold', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 });
        this.hudTop.add([this.p1NameText, this.p2NameText]);
    }

    updateHUD() {
        this.hudGraphics.clear();
        
        // P1 Border / Background (Soul Calibur style curves)
        this.hudGraphics.fillStyle(0x222222, 0.9);
        this.hudGraphics.lineStyle(5, 0xb8860b, 1); // Gold trim
        this.hudGraphics.beginPath();
        
        // P1 Health Bar
        let p1hpP = Math.max(0, this.p1.hp / 1000); // 1000 max hp? Wait fighter.js says 250? Actually 250 in constructor.
        p1hpP = Math.max(0, this.p1.hp / this.p1.maxHp);
        this.hudGraphics.fillStyle(0x222222, 1);
        this.hudGraphics.fillRect(110, 50, 400, 26);
        this.hudGraphics.fillStyle(0xffaa00, 1);
        this.hudGraphics.fillRect(110, 50, 400 * p1hpP, 26);
        this.hudGraphics.strokeRect(110, 50, 400, 26);
        
        // P1 Cursed Energy Bar
        let p1ceP = Math.max(0, this.p1.energy / this.p1.maxEnergy);
        this.hudGraphics.fillStyle(0x111111, 1);
        this.hudGraphics.fillRect(110, 80, 250, 12);
        this.hudGraphics.fillStyle(0x00ccff, 1);
        this.hudGraphics.fillRect(110, 80, 250 * p1ceP, 12);
        this.hudGraphics.lineStyle(2, 0x0088cc, 1);
        this.hudGraphics.strokeRect(110, 80, 250, 12);

        // P2 Bars (Right bounded)
        let bx2 = this.scale.width - 510;
        this.hudGraphics.lineStyle(5, 0xb8860b, 1); // Gold trim
        let p2hpP = Math.max(0, this.p2.hp / this.p2.maxHp);
        this.hudGraphics.fillStyle(0x222222, 1);
        this.hudGraphics.fillRect(bx2, 50, 400, 26);
        this.hudGraphics.fillStyle(0xff3333, 1);
        this.hudGraphics.fillRect(bx2 + 400 - (400*p2hpP), 50, 400 * p2hpP, 26);
        this.hudGraphics.strokeRect(bx2, 50, 400, 26);

        let p2ceP = Math.max(0, this.p2.energy / this.p2.maxEnergy);
        let ex2 = this.scale.width - 360;
        this.hudGraphics.fillStyle(0x111111, 1);
        this.hudGraphics.fillRect(ex2, 80, 250, 12);
        this.hudGraphics.fillStyle(0xff0044, 1);
        this.hudGraphics.fillRect(ex2 + 250 - (250*p2ceP), 80, 250 * p2ceP, 12);
        this.hudGraphics.lineStyle(2, 0x990022, 1);
        this.hudGraphics.strokeRect(ex2, 80, 250, 12);
        
        // Outer Medallions for portraits
        this.hudGraphics.lineStyle(8, 0xb8860b, 1);
        this.hudGraphics.fillStyle(0x0a0a0a, 1);
        this.hudGraphics.fillCircle(60, 65, 55);
        this.hudGraphics.strokeCircle(60, 65, 55);
        
        this.hudGraphics.fillCircle(this.scale.width - 60, 65, 55);
        this.hudGraphics.strokeCircle(this.scale.width - 60, 65, 55);
    }

    update(time, delta) {
        if (this.isClashing) {
            this.clashTime -= delta;
            if (this.timerText) this.timerText.setText((this.clashTime/1000).toFixed(1));
            
            if (this.clashTime <= 0) {
                let winner = this.p1ClashIdx >= this.p2ClashIdx ? this.p1 : this.p2;
                this.resolveClash(winner);
            }
            return; // Skip normal update logic while clashing
        }

        this.p1.update(delta);
        this.p2.update(delta);
        this.updateHUD();
        
        this.projectiles.getChildren().forEach(proj => {
            if (proj.update) proj.update(time, delta);
        });

        // Domain continuous effects
        if (this.domainType === 'void' && this.domainGraphics) {
            this.domainGraphics.clear();
            let cx = this.scale.width/2;
            let cy = this.scale.height/2;
            
            this.domainTime += delta;
            
            // Draw rotating galaxy
            if(this.domainStars) {
                this.domainStars.forEach((star, i) => {
                    let rot = star.angle + (this.domainTime/2000);
                    let d = star.dist + Math.sin(this.domainTime/1000 + i)*20;
                    let color = Phaser.Display.Color.HSLToColor((220 + Math.sin(i)*50)/360, 1, 0.7).color;
                    this.domainGraphics.fillStyle(color, 1);
                    this.domainGraphics.fillCircle(cx + Math.cos(rot)*d, cy + Math.sin(rot)*d, Math.random()*2+1);
                });
            }
            // Center abstract eye
            this.domainGraphics.fillStyle(0x000000, 1);
            this.domainGraphics.fillCircle(cx, cy, 50);
            this.domainGraphics.lineStyle(6, 0x00aaff, 0.8);
            this.domainGraphics.strokeCircle(cx, cy, 55 + Math.sin(this.domainTime/200)*5);
        } else if (this.domainType === 'shrine') {
            // Constant dismantle slashes on the screen
            if (Math.random() < 0.25 && this.domainOwner && this.domainOwner.enemy) { // 25% chance per frame
                let enemy = this.domainOwner.enemy;
                let sx = enemy.x + (Math.random()-0.5)*150;
                let sy = enemy.y + (Math.random()-0.5)*150;
                
                let slash = this.add.graphics();
                slash.lineStyle(4, 0xffffff, 1);
                slash.beginPath();
                slash.moveTo(sx - 40, sy - 40); slash.lineTo(sx + 40, sy + 40);
                slash.moveTo(sx - 40, sy + 40); slash.lineTo(sx + 40, sy - 40);
                slash.strokePath();
                
                this.tweens.add({ targets: slash, alpha: 0, duration: 150, onComplete: () => slash.destroy() });
                
                enemy.takeDamage(1.5); // Micro-damage every cut (sure-hit effect)
            }
        }
    }

    activateDomain(type, owner) {
        this.cameras.main.flash(500, 255, 255, 255);
        if (window.playDomainSound) window.playDomainSound();

        // Clear previous domain
        if (this.domainGraphics) this.domainGraphics.destroy();
        if (this.domainBgImage) this.domainBgImage.destroy();
        
        this.domainGraphics = this.add.graphics();
        this.domainGraphics.setDepth(-2); 

        let cx = this.scale.width/2;
        let cy = this.scale.height/2;

        this.domainType = type;
        this.domainOwner = owner;
        this.domainTime = 0;

        if (type === 'void') {
            this.domainBgImage = this.add.image(cx, cy, 'void_bg').setOrigin(0.5).setAlpha(0).setDepth(-3);
            this.tweens.add({ targets: this.domainBgImage, alpha: 1, duration: 1000 });
            
            // Abstract procedural vortex overlaid
            owner.enemy.isStunned = true; 
            
            this.domainStars = [];
            for(let i=0; i<150; i++) {
                this.domainStars.push({ dist: 50 + (i * 5), angle: (i * Math.PI*2) / 150 });
            }
        } else if (type === 'shrine') {
            this.domainBgImage = this.add.image(cx, cy, 'shrine_bg').setOrigin(0.5).setAlpha(0).setDepth(-3);
            this.tweens.add({ targets: this.domainBgImage, alpha: 0.9, duration: 500 });
            
            let fY = 650;
            // Abstract Blood Sea overlaid to ground the players
            this.domainGraphics.fillStyle(0x110000, 0.8);
            this.domainGraphics.fillRect(0, fY - 30, this.scale.width, 100);
            
            // Skulls scattered procedurally on the floor
            this.domainGraphics.fillStyle(0xddaa88, 1);
            for(let i=0; i<60; i++) {
                this.domainGraphics.fillCircle(Math.random()*this.scale.width, fY - 40 + Math.random()*50, 4 + Math.random()*6);
            }
        }
        
        // Deactivate after 10s
        this.time.delayedCall(10000, () => {
            if (this.domainType !== type) return; // Means domain was overwritten by a clash
            
            this.cameras.main.flash(200, 0, 0, 0);
            if (this.domainBgImage) {
                this.tweens.add({ targets: this.domainBgImage, alpha: 0, duration: 500, onComplete: () => this.domainBgImage.destroy() });
            }
            if (this.domainGraphics) this.domainGraphics.clear();
            this.domainType = null;
            if (this.domainOwner && this.domainOwner.enemy) this.domainOwner.enemy.isStunned = false;
        });
    }

    startDomainClash(domainA_owner, domainB_owner) {
        this.isClashing = true;
        this.clashTime = 3500; // 3.5 seconds
        
        // Pause physics
        this.p1.body.moves = false;
        this.p2.body.moves = false;
        this.p1.isStunned = true;
        this.p2.isStunned = true;

        if (this.domainBgImage) this.domainBgImage.setAlpha(0.2); // Dim existing domain

        this.clashUI = this.add.container(0, 0).setDepth(100);
        
        // Split visual background
        let bg1 = this.add.polygon(0, 0, [[0,0], [this.scale.width, 0], [0, this.scale.height]], 0x00aaff, 0.4).setOrigin(0);
        let bg2 = this.add.polygon(0, 0, [[this.scale.width,0], [this.scale.width, this.scale.height], [0, this.scale.height]], 0xff0000, 0.4).setOrigin(0);
        
        let clashText = this.add.text(this.scale.width/2, 100, "DOMAIN CLASH!", { fontSize: '80px', fontStyle: 'bold', fill: '#fff', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5);
        this.clashUI.add([bg1, bg2, clashText]);

        // FNF Sequences
        const p1Keys = ['W','A','S','D'];
        const p2Keys = ['UP','LEFT','DOWN','RIGHT'];
        
        this.p1Seq = Array.from({length: 8}, () => Phaser.Utils.Array.GetRandom(p1Keys));
        this.p2Seq = Array.from({length: 8}, () => Phaser.Utils.Array.GetRandom(p2Keys));
        
        this.p1ClashIdx = 0;
        this.p2ClashIdx = 0;

        this.p1SeqText = this.add.text(this.scale.width/4, 300, "", { fontSize: '50px', fill: '#fff', align: 'center', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
        this.p2SeqText = this.add.text(this.scale.width*0.75, 300, "", { fontSize: '50px', fill: '#fff', align: 'center', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
        
        this.timerText = this.add.text(this.scale.width/2, 250, "3.5", { fontSize: '80px', fill: '#ffff00', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5);
        this.clashUI.add([this.p1SeqText, this.p2SeqText, this.timerText]);

        this.updateClashText(1);
        this.updateClashText(2);

        this.clashInputListener = (event) => {
            if (!this.isClashing) return;
            
            let key = event.key.toUpperCase();
            if (key === 'ARROWUP') key = 'UP';
            if (key === 'ARROWDOWN') key = 'DOWN';
            if (key === 'ARROWLEFT') key = 'LEFT';
            if (key === 'ARROWRIGHT') key = 'RIGHT';

            if (p1Keys.includes(key)) {
                if (key === this.p1Seq[this.p1ClashIdx]) {
                    this.p1ClashIdx++;
                    this.cameras.main.flash(50, 0, 255, 0);
                    if (this.p1ClashIdx >= 8) this.resolveClash(this.p1);
                } else {
                    this.p1ClashIdx = 0; // Penalty
                    this.cameras.main.shake(100, 0.01);
                }
                this.updateClashText(1);
            } else if (p2Keys.includes(key)) {
                if (key === this.p2Seq[this.p2ClashIdx]) {
                    this.p2ClashIdx++;
                    this.cameras.main.flash(50, 0, 255, 0);
                    if (this.p2ClashIdx >= 8) this.resolveClash(this.p2);
                } else {
                    this.p2ClashIdx = 0; // Penalty
                    this.cameras.main.shake(100, 0.01);
                }
                this.updateClashText(2);
            }
        };

        this.input.keyboard.on('keydown', this.clashInputListener);
    }

    updateClashText(playerNum) {
        if (playerNum === 1) {
            let pending = this.p1Seq.slice(this.p1ClashIdx).join(' ');
            this.p1SeqText.setText(`[P1 GOJO]\nDone: ${this.p1ClashIdx}/8\n\n${pending}`);
            this.p1SeqText.setColor(this.p1ClashIdx === 0 ? '#ff5555' : '#55ff55');
        } else {
            let pending = this.p2Seq.slice(this.p2ClashIdx).join(' ');
            this.p2SeqText.setText(`[P2 SUKUNA]\nDone: ${this.p2ClashIdx}/8\n\n${pending}`);
            this.p2SeqText.setColor(this.p2ClashIdx === 0 ? '#ff5555' : '#55ff55');
        }
    }

    resolveClash(winner) {
        this.isClashing = false;
        this.input.keyboard.off('keydown', this.clashInputListener);
        this.clashUI.destroy();
        
        let loser = winner === this.p1 ? this.p2 : this.p1;
        
        this.p1.body.moves = true;
        this.p2.body.moves = true;
        
        winner.isStunned = false;
        loser.takeDamage(50); // Massive clash damage penalty
        
        let winnerType = winner.characterName === 'Gojo' ? 'void' : 'shrine';
        
        // Ensure winner gets full domain deployed visually over the other
        this.activateDomain(winnerType, winner);
    }
}
