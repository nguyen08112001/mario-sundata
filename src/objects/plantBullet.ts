
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { Bullet } from './Bullet';

export class PlantBullet extends Bullet {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: ISpriteConstructor) {
        super(aParams);
        this.body.allowGravity = false;
        this.setScale(1)
    }

}
