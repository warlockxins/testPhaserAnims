import { Scene } from "phaser";
import sebastianAnims from "./sebastian.json"; // point of interest 1
import butcherAnims from "./butcher.json";
import {
  AnimationDirection,
  AnimationConfig,
  AnimationAvaliableDirections,
} from "./AnimationDirection";
import { PlayableCharacterController } from "./playerAnimations";

import VisibilityPolygon from "./shadows/visibility_polygon_dev";
import { BoneRenderer } from "./BoneAnimationRenderer";

let game;
let gameOptions = {
  // number of boxes in the game
  boxes: 1,

  // size of each box
  sizeRange: {
    // min size, in pixels
    min: 50,

    // max size, in pixels
    max: 120,
  },
};

const spriteSheetName = "spriteSheet";

// point of interest 3
type typeOfImportedSebastianAnimation = typeof sebastianAnims;
type SebastianAvailableAnimsFromConfig = keyof typeOfImportedSebastianAnimation;
type SebastianDirectionalAnim =
  `sebastian-${SebastianAvailableAnimsFromConfig}-${AnimationDirection}`;

// point of interest 4
function createAnimations(
  scene: Scene,
  characterName: string,
  animConfig: AnimationConfig,
  spriteSheetName: string,
) {
  // walk, run, idle, death, walkCrouch, armActionTake
  const baseAnimationKeys = Object.keys(animConfig);

  const animationNames = [];

  AnimationAvaliableDirections.forEach((direction) => {
    baseAnimationKeys.forEach((baseAnimation) => {
      const frames = animConfig[baseAnimation][direction].map((f) => ({
        key: spriteSheetName,
        frame: f,
      }));

      const animationNameWithDirection = `${characterName}-${baseAnimation}-${direction}`;

      scene.anims.create({
        key: animationNameWithDirection,
        frames: frames,
        frameRate: 10, //frames.length,
        repeat: -1,
      });

      animationNames.push(animationNameWithDirection);
    });
  });
}

export class Game extends Scene {
  characterName = "sebastian";
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  facing: { vertical: "N" | "S" | ""; horizontal: "E" | "" } = {
    vertical: "",
    horizontal: "",
  };
  baseAnim: SebastianAvailableAnimsFromConfig;
  isCrouching: boolean;
  fx: Phaser.FX.Wipe;

  controller: PlayableCharacterController;
  container: Phaser.GameObjects.Container;
  currentHealth: number;
  maxWidth: number;
  bar: Phaser.GameObjects.Graphics;
  box: Phaser.GameObjects.Graphics;
  lightGraphics: Phaser.GameObjects.Graphics;
  lightLines: Phaser.GameObjects.Graphics;
  triangleGraphics: Phaser.GameObjects.Graphics;
  mesh: Phaser.GameObjects.Mesh;
  wallGraphics: Phaser.GameObjects.Graphics;
  polygons: any;

  boneRenderer: BoneRenderer;

  constructor() {
    super("Game");

    game = this;

    this.boneRenderer = new BoneRenderer(this);
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("logo", "logo.png");
    this.load.image("background", "meatBasementTopMap.png");

    this.load.atlas(spriteSheetName, "spriteSheet.png", "spriteSheet.json");

    this.load.atlas(
      "butcherSpriteSheet",
      "butcherSpriteSheet.png",
      "butcherSpriteSheet.json",
    );
    // debugger
  }

  create() {
    this.add.image(500, 0, "background").setTint(0xaaaaaa);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.player = this.physics.add.sprite(440, 300);
    // this.player.setSize(60, 160);
    this.player.setScale(0.9);
    // this.player.setOrigin(0.5, 1);

    this.fx = this.player.preFX.addWipe(0.01, 1, 1);
    // this.fx.progress = 0.5;

    this.player.setCollideWorldBounds(true);

    this.controller = new PlayableCharacterController(
      this.player,
      this.cursors,
    );

    this.facing = {
      vertical: "S",
      horizontal: "",
    };

    this.baseAnim = "walk";

    createAnimations(this, this.characterName, sebastianAnims, spriteSheetName);

    createAnimations(this, "butcher", butcherAnims, "butcherSpriteSheet");

    const anim: SebastianDirectionalAnim = "sebastian-walk-S";
    this.player.play(anim);

    // Extra visuals
    const label = this.add.text(300, 500, "Funky shadows", {
      fontSize: "36px",
      fill: "#fff",
    });
    // this.box = this.add.graphics();
    // box.fillStyle(0xff0000, 0.5);
    // box.fillRect(-32, -40, 64, 16);

    // Group visuals with a container that follows the sprite
    // this.container = this.add.container(this.player.x, this.player.y, [this.box, label]);

    // this.currentHealth = 100;
    // this.maxWidth = 150;

    this.createShadowScene();
    // this.drawTriangleWithGradient();

    this.boneRenderer.init();
  }

