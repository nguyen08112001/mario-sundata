import { GameScene } from '../scenes/game-scene';
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { Saw } from './Saw';
import { Dust } from './Dust';

export class Mario extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private currentScene: Phaser.Scene;
    private marioSize: string;
    private acceleration: number;
    public jumpVelo: number;
    private isJumping: boolean;
    private isDying: boolean;
    private isVulnerable: boolean;
    private vulnerableCounter: number;
    private toLeft: boolean;
    private disableFireCounter: number;

    private isDisableFire: boolean;
    private disableDustCounter: number;

    private isDisableDust: boolean;
    private onWall: boolean;
    // input
    private keys: Map<string, Phaser.Input.Keyboard.Key>;
    growAudio: Phaser.Sound.BaseSound;
    jumpAudio: Phaser.Sound.BaseSound;
    shrinkAudio: Phaser.Sound.BaseSound;
    deadAudio: Phaser.Sound.BaseSound;

    public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
        return this.keys;
    }

    public getVulnerable(): boolean {
        return this.isVulnerable;
    }

    constructor(aParams: ISpriteConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.currentScene = aParams.scene as GameScene;
        this.initSprite();
        this.currentScene.add.existing(this);

        this.growAudio = this.currentScene.sound.add('grow')
        this.jumpAudio = this.currentScene.sound.add('jump')
        this.shrinkAudio = this.currentScene.sound.add('shrink')
        this.deadAudio = this.currentScene.sound.add('dead')
    }

    private initSprite() {
        // variables
        this.marioSize = this.currentScene.registry.get('marioSize');
        this.acceleration = 1000;
        this.isJumping = false;
        this.isDying = false;
        this.isVulnerable = true;
        this.vulnerableCounter = 100;
        this.isDisableFire = false;
        this.disableDustCounter = 5;
        this.isDisableDust = false;
        this.disableFireCounter = 20;
        this.toLeft = false;
        this.jumpVelo = 250;
        this.onWall = false;
        // sprite
        this.setOrigin(0.5, 0.5);
        this.setFlipX(false);
        this.setScale(1)

        // input
        this.keys = new Map([
            ['LEFT', this.addKey('LEFT')],
            ['RIGHT', this.addKey('RIGHT')],
            ['DOWN', this.addKey('DOWN')],
            ['JUMP', this.addKey('UP')],
            ['ATTACK', this.addKey('SPACE')]
        ]);

        // physics
        // this.growMario()
        this.currentScene.physics.world.enable(this);

        if (this.marioSize === 'small')
            this.adjustPhysicBodyToSmallSize();
        else 
            this.adjustPhysicBodyToBigSize();
        // this.body.setGravityY(200)
        this.body.maxVelocity.x = 150;
        // this.body.maxVelocity.y = 1000;
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.currentScene.input.keyboard.addKey(key);
    }

    update(): void {
        if (!this.isDying) {
            this.handleInput();
            this.handleAnimations();
        } else {
            this.anims.play('characterhit', true);
            if (this.y > this.currentScene.sys.canvas.height) {
                this.currentScene.sound.pauseAll()
                this.currentScene.scene.stop('GameScene');
                this.currentScene.scene.stop('HUDScene');
                this.currentScene.scene.start('MenuScene');
            }
        }

        if (this.isDisableFire) {
            if (this.disableFireCounter > 0) {
                this.disableFireCounter -= 1;
            } else {
                this.disableFireCounter = 20;
                this.isDisableFire = false;
            }
        }
        if (this.isDisableDust) {
            if (this.disableDustCounter > 0) {
                this.disableDustCounter -= 1;
            } else {
                this.disableDustCounter = 5;
                this.isDisableDust = false;
            }
        }

        if (!this.isVulnerable) {
            if (this.vulnerableCounter > 0) {
                this.vulnerableCounter -= 1;
            } else {
                this.vulnerableCounter = 100;
                this.isVulnerable = true;
            }
        }
        if ( (this.body.blocked.left  && !this.body.blocked.down) || (this.body.blocked.right && !this.body.blocked.down)) {
            this.onWall = true;
            this.anims.play('characterwalljump', true)
            // if (this.isJumping) return;
            // this.body.setGravityY(0)
            // this.body.setAccelerationY(0)
            // this.body.setVelocityY(0)
            // this.body.maxVelocity.y = 0
            // this.body.allowGravity = false
            // if (this.keys.get('JUMP').isDown) {
            //     this.body.setVelocityY(-this.jumpVelo);
            //     this.isJumping = true;
            // }
        } else {
            this.onWall = false;
            this.body.setMaxVelocityY(1000)
            // if (this.keys.get('JUMP').isDown && !this.isJumping) {
            //     this.body.setVelocityY(-this.jumpVelo);
            //     this.isJumping = true;
            //     this.anims.play('characterjump', true)
            //     this.currentScene.time.delayedCall(200, () => {
            //     this.anims.play('characterfall', true);
    
                    
            //     }, [], this);  // delay in ms
            // }
        }
    }

    private handleInput() {
        if (this.y > this.currentScene.sys.canvas.height) {
            // mario fell into a hole
            this.isDying = true;
        }

        // evaluate if player is on the floor or on object
        // if neither of that, set the player to be jumping
        if (
            this.body.onFloor() ||
            this.body.touching.down ||
            this.body.blocked.down
        ) {
            this.isJumping = false;
            //this.body.setVelocityY(0);
        }

        // handle movements to left and right
        if (this.keys.get('RIGHT').isDown) {
            if(this.body.blocked.down) 
                this.createDust(false)
            this.body.setAccelerationX(this.acceleration);
            this.setFlipX(false);
            this.toLeft = false;
        } else if (this.keys.get('LEFT').isDown) {
            if(this.body.blocked.down) 
                this.createDust(true)
            this.body.setAccelerationX(-this.acceleration);
            this.setFlipX(true);
            this.toLeft = true;
        } else {
            this.body.setVelocityX(0);
            this.body.setAccelerationX(0);
        }

        //handle attack
        // if (this.keys.get('ATTACK').isDown) {
        //   this.handleFire()
    
        // }

        this.currentScene.input.keyboard.on('keydown', (event: { code: string; }) => {
            if (event.code === "Space" && !this.isDisableFire) {
                this.handleFire()
                this.isDisableFire = true
            }
        })

        // handle jumping
        if ((this.keys.get('JUMP').isDown && !this.isJumping) 
        || (this.keys.get('JUMP').isDown && this.onWall)) 
        {
            this.createJumpDust()
            this.body.setVelocityY(-this.jumpVelo);
            this.isJumping = true;
            this.anims.play('characterjump', true)
            this.currentScene.time.delayedCall(200, () => {
            this.anims.play('characterfall', true);            
            }, [], this); 

        }
    }

    private createDust(isleft: boolean) {
        if (this.isDisableDust) return;
        this.isDisableDust = true;
        let dust: any;
        if (isleft) {
            dust = new Dust({
                scene: this.currentScene, 
                x: this.x+5, 
                y: this.y+5, 
                texture: 'dust'
            })
        } else {
            dust = new Dust({
                scene: this.currentScene, 
                x: this.x-10, 
                y: this.y+5, 
                texture: 'dust'
            })
        }
        dust.initImage(isleft)


        this.currentScene.time.addEvent({
            delay: 1,
            callback: () => {
                dust.update()
            },
            //args: [],
            callbackScope: this,
            loop: true
        });
    }
    
    private createJumpDust() {
        if (this.onWall) return
        let dust1: any;
        let dust2: any;
        let dust3: any;
        let dust4: any;
 
        dust1 = new Dust({
            scene: this.currentScene, 
            x: this.x, 
            y: this.y+5, 
            texture: 'dust'
        })
        dust2 = new Dust({
            scene: this.currentScene, 
            x: this.x, 
            y: this.y+5, 
            texture: 'dust'
        })
        dust3 = new Dust({
            scene: this.currentScene, 
            x: this.x, 
            y: this.y+5, 
            texture: 'dust'
        })
        dust4 = new Dust({
            scene: this.currentScene, 
            x: this.x, 
            y: this.y+5, 
            texture: 'dust'
        })


        dust1.initJump1();
        dust2.initJump2();
        dust3.initJump3();
        dust4.initJump4();


        this.currentScene.time.addEvent({
            delay: 20,
            callback: () => {
                dust1.update()
                dust2.update()
                dust3.update()
                dust4.update()
            },
            //args: [],
            callbackScope: this,
            loop: true
        });
    }

    private handleAnimations(): void {
        if (this.body.velocity.y !== 0 && !this.onWall) {
        // mario is jumping or falling
            if (this.body.velocity.y > 0)
                this.anims.play('characterfall', true);
        
        } else if (this.body.velocity.x !== 0) {
        // mario is moving horizontal

        // check if mario is making a quick direction change
            if (
                (this.body.velocity.x < 0 && this.body.acceleration.x > 0) ||
                (this.body.velocity.x > 0 && this.body.acceleration.x < 0)
            ) {
                if (this.marioSize === 'small') {
                    this.setFrame(5);
                } else {
                    this.setFrame(11);
                }
            }

            if (this.body.velocity.x > 0) {
                this.anims.play('character', true);
            } else {
                this.anims.play('character', true);
            }
        } else {
        // mario is standing still
            this.anims.play('characteridle', true);
        }
    }

    public growMario(): void {
        this.growAudio.play()
        this.marioSize = 'big';
        this.currentScene.registry.set('marioSize', 'big');
        this.adjustPhysicBodyToBigSize();
    }

    private shrinkMario(): void {
        this.shrinkAudio.play()
        this.marioSize = 'small';
        this.currentScene.registry.set('marioSize', 'small');
        this.adjustPhysicBodyToSmallSize();
        this.setTintFill(0xffffff);
        this.currentScene.time.delayedCall(500, () => {
            this.clearTint();
        }, [], this);  // delay in ms
    }

    private adjustPhysicBodyToSmallSize(): void {
        this.setScale(1)
        this.body.setSize(this.displayWidth*0.5, this.displayHeight*0.7);
        this.body.setOffset(10, 8);
    }

    private adjustPhysicBodyToBigSize(): void {
        this.setScale(1.3)
        this.body.setSize(this.displayWidth*0.3, this.displayHeight*0.5);
        this.body.setOffset(10, 10);
    }

    public bounceUpAfterHitEnemyOnHead(): void {

        this.body.setVelocityY(-this.jumpVelo/1.5);
        this.createJumpDust()
        this.isJumping = true;
        this.currentScene.time.delayedCall(200, () => {
            this.anims.play('characterfall', true);
        }, [], this);  // delay in ms
    }

    public gotHit(): void {
        this.isVulnerable = false;
        if (this.marioSize === 'big') {
            this.shrinkMario();
        } else {
        // mario is dying
            this.deadAudio.play()
            this.isDying = true;

            // sets acceleration, velocity and speed to zero
            // stop all animations
            this.body.stop();
            // this.anims.stop();

            // make last dead jump and turn off collision check
            this.body.setVelocityY(-180);

            // this.body.checkCollision.none did not work for me
            this.body.checkCollision.up = false;
            this.body.checkCollision.down = false;
            this.body.checkCollision.left = false;
            this.body.checkCollision.right = false;
        }
    }

    private handleFire() {
        let tmp = this.currentScene as GameScene
        

            let saw = new Saw({
            scene: this.scene,
            x: this.x,
            y: this.y,
            texture: 'saw',
        })
        tmp.playerBullets.add(saw)
        saw.fire(this.x, this.y-15, this.toLeft)
    }
}
