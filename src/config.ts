import { BootScene } from './scenes/boot-scene';
import { GameScene } from './scenes/game-scene';
import { HUDScene } from './scenes/hud-scene';
import { MenuScene } from './scenes/menu-scene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Super Mario Land',
  url: 'https://github.com/digitsensitive/phaser3-typescript',
  version: '2.0',
  width: 1200,
  height: 800,
  // zoom: 5,
  pixelArt: true,
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#FFFFAC',
  scene: [BootScene, MenuScene, HUDScene, GameScene],
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 475 },
      // debug: true
    }
  },
  // backgroundColor: '#f8f8f8',
  render: { pixelArt: true, antialias: false }
};
