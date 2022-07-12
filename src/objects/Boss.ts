import { Enemy } from './Enemy';
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { GameScene } from '../scenes/game-scene';
import { BossBullet } from './BossBullet';
import HealthBar from './HealthBar'
import { Portal } from './Portal';
import { NONE } from 'phaser';
import { CheckPoint } from './CheckPoint';
export class Boss extends Enemy {
    body: Phaser.Physics.Arcade.Body;
    fireEvent: Phaser.Time.TimerEvent;
    gotHit: boolean
    private loadingBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;
    hp: HealthBar;
    createdPortal: boolean
    

    constructor(aParams: ISpriteConstructor) {
        super(aParams);
        this.speed = -100;
        this.dyingScoreValue = 1000;
        this.setScale(3)
        this.body.setSize(25, 25)
        this.body.setOffset(20,7)
        this.heal = 100;
        this.gotHit = false
        this.hp = new HealthBar(this.currentScene, aParams.x , aParams.y - 110);
        
        this.fireEvent =  this.currentScene.time.addEvent({
        delay: 1000,
        callback: this.handleFire,
        //args: [],
        callbackScope: this,
        loop: true
        });
        this.createdPortal = false
    }

    update(): void {
        if (this.createdPortal) return
        console.log(this.heal)
        this.hp.x = this.x + 50
        this.hp.y = this.y + 100
        this.hp.draw()
        
        if (!this.isDying) {
            if (this.isActivated) {
                if (this.heal < 30){this.setTint(0xff5252)}
                this.body.setVelocityX(this.speed);
                if (this.body.blocked.right || this.body.blocked.left) {
                this.speed = -this.speed;
                this.body.velocity.x = this.speed;
                this.setFlipX(this.speed > 0 ? true : false)
                }
                if (!this.gotHit){
                    this.anims.play('bossAttack', true);
                }
            } else {
                
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this.currentScene.cameras.main.worldView)) {
                    
                    this.isActivated = true;
                }
            }
        } else {
            this.createdPortal = true
            this.createPortalExit()
            this.hp.bar.clear()
            this.hp.bar.destroy()
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
        this.hp.decrease(6)
        this.gotHit = true
        this.currentScene.time.delayedCall(1000, () => {
            this.gotHit = false
        }, [], this);  // delay in ms
        this.anims.play('bossHit', true)
            // this.setTintFill(0xffffff);
        this.body.setVelocityY(-100);
        if (this.speed  === 100) this.speed = 200
        if (this.speed  === -100) this.speed = -200
        this.currentScene.time.delayedCall(3000, () => {
            if (this.speed === 200) this.speed = 100
            if (this.speed === -200) this.speed = -100
        }, [], this);  // delay in ms
    }

    private createPortalExit(){
        let flag = this.currentScene.add.sprite(this.x+100, this.y + 65, 'flaginit', 'flaginit').play('flaginit', true)
        this.currentScene.time.delayedCall(1200, () => {
            flag.play('flagidle')
        }, [], this); 


        let tmp = this.currentScene as GameScene

        tmp.portals.add(
            new Portal({
                scene: tmp,
                x: this.x+100,
                y: this.y+65,
                height: 25,
                width: 25,
                spawn: {
                x: 0,
                y: 0,
                // x: object.x, y: object.y,
                dir: 'none'
                }
            }).setName('levelexit')
        );
    }
}
