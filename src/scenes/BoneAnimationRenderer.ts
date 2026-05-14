import { Scene } from "phaser";
import bones from "./anim_2d.json";

interface Bone {
  x: number;
  y: number;
  angle: number;
  angleDegree: number;
  parent: string | null;
}

interface FrameSpeed {
  xSpeed: number;
  ySpeed: number;
  angleSpeed: number;
  bone: Bone;
}

interface FrameBones {
  toTime: number;
  frameSpeeds: FrameSpeed[];
}

export class BoneRenderer {
  scene: Scene;
  graphics!: Phaser.GameObjects.Graphics;
  container!: Phaser.GameObjects.Container;
  sprites: Phaser.GameObjects.Sprite[] = [];

  currentFrame = 0;

  tempStepper = 0;
  speeds: FrameBones[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  init() {
    // this.graphics = this.scene.add.graphics();
    // this.graphics.setDepth(1000000);

    // bones.frames.forEach((frame) => {
    //   console.log("->", frame.frame);
    // });
    for (let index = 0; index < bones.frames.length - 1; index++) {
      const b1 = bones.frames[index];
      const b2 = bones.frames[index + 1];

      if (b2) {
        const frame1 = b1.frame;
        const frame2 = b2.frame;

        const diffFrameTime = ((frame2 - frame1) / 24) * 1000;

        // console.log("....", diffFrameTime);

        const b1Bones = Object.values(b1.bones);
        const b2Bones = Object.values(b2.bones);

        const frameSpeeds: FrameSpeed[] = [];

        // console.log("for dir", b1Bones, b2Bones);
        b1Bones.forEach((bone, bIndex) => {
          const nextFrameBone = b2Bones[bIndex];

          const xSpeed = ((nextFrameBone.x - bone.x) * 100) / diffFrameTime;
          const ySpeed = ((nextFrameBone.y - bone.y) * 100) / diffFrameTime;

          const nextAngle =
            nextFrameBone.angleDegree < 0
              ? 360 + nextFrameBone.angleDegree
              : nextFrameBone.angleDegree;
          const curAngle =
            bone.angleDegree < 0 ? 360 + bone.angleDegree : bone.angleDegree;

          const angleSpeed = (nextAngle - curAngle) / diffFrameTime;

          frameSpeeds.push({
            xSpeed,
            ySpeed,
            angleSpeed,
            // toTime: frame2,
            bone: {
              x: bone.x * 100,
              y: bone.y * 100,
              angle: bone.angle,
              angleDegree: curAngle,
              parent: bone.parent,
            },
          });
        });

        this.speeds.push({
          frameSpeeds,
          toTime: (frame2 / 24) * 1000,
        });
      }
    }
    this.currentFrame = 0;
    const firstFrameBones = bones.frames[0].bones;

    Object.values(firstFrameBones).forEach((bone) => {
      const s = this.scene.add.sprite(bone.x * 100, -bone.y * 100, "logo");
      s.setScale(0.2);
      s.setRotation(bone.angle);
      s.setOrigin(0.5, 1);

      this.sprites.push(s);
    });

    this.container = this.scene.add.container(200, 500, this.sprites);
    this.container.setScale(-1, 1);

    console.log(this.speeds);
  }

  update(deltaIn: number) {
    const delta = deltaIn / 10;
    this.tempStepper += delta;
    let currentSpeeds = this.speeds[this.currentFrame];

    // snap to next frame
    if (this.tempStepper > currentSpeeds.toTime) {
      this.currentFrame += 1;

      if (this.currentFrame >= this.speeds.length) {
        this.currentFrame = 0;
        this.tempStepper = 0;
      }
      currentSpeeds = this.speeds[this.currentFrame];

      currentSpeeds.frameSpeeds.forEach((speeds, index) => {
        const s = this.sprites[index];
        s.setPosition(speeds.bone.x, -speeds.bone.y);
        s.setAngle(speeds.bone.angleDegree);
      });
      return;
    }

    // move all bones towards next frame
    currentSpeeds.frameSpeeds.forEach((speeds, index) => {
      const s = this.sprites[index];
      s.setPosition(s.x + speeds.xSpeed * delta, s.y - speeds.ySpeed * delta);
      s.setAngle(s.angle + speeds.angleSpeed * delta);
    });
  }
}
