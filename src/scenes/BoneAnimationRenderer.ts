import { Scene } from 'phaser';
import bones from './anim_2d.json';

export class BoneRenderer {
    scene: Scene;
    graphics!: Phaser.GameObjects.Graphics;
    container: Phaser.GameObjects.Container;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    init() {

        // this.graphics = this.scene.add.graphics();
        // this.graphics.setDepth(1000000);

        const firstFrameBones = bones.frames[1].bones;
        // this.graphics.fillStyle(0xffff00);
        // this.graphics.lineStyle(5, 0xFF00FF, 1.0);

        // this.graphics.beginPath();

        // Object.values(firstFrameBones).forEach(bone => {

        //     if (bone.parent) {
        //         // @ts-ignore
        //         const parent = firstFrameBones[bone.parent];
        //         this.graphics.moveTo(parent.x * 100, -parent.y * 100 + 500);

        //         this.graphics.lineTo(bone.x * 100, -bone.y * 100 + 500);
        //     }

        // });

        // this.graphics.strokePath();

        const sprites = [];
        Object.values(firstFrameBones).forEach(bone => {
            // let circle = new Phaser.Geom.Circle(bone.x * 100, -bone.y * 100, 5); // x, y, radius
            // this.graphics.fillCircleShape(circle);

            const s = this.scene.add.sprite(bone.x * 100, -bone.y * 100, "logo");
            s.setScale(0.2);
            s.setRotation(bone.angle);
            s.setOrigin(0.5, 1);

            sprites.push(s);
        });

        this.container = this.scene.add.container(200, 500, sprites);
        this.container.setScale(-1, 1);
    }
}