# Knovra Debugging Prompt

Investigate the reported failure without making speculative edits first.

Trace the problem across:

- caller
- API boundary
- service boundary
- events
- storage
- graph
- cache
- background workers
- agent adapter
- context engine
- configuration

Find the root cause rather than patching the visible symptom.

For every candidate cause, provide evidence from code, logs, tests, contracts or data flow.

Then:

1. implement the smallest root-cause fix
2. add a regression test
3. verify dependent behavior
4. run relevant test suites
5. document whether stored/indexed data requires migration or re-indexing

Do not weaken validation or remove failing tests to make the issue disappear.
