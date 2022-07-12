import { IBrickConstructor } from '../interfaces/brick.interface';
import { ISpriteConstructor } from '../interfaces/sprite.interface';

export class Dust extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private currentScene: Phaser.Scene;
    private dustAlpha: number
    constructor(aParams: ISpriteConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        // variables
        this.currentScene = aParams.scene;
        // this.initImage();
        this.currentScene.add.existing(this);
        this.dustAlpha = 1
    }

    public initImage(isLeft: boolean) {
        // image
        this.setOrigin(0, 0);
        this.setScale(0.8)
        if (!isLeft) {
            this.currentScene.tweens.add({
                targets: this,
                x: '-=20',
                y: '-=10',
                duration: 1000,
                ease: 'Power2',
                completeDelay: 3000
            });
        }
        else {
            this.currentScene.tweens.add({
                targets: this,
                x: '+=20',
                y: '-=10',
                duration: 1000,
                ease: 'Power2',
                completeDelay: 3000
            });
        }
    }

    public initJump1() {
        this.currentScene.tweens.add({
            targets: this,
            x: '-=30',
            y: '-=20',
            duration: 1000,
            ease: 'Power2',
            completeDelay: 3000
        });
    }
    public initJump2() {
        this.currentScene.tweens.add({
            targets: this,
            x: '-=30',
            y: '-=30',
            duration: 1000,
            ease: 'Power2',
            completeDelay: 3000
        });
    }
    public initJump3() {
        this.currentScene.tweens.add({
            targets: this,
            x: '+=30',
            y: '-=20',
            duration: 1000,
            ease: 'Power2',
            completeDelay: 3000
        });
    }
    public initJump4() {
        this.currentScene.tweens.add({
            targets: this,
            x: '+=30',
            y: '-=30',
            duration: 1000,
            ease: 'Power2',
            completeDelay: 3000
        });
    }

    update(): void {
        this.setAlpha(this.dustAlpha)
        this.dustAlpha -= 0.1
        if (this.dustAlpha <= 0) {
            this.destroy()
        }
        
    }
}
