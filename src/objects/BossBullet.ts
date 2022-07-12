
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { Bullet } from './Bullet';

export class BossBullet extends Bullet {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: ISpriteConstructor) {
        super(aParams);
        this.body.allowGravity = true;
        this.setScale(3)
        this.body.setSize(5, 5)
    }

    public collided() {
        if (!this.body) return
        if (this.body.velocity.y === 0) {
            this.body.velocity.y = -300;
        }
        if (this.body.velocity.x === 0) {
            this.explode()
        }
    }

    fire(x: number, y: number, left: boolean) {
        this.setPosition(x, y);
        this.body.velocity.x = 300 * (left ? -1 : 1);
    }

}
