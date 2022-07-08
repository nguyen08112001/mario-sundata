import { Enemy } from './enemy';
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { GameScene } from '../scenes/game-scene';
import { PlantBullet } from './plantBullet';
import { BossBullet } from './BossBullet';

export class Boss extends Enemy {
  body: Phaser.Physics.Arcade.Body;
    fireEvent: Phaser.Time.TimerEvent;
 
  constructor(aParams: ISpriteConstructor) {
    super(aParams);
    this.speed = -100;
    this.dyingScoreValue = 1000;
    this.setScale(3)
    this.body.setSize(25, 25)
    this.body.setOffset(20,7)
    this.heal = 50;

    this.fireEvent =  this.currentScene.time.addEvent({
      delay: 1000,                // ms
      callback: this.handleFire,
      //args: [],
      callbackScope: this,
      loop: true
    });
  }

  update(): void {
    console.log(this.heal)
    
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
        this.anims.play('bossAttack', true);
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

  private handleFire() {
    if (this.isDying) 
    {
        this.currentScene.time.removeEvent(this.fireEvent);
    this.fireEvent = undefined
    return
    }
    let tmp = this.currentScene as GameScene
  
        let bullet = new BossBullet({
          scene: this.currentScene,
          x: this.x,
          y: this.y+500,
          texture: 'bossBullet',
      })
      tmp.enemyBullets.add(bullet)
    //   let tmpp = Phaser.Math.Between(50,85)
      // bullet.fire(this.x+65, this.y+Phaser.Math.Between(50,85), this.speed < 0)
      bullet.fire(this.x+65, this.y+40, this.speed < 0)
  }

  public gotHitOnHead() {
    super.gotHitOnHead()
    this.anims.play('bossHit', true)
    this.body.setVelocityY(-50);
    if (this.speed  === 100) this.speed = 200
    if (this.speed  === -100) this.speed = -200
    this.currentScene.time.delayedCall(3000, () => {
      if (this.speed === 200) this.speed = 100
      if (this.speed === -200) this.speed = -100
      
  }, [], this);  // delay in ms
  }

}
