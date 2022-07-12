export class MenuScene extends Phaser.Scene {
  private startKeyLevel1: Phaser.Input.Keyboard.Key;
  private startKeyLevel2: Phaser.Input.Keyboard.Key;
  private startKeyLevel3: Phaser.Input.Keyboard.Key;
  private startKeyLevel4: Phaser.Input.Keyboard.Key;
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

  constructor() {
    super({
      key: 'MenuScene'
    });
  }

  init(): void {
    this.startKeyLevel1 = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.startKeyLevel1.isDown = false;

    this.startKeyLevel2 = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.startKeyLevel2.isDown = false;

    this.startKeyLevel3 = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.F
    );
    this.startKeyLevel3.isDown = false;

    this.startKeyLevel4 = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
    this.startKeyLevel4.isDown = false;

    this.initGlobalDataManager();
  }

  create(): void {
    this.add.image(0, 0, 'title').setOrigin(0, 0).setScale(8);

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 500,
        700,
        'font',
        'S: LEVEL1    D: LEVEL2     F: LEVEL3',
        30
      )
    );
  }

  update(): void {
    if (this.startKeyLevel1.isDown) {
      this.scene.start('HUDScene');
      this.scene.start('GameScene');
      this.scene.bringToTop('HUDScene');
    }
    if (this.startKeyLevel2.isDown) {
      this.registry.set('level', 'level2');
      this.scene.start('HUDScene');
      this.scene.start('GameScene');
      this.scene.bringToTop('HUDScene');
    }
    if (this.startKeyLevel3.isDown) {
      this.registry.set('level', 'level3');
      this.scene.start('HUDScene');
      this.scene.start('GameScene');
      this.scene.bringToTop('HUDScene');
    }
    if (this.startKeyLevel4.isDown) {
      this.registry.set('level', 'level4');
      this.scene.start('HUDScene');
      this.scene.start('GameScene');
      this.scene.bringToTop('HUDScene');
    }
  }

  private initGlobalDataManager(): void {
    this.registry.set('time', 400);
    this.registry.set('level', 'level1');
    this.registry.set('world', '1-1');
    this.registry.set('worldTime', 'WORLD TIME');
    this.registry.set('score', 0);
    this.registry.set('coins', 0);
    this.registry.set('lives', 2);
    this.registry.set('spawn', { x: 1000, y: 44, dir: 'down' });
    this.registry.set('marioSize', 'small');
  }
}
