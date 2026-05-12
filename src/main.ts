import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: 640,
    height: 960,
    parent: 'game-container',
    backgroundColor: '343a40',
    scale: {
        // mode: Scale.FIT,
        mode: Scale.MAX_ZOOM,
        autoCenter: Scale.CENTER_BOTH,
        // width: 640,
        // height: 480
    },
    physics: {
        default: 'arcade',

        arcade: {
            // debug: true
        },
    },
    scene: [
        MainGame
    ]
};

export default new Game(config);
