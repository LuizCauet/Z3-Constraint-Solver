import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And, Or } = new Context("main");

// Fence boundaries
// Left: x=5, Right: x=10, Top: y=15, Bottom: y=25

const solver = new Solver();

// ─────────────────────────────────────────────────────────────
// 1. INSIDE the fence — place a cow
// ─────────────────────────────────────────────────────────────
{
    const x = Int.const('x');
    const y = Int.const('y');

    // Strictly inside: x > 5 && x < 10 && y > 15 && y < 25
    solver.add(And(
        x.gt(5), x.lt(10),
        y.gt(15), y.lt(25)
    ));

    if (await solver.check() === 'sat') {
        const model = solver.model();
        const xVal = parseInt(model.eval(x).toString());
        const yVal = parseInt(model.eval(y).toString());
        console.log(`Cow inside fence  → x=${xVal}, y=${yVal}`);
    } else {
        console.log('Inside: unsat');
    }
}

// ─────────────────────────────────────────────────────────────
// 2. ON the fence — place a decoration on the top or left side
// ─────────────────────────────────────────────────────────────
solver.reset();
{
    const x = Int.const('x');
    const y = Int.const('y');

    // Top side:  y = 15  AND  5 <= x <= 10
    const onTop  = And(y.eq(15), x.ge(5), x.le(10));
    // Left side: x = 5   AND  15 <= y <= 25
    const onLeft = And(x.eq(5),  y.ge(15), y.le(25));

    solver.add(Or(onTop, onLeft));

    if (await solver.check() === 'sat') {
        const model = solver.model();
        const xVal = parseInt(model.eval(x).toString());
        const yVal = parseInt(model.eval(y).toString());
        console.log(`Decoration on fence → x=${xVal}, y=${yVal}`);
    } else {
        console.log('On fence: unsat');
    }
}

// ─────────────────────────────────────────────────────────────
// 3. OUTSIDE the fence — place a tree, x>=8, y>=20
// ─────────────────────────────────────────────────────────────
solver.reset();
{
    const x = Int.const('x');
    const y = Int.const('y');

    // Outside = not in the bounding box of the fence (not on it, not inside)
    // Bounding box: 5 <= x <= 10 AND 15 <= y <= 25
    // Outside: x < 5 OR x > 10 OR y < 15 OR y > 25
    const outside = Or(
        x.lt(5),
        x.gt(10),
        y.lt(15),
        y.gt(25)
    );

    solver.add(And(
        outside,
        x.ge(8),
        y.ge(20)
    ));

    if (await solver.check() === 'sat') {
        const model = solver.model();
        const xVal = parseInt(model.eval(x).toString());
        const yVal = parseInt(model.eval(y).toString());
        console.log(`Tree outside fence  → x=${xVal}, y=${yVal}`);
    } else {
        console.log('Outside: unsat');
    }
}