  update(_time, delta: number) {
    this.boneRenderer.update(delta);
  }

  /// SHADOW stuff

  drawTriangleWithGradient() {
    const graphics = this.add.graphics();
    graphics.setBlendMode(Phaser.BlendModes.MULTIPLY);
    // Set four colors for the gradient corners (used for shapes like rects)
    // For a triangle, it typically interpolates between these vertex colors
    graphics.fillGradientStyle(0xffffff, 0x444444, 0xffffff, 0xff0000, 1);

    // Draw the triangle using coordinates (x1, y1, x2, y2, x3, y3)
    graphics.fillTriangle(200, 200, 400, 450, 500, 300);
  }

  createShadowScene() {
    // graphic object used to draw walls
    this.wallGraphics = this.add.graphics();
    this.wallGraphics.lineStyle(1, 0x00ff00);

    // graphic object used to draw rays of light
    const g: Phaser.GameObjects.Graphics = this.add.graphics();
    this.lightGraphics = g;
    // g.setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.lightLines = this.add.graphics();

    this.triangleGraphics = this.add.graphics();

    // array with all polygons in game
    this.polygons = [];

    // add random boxes
    // for (let i = 0; i < gameOptions.boxes; i++) {
    this.addRandomBox(250, 250);
    this.addRandomBox(450, 350);
    this.addRombus(150, 400);
    this.addRombus(250, 450);
    this.addRombus(250, 600);

    for (let xBar = 0; xBar < 10; xBar++) {
      this.addRandomBox(315 + 22 * xBar, 600, 10, 5);
    }

    // listener for input movement
    // this.input.on("pointermove", this.renderLight, this);

    // this.createMesh(450, 450);
  }

  // Mesh stuff
  createMesh(startX: number, startY: number) {
    var width = 150;
    var height = 70;
    this.mesh = this.add.mesh(startX, startY - height / 2);

    // Colors per vertex: 0xFF0000 (Red), 0x00FF00 (Green), 0x0000FF (Blue)
    const colors = [0xff0000, 0x00ff00, 0x0000ff];

    // Alpha per vertex (optional)
    const alphas = [1, 0.6, 1];

    const vertices = [0, height, width, height, 0, 0, width, 0];

    const uvs = [0, 1, 1, 1, 0, 0, 1, 0];

    const indices = [0, 2, 1, 2, 3, 1];

    this.mesh.addVertices(
      vertices,
      uvs,
      indices,
      false,
      undefined,
      colors,
      alphas,
    );
    // Note: Otherwise the added points will be "behind" the camera! This value will project vertex `x` & `y` values 1:1 to pixel values.
    this.mesh.hideCCW = false;
    this.mesh.setOrtho(this.mesh.width, this.mesh.height);
    // this.mesh.setOrtho(1, 70);
  }

  addRandomBox(startX: number, startY: number, width = 150, height = 70) {
    // var width = 150;
    // var height = 70;
    // draw the box
    this.wallGraphics.strokeRect(startX, startY, width, height);

    // insert box vertices into polygons array
    this.polygons.push([
      [startX, startY],
      [startX + width, startY],
      [startX + width, startY + height],
      [startX, startY + height],
      [startX, startY],
    ]);
  }

  addRombus(startX: number, startY: number) {
    var width = 150;
    var height = 70;
    // draw the box
    // this.wallGraphics.strokeRect(startX, startY, width, height);

    const lines = [
      [startX, startY - height / 2],
      [startX + width / 2, startY],
      [startX, startY + height / 2],
      [startX - width / 2, startY],
      [startX, startY - height / 2],
    ];
    // insert box vertices into polygons array
    this.polygons.push([
      ...lines,
      // [startX, startY + 10]
    ]);

    for (let i = 0; i < lines.length - 1; i++) {
      this.wallGraphics.moveTo(lines[i][0], lines[i][1]);
      this.wallGraphics.lineTo(lines[i + 1][0], lines[i + 1][1]);
    }

    this.wallGraphics.strokePath();
  }

