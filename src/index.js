import 'core-js/shim';
import {Howl, Howler} from 'howler';
import Stats from 'stats.js';
import Boot from './states/Boot';
import Preload from './states/Preload';
import Main from './states/Main';
import Menu from './states/Menu';
import GameWait from './states/GameWait';
import GameEnd from './states/GameEnd';
import StarHolder from './states/StarHolder';


import './assets/css/index.css';
const Client = require('./server/Client').default;

const HUDManager = require('./plugins/HUDManager').default;

/**
 * Setup the root class for the whole game.
 */
class Game extends Phaser.Game {
  /**
   * Initialize the game before preloading assets.
   */
  constructor() {
    // Round the pixel ratio to the nearest whole number so everything scales correctly.
    const dpr = Math.round(window.devicePixelRatio);

    // Setup the game's stage.
    super({
      width: window.innerWidth * dpr,
      height: window.innerHeight * dpr,
      renderer: Phaser.WEBGL_MULTI,
      antialias: true,
      multiTexture: true,
      enableDebug: process.env.NODE_ENV === 'development',
    });

    const url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + "/";

    this.server = new Client(url);
    this.server.connect();

    // Setup the different game states.
    this.state.add('Boot', Boot, false);
    this.state.add('Preload', Preload, false);
    this.state.add('Menu', Menu, false);
    this.state.add('GameWait', GameWait, false);
    this.state.add('Main', Main, false);
    this.state.add('GameEnd', GameEnd, false);
    this.state.add('StarHolder', StarHolder, false);

    // Kick things off with the boot state.
    this.state.start('Boot');

    // Handle debug mode.
    if (process.env.NODE_ENV === 'development') {
      this.setupStats();
    }

    // Expose the game on the window if in dev/test.
    if (process.env.NODE_ENV !== 'production') {
      window.game = this;
    }
  }

  /**
   * Display the FPS and MS using Stats.js.
   */
  setupStats() {
    // Setup the new stats panel.
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.update;
    this.update = (...args) => {
      stats.begin();
      updateLoop.apply(this, args);
      stats.end();
    };
  }
}

new Game();
