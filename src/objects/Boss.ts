import { Enemy } from './Enemy';
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { GameScene } from '../scenes/game-scene';
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
        delay: 1000,
        callback: this.handleFire,
        //args: [],
        callbackScope: this,
        loop: true
        });
    }

    update(): void {
        console.log(this.heal)
        
        if (!this.isDying) {
            if (this.isActivated) {
                this.body.setVelocityX(this.speed);
                if (this.body.blocked.right || this.body.blocked.left) {
                this.speed = -this.speed;
                this.body.velocity.x = this.speed;
                this.setFlipX(this.speed > 0 ? true : false)
                }

                this.anims.play('bossAttack', true);
            } else {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this.currentScene.cameras.main.worldView)) {
                    this.isActivated = true;
                }
            }
        } else {
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
