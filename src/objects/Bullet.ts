import { GameScene } from './../scenes/game-scene';
import { ISpriteConstructor } from '../interfaces/sprite.interface';

export class Bullet extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;

  // variables
  protected currentScene: Phaser.Scene;
  private  hasCollided: boolean;

  constructor(aParams: ISpriteConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    // variables
    this.currentScene = aParams.scene;
    this.hasCollided = false

    this.initImage();
    this.currentScene.add.existing(this);
  }

  private initImage(): void {
    // image
    this.setOrigin(0, 0);
    this.setScale(0.5)

    // physics
    this.currentScene.physics.world.enable(this);
    this.body.setSize(10, 10);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  update(): void {}

  fire(x: number, y: number, left: boolean) {
    // this.body.allowGravity = false;

    this.setPosition(x, y);
    this.body.velocity.x = 200 * (left ? -1 : 1);
    }

    collided() {
        if (!this.body) return
        if (this.body.velocity.y === 0) {
            this.body.velocity.y = -150;
        }
        if (this.body.velocity.x === 0) {
            this.explode()

        }
    }

    explode() {
        if (this.body === undefined) return
        this.body.allowGravity = false;
        this.body.velocity.y = 0;

        if (this.hasCollided) {
            return
        }

        this.hasCollided = true
        let tmp = this.currentScene as GameScene
        tmp.playerBullets.remove(this, true, true)
        this.destroy()
    }
}
