import { ISpriteConstructor } from '../interfaces/sprite.interface';

export class CheckPoint extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private currentScene: Phaser.Scene;

    constructor(aParams: ISpriteConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        // variables
        this.currentScene = aParams.scene;

        this.initImage();
        this.currentScene.add.existing(this);
    }

    private initImage(): void {
        // image
        this.setOrigin(0, 0);
        this.setFrame(0);

        // physics
        this.currentScene.physics.world.enable(this);
        this.body.setSize(28, 28);
        this.body.setAllowGravity(true);
        this.body.setImmovable(true);
    }

    update(): void {}
}