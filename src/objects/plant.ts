import { Enemy } from './enemy';
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { GameScene } from '../scenes/game-scene';
import { PlantBullet } from './plantBullet';

export class Plant extends Enemy {
  body: Phaser.Physics.Arcade.Body;

  constructor(aParams: ISpriteConstructor) {
    super(aParams);
    this.speed = 0;
    this.dyingScoreValue = 200;
    this.setScale(1)
    this.body.setSize(30, 30)
    this.body.setOffset(10, 10)

    this.currentScene.time.addEvent({
      delay: 1500,                // ms
      callback: this.handleFire,
      //args: [],
      callbackScope: this,
      loop: true
  });
  }

  update(): void {
    
    // this.handleFire()
    if (!this.isDying) {
      if (this.isActivated) {
        // goomba is still alive
        // add speed to velocity x
        this.body.setVelocityX(this.speed);

        // if goomba is moving into obstacle from map layer, turn
        if (this.body.blocked.right || this.body.blocked.left) {
          this.speed = -this.speed;
          this.body.velocity.x = this.speed;
          this.setFlipX(this.speed > 0 ? true : false)
        }

        // apply walk animation
        this.anims.play('plant', true);
      } else {
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.getBounds(),
            this.currentScene.cameras.main.worldView
          )
        ) {
          this.isActivated = true;
        }
      }
    } else {
      // goomba is dying, so stop animation, make velocity 0 and do not check collisions anymore
      this.anims.stop();
      this.body.setVelocity(0, 0);
      this.body.checkCollision.none = true;
    }
  }

  public gotHitOnHead(): void {
    this.isDying = true;
    this.setFrame(2);
    this.showAndAddScore();
  }

  public isDead(): void {
    this.destroy();
  }

  private handleFire() {
    if (this.isDying) return
    let tmp = this.currentScene as GameScene
  
        let bullet = new PlantBullet({
          scene: this.currentScene,
          x: this.x,
          y: this.y+100,
          texture: 'plantBullet',
      })
      tmp.enemyBullets.add(bullet)
      bullet.fire(this.x, this.y+15, true)
  }
}
