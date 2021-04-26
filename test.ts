import { PQueue } from "./src/deps.ts";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const queue = new PQueue({
  concurrency: 1,
});

(async function taskOne() {
  await delay(200);

  console.log(`8. Pending promises: ${queue.pending}`); // => '8. Pending promises: 0'
  (async () => {
    await queue.add(async () => "🐙");
    console.log("11. Resolved");
  })();

  console.log("9. Added 🐙");

  console.log(`10. Pending promises: ${queue.pending}`);
  // => '10. Pending promises: 1'

  await queue.onIdle();
  console.log("12. All work is done");
})();

(async function taskTwo() {
  await queue.add(async () => "🦄");
  console.log("5. Resolved");
})();

console.log("1. Added 🦄");
(async () => {
  await queue.add(async () => "🐴");
  console.log("6. Resolved");
})();

console.log("2. Added 🐴");
(async () => {
  await queue.onEmpty();
  console.log("7. Queue is empty");
})();

console.log(`3. Queue size: ${queue.size}`);
// => '3. Queue size: 1`

console.log(`4. Pending promises: ${queue.pending}`);
// => '4. Pending promises: 1'
