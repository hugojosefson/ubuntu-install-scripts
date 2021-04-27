import { CxGraph, Node } from "https://deno.land/x/cxgraph@v1.2/mod.ts";

const g = new CxGraph();

class DateClass {
  constructor(public date: Date = new Date("2017-07-14 11:45:00")) {}
}

const node = new Node<DateClass>("A", new DateClass());

g.addNode(node);

console.log(g.getNodeData<DateClass>("A").date);
