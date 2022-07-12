import { PlantBullet } from '../objects/PlantBullet';
import { Saw } from '../objects/Saw';
import { Box } from '../objects/Box';
import { Brick } from '../objects/Brick';
import { Collectible } from '../objects/Collectible';
import { Goomba } from '../objects/Goomba';
import { Mario } from '../objects/Mario';
import { Plant } from '../objects/Plant';
import { Platform } from '../objects/Platform';
import { Portal } from '../objects/Portal';
import { Enemy } from '../objects/Enemy';
import { Bullet } from '../objects/Bullet';
import { Boss } from '../objects/Boss';

export class GameScene extends Phaser.Scene {
  // tilemap
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private tileset1: Phaser.Tilemaps.Tileset;
    private tileset_t: Phaser.Tilemaps.Tileset;
    private tileset_t1: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;
    private foregroundLayer: Phaser.Tilemaps.TilemapLayer;

    // game objects
    private boxes: Phaser.GameObjects.Group;
    private bricks: Phaser.GameObjects.Group;
    private collectibles: Phaser.GameObjects.Group;
    private enemies: Phaser.GameObjects.Group;
    private platforms: Phaser.GameObjects.Group;
    private player: Mario;
    public portals: Phaser.GameObjects.Group;
    public playerBullets: Phaser.GameObjects.Group;
    public enemyBullets: Phaser.GameObjects.Group;
    animatedTiles: any;
    minimap: Phaser.Cameras.Scene2D.Camera;

    constructor() {
        super({
        key: 'GameScene'
        });
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }
    init(): void {}
    
    create(): void {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        // *****************************************************************
        // SETUP TILEMAP
        // *****************************************************************

        // create our tilemap from Tiled JSON
        this.map = this.make.tilemap({ key: this.registry.get('level') });
        // this.map = this.make.tilemap({ key: 'level1-1' });
        // add our tileset and layers to our tilemap
        this.tileset = this.map.addTilesetImage('terrain','terrain');
        this.tileset_t = this.map.addTilesetImage('map-tileset','terrain');
        this.tileset1 = this.map.addTilesetImage('bg');
        this.tileset_t1 = this.map.addTilesetImage('bg');
        this.backgroundLayer = this.map.createLayer(
        'backgroundLayer',
        this.tileset1,
        0,
        0
        );

        this.foregroundLayer = this.map.createLayer(
        'foregroundLayer',
        this.tileset,
        0,
        0
        );
        this.foregroundLayer.setName('foregroundLayer');
        this.animatedTiles.init(this.map);
        // set collision for tiles with the property collide set to true
        this.foregroundLayer.setCollisionByProperty({ collide: true });
        this.foregroundLayer.setCollisionByExclusion([-1]);

        // *****************************************************************
        // GAME OBJECTS
        // *****************************************************************
        this.portals = this.add.group({
        /*classType: Portal,*/
        runChildUpdate: true
        });

        this.playerBullets = this.add.group({
        /*classType: Portal,*/
        runChildUpdate: true
        });

        this.boxes = this.add.group({
        /*classType: Box,*/
        runChildUpdate: true
        });

        this.bricks = this.add.group({
        /*classType: Brick,*/
        runChildUpdate: true
        });

        this.collectibles = this.add.group({
        /*classType: Collectible,*/
        runChildUpdate: true
        });

        this.enemies = this.add.group({
        runChildUpdate: true
        });

        this.platforms = this.add.group({
        /*classType: Platform,*/
        runChildUpdate: true
        });
        
        this.enemyBullets = this.add.group({
        /*classType: Platform,*/
        runChildUpdate: true
        });

        this.loadObjectsFromTilemap();

        // *****************************************************************
        // COLLIDERS
        // *****************************************************************
        this.physics.add.collider(this.player, this.foregroundLayer);
        this.physics.add.collider(this.enemies, this.foregroundLayer);
        this.physics.add.collider(this.enemies, this.boxes);
        this.physics.add.collider(this.enemies, this.bricks);
        this.physics.add.collider(this.player, this.bricks);
        this.physics.add.overlap(
        this.playerBullets, 
        this.enemies, 
        this.handlePlayerBulletsEnemyOverlap, 
        null, 
        this
        );
        this.physics.add.collider(this.playerBullets, this.foregroundLayer, (saw: any, layer)=> {
        saw.collided()
        } );
        this.physics.add.collider(this.enemyBullets, this.foregroundLayer, (bullet: any, layer)=> {
        bullet.collided()
        } );
        this.physics.add.overlap(this.enemyBullets, this.playerBullets, (enemy: any, player: any)=> {
        enemy.explode()
        player.explode()
        } );

        this.physics.add.collider(
        this.player,
        this.boxes,
        this.playerHitBox,
        null,
        this
        );

        this.physics.add.collider(
        this.player,
        this.enemies,
        this.handlePlayerEnemyOverlap,
        null,
        this
        );
        this.physics.add.overlap(
        this.player,
        this.enemyBullets,
        (_player: Mario, _bullet: Bullet) => {
            if (_player.getVulnerable()) {
            _player.gotHit();
            }
        },
        null,
        this
        );

        this.physics.add.overlap(
        this.player,
        this.portals,
        this.handlePlayerPortalOverlap,
        null,
        this
        );

        this.physics.add.collider(
        this.player,
        this.platforms,
        this.handlePlayerOnPlatform,
        null,
        this
        );

        this.physics.add.overlap(
        this.player,
        this.collectibles,
        this.handlePlayerCollectiblesOverlap,
        null,
        this
        );

        // *****************************************************************
        // CAMERA
        // *****************************************************************
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
        );
        this.cameras.main.setZoom(4);

