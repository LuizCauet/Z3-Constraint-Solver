import './style.css';
import Phaser from 'phaser';
import { init } from 'z3-solver';
import { Load } from './src/Scenes/Load.js';
import { PathfinderScene } from './src/Scenes/Pathfinder.js';

// ─── Phaser ───────────────────────────────────────────────────────────────────
// Start the Phaser game immediately (no need to wait for Z3).
const phaserConfig = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true,   // keep pixel art crisp
    },
    width: 1280,
    height: 800,
    scene: [Load, PathfinderScene],
};

const game = new Phaser.Game(phaserConfig);

// ─── Z3 ───────────────────────────────────────────────────────────────────────
// Z3 initialisation is async; update the panel when it completes.
const z3Out = document.querySelector('#z3-output');

try {
    const { Context } = await init();
    const { Solver, Int, And, Or, Distinct } = new Context('main');

    const solver = new Solver();
    const x = Int.const('x');
    const y = Int.const('y');

    // Simple example: find integers x, y such that:
    //   9 <= x <= 10
    //   y = x * 2
    solver.add(And(x.ge(9), x.le(10)));
    solver.add(y.eq(x.mul(Int.val(2))));
    solver.add(Distinct(x, y));

    const status = await solver.check();   // 'sat' | 'unsat' | 'unknown'
    let output = `Status : ${status}\n`;

    if (status === 'sat') {
        const model = solver.model();
        const xVal = model.eval(x);
        const yVal = model.eval(y);
        output += `x      : ${xVal}\n`;
        output += `y      : ${yVal}\n`;
        output += `\nConstraints solved:\n`;
        output += `  9 ≤ x ≤ 10\n`;
        output += `  y = x × 2\n`;
        output += `  x ≠ y`;
    }

    z3Out.textContent = output;
    console.log('[Z3]', output);
} catch (err) {
    z3Out.textContent = `Z3 error: ${err.message}`;
    console.error('[Z3]', err);
}
