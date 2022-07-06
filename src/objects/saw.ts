import { GameScene } from './../scenes/game-scene';
import { IPlatformConstructor } from '../interfaces/platform.interface';

export class Saw extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;

  // variables
  private currentScene: Phaser.Scene;
  private tweenProps: any;
  private  hasCollided: boolean;

  constructor(aParams: IPlatformConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    // variables
    this.currentScene = aParams.scene;
    this.tweenProps = aParams.tweenProps;
    this.hasCollided = false

    this.initImage();
    this.initTween();
    this.currentScene.add.existing(this);
  }

  private initImage(): void {
    // image
    this.setOrigin(0, 0);
    this.setScale(0.5)

    // physics
    this.currentScene.physics.world.enable(this);
    this.body.setSize(24, 5);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  private initTween(): void {
    this.anims.play('saw')
    this.currentScene.tweens.add({
      targets: this,
      props: this.tweenProps,
      ease: 'Power0',
      yoyo: true,
      repeat: -1
    });
  }

  update(): void {}

  fire(x: number, y: number, left: boolean) {
    this.body.allowGravity = true;

    this.setPosition(x, y);
    this.body.velocity.x = 200 * (left ? -1 : 1);
    // this.play("fireFly");
    // this.scene.sound.playAudioSprite('sfx', 'smb_fireball');
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
        this.body.allowGravity = false;
        this.body.velocity.y = 0;
        // 为了防止在和 enemy 碰撞后再和墙壁碰撞,destroy() 以后再播放动画导致错误
        if (this.hasCollided) {
            return
        }

        // this.play("fireExplode");
        this.hasCollided = true
        let tmp = this.currentScene as GameScene
        tmp.playerBullets.remove(this, true, true)
        this.destroy()
        // 爆炸动画结束,从场景移除,并销毁
        // this.once('animationcomplete', function () { ///this refers to an arcade sprite.
        //     this.currentScene.playerBullets.remove(this, true, true)
        // }, this)
    }
}
