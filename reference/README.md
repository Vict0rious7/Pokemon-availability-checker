# Reference results (Phase 0)

The old Streamlit engine (commit 4f93c6a) frozen on 19 profiles. `SUMMARY.md` is the page to review.

To regenerate, check out the old engine next to the repo and run the harness:

    git worktree add ../ac-old 4f93c6a
    python3 harness.py --engine-dir ../ac-old           # rewrites results/ and SUMMARY.md
    python3 harness.py --engine-dir ../ac-old --check   # compares only

`old-csv/`: the old CSVs with data fix D1, the input the rebuild uses for its comparison (see engine/README.md).
