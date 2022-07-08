
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { Bullet } from './Bullet';

export class Saw extends Bullet {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: ISpriteConstructor) {
        super(aParams);
        // this.body.allowGravity = true;
        // this.body.velocity.y = -150;
        this.body.setSize(24, 24)
        this.anims.play('saw')
        this.currentScene.time.addEvent({
            delay: 1000,                // ms
            callback: this.explode,
            //args: [],
            callbackScope: this,
            loop: true
        });
    }

}
