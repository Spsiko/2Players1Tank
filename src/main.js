import { Game } from './game.js';

const game = new Game('game');
window.game = game;
game.start();