  // method to render the light
  renderLight(pointer: Phaser.Input.Pointer) {
    this.player.setPosition(pointer.x, pointer.y);

    // determine light polygon starting from pointer coordinates
    let { transparencies, quad } = this.createLightPolygon(
      pointer.x,
      pointer.y,
    );

    // console.log(transparencies);

    // clear and prepare lightGraphics graphic object

    // this.drawLightPolies(visibility);
    // this.drawLightLines(polygon);
    this.drawLightTriangles(quad, transparencies);
  }

  drawLightLines(visibility: [number, number][][]) {
    this.lightLines.clear();
    if (!visibility?.length) {
      return;
    }

    this.lightLines.lineStyle(5, 0xff00, 1.0);
    for (let i = 0; i < visibility.length; i++) {
      const one = visibility[i];
      // console.log('--->', one[0]);
      this.lightLines.moveTo(visibility[i][0][0], visibility[i][0][1]);
      // draw a line to i-th light polygon vertex
      this.lightLines.lineTo(visibility[i][1][0], visibility[i][1][1]);
    }
    this.lightLines.strokePath(); // Render the line
  }

  drawLightTriangles(visibility: [number, number][], transparencies: number[]) {
    this.triangleGraphics.clear();
    this.triangleGraphics.setBlendMode(Phaser.BlendModes.MULTIPLY);

    if (!visibility?.length) {
      return;
    }
    // console.log(' ====>', visibility);

    for (let i = 0; i < visibility.length - 4; i += 4) {
      const one = {
        x: visibility[i][0],
        y: visibility[i][1],
      };
      // debugger
      const two = {
        x: visibility[i + 1][0],
        y: visibility[i + 1][1],
      };

      const three = {
        x: visibility[i + 2][0],
        y: visibility[i + 2][1],
      };

      const four = {
        x: visibility[i + 3][0],
        y: visibility[i + 3][1],
      };

      const c1 = transparencies[i];
      const c2 = transparencies[i + 1];
      const c3 = transparencies[i + 2];
      const c4 = transparencies[i + 3];

      const color1 = new Phaser.Display.Color(c1, c1, c1).color;
      const color2 = new Phaser.Display.Color(c2, c2, c2).color;
      const color3 = new Phaser.Display.Color(c3, c3, c3).color;
      const color4 = new Phaser.Display.Color(c4, c4, c4).color;

      // debugger
      // Draw the triangle using coordinates (x1, y1, x2, y2, x3, y3)
      // this.triangleGraphics.fillGradientStyle(0xff0000, 0x00ff00, 0x0000ff, 0x000000, 1);
      this.triangleGraphics.fillGradientStyle(color3, color2, color1, 0, 1);

      this.triangleGraphics.fillTriangle(
        three.x,
        three.y,
        two.x,
        two.y,
        one.x,
        one.y,
      );

      this.triangleGraphics.fillGradientStyle(color1, color3, color4, 0, 1);

      this.triangleGraphics.fillTriangle(
        one.x,
        one.y,
        three.x,
        three.y,
        four.x,
        four.y,
      );
    }
  }

  drawLightPolies(visibility: any[]) {
    this.lightGraphics.clear();
    if (!visibility?.length) {
      return;
    }

    // this.lightGraphics.
    // this.lightGraphics.lineStyle(2, 0xff8800);
    this.lightGraphics.fillStyle(0xffff00);

    // begin a drawing path
    this.lightGraphics.beginPath();

    // move the graphic pen to first vertex of light polygon
    this.lightGraphics.moveTo(visibility[0][0], visibility[0][1]);

    // loop through all light polygon vertices
    for (let i = 1; i <= visibility.length; i++) {
      // draw a line to i-th light polygon vertex
      this.lightGraphics.lineTo(
        visibility[i % visibility.length][0],
        visibility[i % visibility.length][1],
      );
    }

    // close, stroke and fill light polygon
    this.lightGraphics.closePath();
    this.lightGraphics.fillPath();
    // this.lightGraphics.strokePath();
  }

  // method to create light polygon using visibility_polygon.js
  createLightPolygon(x, y) {
    let segments = VisibilityPolygon.convertToSegments(this.polygons);
    segments = VisibilityPolygon.breakIntersections(segments);
    // console.log('segments', segments);
    let position = [x, y];
    // if (VisibilityPolygon.inPolygon(position, this.polygons[this.polygons.length - 1])) {
    return VisibilityPolygon.computeInverse(position, segments);
    // }
    // return null;
  }
}
