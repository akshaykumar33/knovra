# Performance Review Prompt

Profile before optimizing.

Evaluate:

- repository scan speed
- parser throughput
- incremental index latency
- Neo4j traversal latency
- semantic query latency
- context planner latency
- context bundle token size
- agent event throughput
- memory usage
- cold-start behavior
- web graph rendering
- daemon CPU usage

Provide measurements and identify actual bottlenecks.

Do not recommend Rust/C++ rewrites without evidence.

Prioritize:

1. algorithmic improvements
2. incremental work
3. caching
4. batching
5. query/index optimization
6. concurrency
7. implementation-language changes only when justified