        this.minimap = this.cameras.add(800, 10, 400, 100).setZoom(0.5).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 300;


        if (this.registry.get('level') === 'level3' || this.registry.get('level') === 'level4') {
        this.cameras.main.setZoom(2);
        this.player.jumpVelo = 400
        this.player.body.setGravityY(200)
        }

        // let music = this.sound.add('music')
        //     music.play({
        //         volume: 1,
        //         loop: true
        //     })
    }

    update(): void {
        this.player.update();
        this.minimap.scrollX = Phaser.Math.Clamp(this.player.x - 200, 200, 700);
    }

    private loadObjectsFromTilemap(): void {
        // get the object layer in the tilemap named 'objects'
        const objects = this.map.getObjectLayer('objects').objects as any[];

        
        objects.forEach((object) => {
        if ( String(object.name).includes('level')) {
            this.portals.add(
            new Portal({
                scene: this,
                x: object.x,
                y: object.y,
                height: object.width,
                width: object.height,
                spawn: {
                x: object.properties[1].value,
                y: object.properties[2].value,
                // x: object.x, y: object.y,
                dir: object.properties[0].value
                }
            }).setName(object.name)
            );
        }
        if (object.name === 'player') {
            this.player = new Mario({
            scene: this,
            x: this.registry.get('spawn').x,
            y: this.registry.get('spawn').y,
            // x: object.x, y: object.y,
            texture: 'characteridle'
            });
        }

        if (object.name === 'goomba') {
            this.enemies.add(
            new Goomba({
                scene: this,
                x: object.x,
                y: object.y,
                texture: 'testgoomba'
            })
            );
        }
        
        if (object.name === 'plant') {
            this.enemies.add(
            new Plant({
                scene: this,
                x: object.x,
                y: object.y,
                texture: 'plant'
            })
            );
        }
        
        if (object.name === 'boss') {
            this.enemies.add(
            new Boss({
                scene: this,
                x: object.x,
                y: object.y,
                texture: 'bossIdle'
            })
            );
        }

        if (object.name === 'brick') {
            this.bricks.add(
            new Brick({
                scene: this,
                x: object.x,
                y: object.y,
                texture: 'brick',
                value: 50
            })
            );
        }

        if (object.name === 'box') {
            this.boxes.add(
            new Box({
                scene: this,
                // content: object.properties.content,
                content: object.properties[0].value,
                x: object.x,
                y: object.y,
                texture: 'box'
            })
            );
        }

        if (object.name === 'collectible') {
            this.collectibles.add(
            new Collectible({
                scene: this,
                x: object.x,
                y: object.y,
                texture: object.properties[0].value,
                // texture: 'apple',
                points: 100
            })
            );
        }

        if (object.name === 'platformMovingUpAndDown') {
            this.platforms.add(
            new Platform({
                scene: this,
                x: object.x,
                y: object.y,
                texture: 'platform',
                tweenProps: {
                y: {
                    value: 50,
                    duration: 4500,
                    ease: 'Power0'
                }
                }
            })
            );
        }

        if (object.name === 'platformMovingLeftAndRight') {
            this.platforms.add(
            new Platform({
                scene: this,
                x: object.x,
                y: object.y,
                texture: 'platform',
                tweenProps: {
                x: {
                    value: object.x + 50,
                    duration: 1200,
                    ease: 'Power0'
                }
                }
            })
            );
        }
        });
    }

    /**
     * Player <-> Enemy Overlap
     * @param _player [Mario]
     * @param _enemy  [Enemy]
     */
    private handlePlayerEnemyOverlap(_player: Mario, _enemy: Enemy): void {
        if (_player.body.touching.down && _enemy.body.touching.up) {
        // player hit enemy on top
        _player.bounceUpAfterHitEnemyOnHead();
        _enemy.gotHitOnHead();
        // _enemy.addDeadTween()
        } else {
        // player got hit from the side or on the head
        if (_player.getVulnerable()) {
            _player.gotHit();
        }
        }
    }
    private handlePlayerBulletsEnemyOverlap(_saw: Saw, _enemy: Enemy): void {
        _saw.explode()
        _enemy.gotHitFromBulletOrMarioHasStar();
        // _enemy.addDeadTween()
        } 

    /**
     * Player <-> Box Collision
     * @param _player [Mario]
     * @param _box    [Box]
     */

    private playerHitBox(_player: Mario, _box: Box): void {
        if (_box.body.touching.down && _box.active) {
        // ok, mario has really hit a box on the downside
        _box.yoyoTheBoxUpAndDown();
        this.collectibles.add(_box.spawnBoxContent());
        switch (_box.getBoxContentString()) {
            // have a look what is inside the box! Christmas time!
            case 'coin': {
            _box.tweenBoxContent({ y: _box.y - 40, alpha: 0 }, 700, function () {
                _box.getContent().destroy();
            });

            _box.addCoinAndScore(1, 100);
            break;
            }
            case 'rotatingCoin': {
            _box.tweenBoxContent({ y: _box.y - 40, alpha: 0 }, 700, function () {
                _box.getContent().destroy();
            });

            _box.addCoinAndScore(1, 100);
            break;
            }
            case 'apple': {
            _box.getContent().anims.play('apple')
            _box.tweenBoxContent({ y: _box.y - 40, alpha: 0 }, 700, function () {
                _box.getContent().destroy();
            });

            _box.addCoinAndScore(1, 100);
            break;
            }
            case 'flower': {
            _box.tweenBoxContent({ y: _box.y - 8 }, 200, function () {
                _box.getContent().anims.play('flower');
            });

            break;
            }
            case 'mushroom': {
            _box.getContent().setDisplaySize(20, 20)
            _box.popUpCollectible();
            break;
            }
            case 'star': {
            _box.popUpCollectible();
            break;
            }
            default: {
            break;
            }
        }
        _box.startHitTimeline();
        }
    }

    private handlePlayerPortalOverlap(_player: Mario, _portal: Portal): void {
        if (
        (_player.getKeys().get('DOWN').isDown &&
            _portal.getPortalDestination().dir === 'down') ||
        (_player.getKeys().get('RIGHT').isDown &&
            _portal.getPortalDestination().dir === 'right')
        ) {
        // set new level and new destination for mario
        this.registry.set('level', _portal.name);
        this.registry.set('spawn', {
            x: _portal.getPortalDestination().x,
            y: _portal.getPortalDestination().y,
            // x: _portal.x, y: _portal.y,
            dir: _portal.getPortalDestination().dir
        });

        // restart the game scene
        this.sound.pauseAll()
        this.scene.restart();
        } else if (_portal.name === 'levelexit') {
        this.sound.pauseAll()
        this.scene.stop('GameScene');
        this.scene.stop('HUDScene');
        this.scene.start('MenuScene');
        }
    }

    private handlePlayerCollectiblesOverlap(
        _player: Mario,
        _collectible: Collectible
    ): void {
        switch (_collectible.texture.key) {
        case 'flower': {
            break;
        }
        case 'mushroom': {
            _player.growMario();
            break;
        }
        case 'star': {
            break;
        }
        default: {
            break;
        }
        }
        _collectible.collected();
    }

    // TODO!!!
    private handlePlayerOnPlatform(player: Mario, platform: Platform): void {
        if (
        platform.body.moves &&
        platform.body.touching.up &&
        player.body.touching.down
        ) {
        player.anims.play('characteridle', true)
        }else {

        }
    }
}
