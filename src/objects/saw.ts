
import { ISpriteConstructor } from '../interfaces/sprite.interface';
import { Bullet } from './Bullet';

export class Saw extends Bullet {
  body: Phaser.Physics.Arcade.Body;

  constructor(aParams: ISpriteConstructor) {
    super(aParams);
    this.body.allowGravity = true;
  }

}
