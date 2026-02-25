import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And, Distinct } = new Context("main");

// Pet values as integer constants
const CAT  = 0;
const DOG  = 1;
const BIRD = 2;
const FISH = 3;
const petName = ['Cat', 'Dog', 'Bird', 'Fish'];

// One integer variable per child, value = which pet they own
const bob   = Int.const('bob');
const mary  = Int.const('mary');
const cathy = Int.const('cathy');
const sue   = Int.const('sue');

const solver = new Solver();

// Each child's variable must be a valid pet index (0–3)
for (const v of [bob, mary, cathy, sue]) {
    solver.add(And(v.ge(CAT), v.le(FISH)));
}
// Each child owns a different pet
solver.add(Distinct(bob, mary, cathy, sue));

// The boy (Bob) has a dog
solver.add(bob.eq(DOG));

//  Sue has a pet with 2 legs → bird
solver.add(sue.eq(BIRD));

// Mary does NOT have a fish
solver.add(mary.neq(FISH));

// Solve
if (await solver.check() === 'sat') {
    const model = solver.model();
    const get = v => parseInt(model.eval(v).toString());

    console.log('Solution found:');
    console.log(`  Bob: ${petName[get(bob)]}`);
    console.log(`  Mary: ${petName[get(mary)]}`);
    console.log(`  Cathy: ${petName[get(cathy)]}`);
    console.log(`  Sue: ${petName[get(sue)]}`);
} else {
    console.log('unsat — no solution exists.');
}

