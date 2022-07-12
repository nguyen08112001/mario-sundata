import { GameScene } from '../scenes/game-scene';
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { Saw } from './Saw';

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
    private onWall: boolean;
    // input
    private keys: Map<string, Phaser.Input.Keyboard.Key>;

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
        this.currentScene.physics.world.enable(this);

        this.growMario()
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
            this.body.setAccelerationX(this.acceleration);
            this.setFlipX(false);
            this.toLeft = false;
        } else if (this.keys.get('LEFT').isDown) {
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
        if ((   this.keys.get('JUMP').isDown && !this.isJumping) 
            || (this.keys.get('JUMP').isDown && this.onWall)) {
            this.body.setVelocityY(-this.jumpVelo);
            this.isJumping = true;
            this.anims.play('characterjump', true)
            this.currentScene.time.delayedCall(200, () => {
            this.anims.play('characterfall', true);            
            }, [], this); 

        }
    }

    private handleAnimations(): void {
        if (this.body.velocity.y !== 0 && !this.onWall) {
        // mario is jumping or falling
            // this.anims.play('characterfall', true);
        
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
        this.marioSize = 'big';
        this.currentScene.registry.set('marioSize', 'big');
        this.adjustPhysicBodyToBigSize();
    }

    private shrinkMario(): void {
        this.marioSize = 'small';
        this.currentScene.registry.set('marioSize', 'small');
        this.adjustPhysicBodyToSmallSize();
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
        // this.currentScene.add.tween({
        //     targets: this,
        //     props: { y: this.y - 50 },
        //     duration: 350,
        //     ease: 'Power1',
        //     yoyo: true,
        //     onComplete: () => {
        //         this.anims.play('characterfall', true);
        //         console.log(345)
        //     }
        // });

        this.body.setVelocityY(-this.jumpVelo/2);
            this.isJumping = true;
            this.currentScene.time.delayedCall(200, () => {
            this.anims.play('characterfall', true);

                
            }, [], this);  // delay in ms
    }

    public gotHit(): void {
        this.isVulnerable = false;
        if (this.marioSize === 'big') {
            // this.shrinkMario();
        } else {
        // mario is dying
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
