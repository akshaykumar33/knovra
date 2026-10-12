"""Knovra Context Engine - Decision & Rule Storage and Evaluation Layer.

Implements non-destructive supersession tracking (Invariant #3),
provenance retention (Invariant #2), and project rule evaluation.
"""

import fnmatch
import logging
from datetime import UTC, datetime

from app.decision.models import (
    Decision,
    DecisionLineageResponse,
    DecisionStatus,
    Rule,
    RuleCategory,
    RuleCheckResponse,
    RuleCheckViolation,
    RuleSeverity,
)
from app.security.redactor import redact_secrets

logger = logging.getLogger("knovra.decision-store")


class DecisionRuleStore:
    """Manages architectural decisions, supersession lineage, and project rules."""

    def __init__(self) -> None:
        self._decisions: dict[str, Decision] = {}
        self._rules: dict[str, Rule] = {}

    def record_decision(self, decision: Decision) -> Decision:
        """Stores a decision, handling supersession pointer resolution if applicable."""
        now = datetime.now(UTC).isoformat()
        decision.updated_at = now

        # If this new decision supersedes an older decision
        if decision.supersedes and decision.supersedes in self._decisions:
            older = self._decisions[decision.supersedes]
            older.status = DecisionStatus.SUPERSEDED
            older.superseded_by = decision.id
            older.updated_at = now
            logger.info("Decision %s is now SUPERSEDED by %s", older.id, decision.id)

        self._decisions[decision.id] = decision
        return decision

    def supersede_decision(self, old_id: str, new_decision: Decision) -> Decision:
        """Explicitly supersedes an old decision with a new decision."""
        if old_id not in self._decisions:
            raise KeyError(f"Decision {old_id} not found to supersede")

        new_decision.supersedes = old_id
        return self.record_decision(new_decision)

    def get_decision(self, decision_id: str) -> Decision | None:
        return self._decisions.get(decision_id)

    def get_lineage(self, decision_id: str) -> DecisionLineageResponse | None:
        """Traces the complete supersession chain backwards and forwards."""
        current = self.get_decision(decision_id)
        if not current:
            return None

        # Trace ancestors (older decisions that this one superseded)
        ancestors: list[Decision] = []
        curr_anc_id = current.supersedes
        visited: set[str] = {current.id}

        while curr_anc_id and curr_anc_id not in visited:
            anc = self.get_decision(curr_anc_id)
            if not anc:
                break
            ancestors.append(anc)
            visited.add(anc.id)
            curr_anc_id = anc.supersedes

        # Trace descendants (newer decisions that superseded this one)
        descendants: list[Decision] = []
        curr_desc_id = current.superseded_by

        while curr_desc_id and curr_desc_id not in visited:
            desc = self.get_decision(curr_desc_id)
            if not desc:
                break
            descendants.append(desc)
            visited.add(desc.id)
            curr_desc_id = desc.superseded_by

        # Identify active version (latest descendant if exists, otherwise current)
        active_version = descendants[-1] if descendants else current

        return DecisionLineageResponse(
            decision=current,
            ancestors=ancestors,
            descendants=descendants,
            active_version=active_version,
        )

    def list_decisions(
        self,
        status: DecisionStatus | None = None,
        active_only: bool = False,
        affected_entity: str | None = None,
    ) -> list[Decision]:
        results: list[Decision] = []
        for dec in self._decisions.values():
            if active_only and dec.status != DecisionStatus.ACCEPTED:
                continue
            if status and dec.status != status:
                continue
            if affected_entity:
                matches = any(affected_entity in ent for ent in dec.affected_entities)
                if not matches:
                    continue
            results.append(dec)

        # Sort descending by created_at
        results.sort(key=lambda d: d.created_at, reverse=True)
        return results

    # Rule Management
    def record_rule(self, rule: Rule) -> Rule:
        self._rules[rule.id] = rule
        return rule

    def get_rule(self, rule_id: str) -> Rule | None:
        return self._rules.get(rule_id)

    def list_rules(
        self,
        category: RuleCategory | None = None,
        severity: RuleSeverity | None = None,
        scope: str | None = None,
    ) -> list[Rule]:
        results: list[Rule] = []
        for r in self._rules.values():
            if category and r.category != category:
                continue
            if severity and r.severity != severity:
                continue
            if scope and not fnmatch.fnmatch(scope, r.scope):
                continue
            results.append(r)
        return results

    def evaluate_rules(
        self,
        file_paths: list[str],
        contents: dict[str, str] | None = None,
    ) -> RuleCheckResponse:
        """Evaluates files and contents against active project rules."""
        violations: list[RuleCheckViolation] = []
        contents = contents or {}

        for rule in self._rules.values():
            for path in file_paths:
                # Check scope match
                if rule.scope != "*" and not fnmatch.fnmatch(path, rule.scope):
                    continue

                # 1. Security Check: unredacted secrets in content
                if rule.category == RuleCategory.SECURITY and path in contents:
                    _, redacted_count = redact_secrets(contents[path])
                    if redacted_count > 0:
                        violations.append(
                            RuleCheckViolation(
                                rule_id=rule.id,
                                rule_title=rule.title,
                                severity=rule.severity,
                                file_path=path,
                                message=f"Detected {redacted_count} unredacted secret(s) violating '{rule.title}'",
                            )
                        )

                # 2. Architecture Boundary Check: forbidden imports
                if rule.category == RuleCategory.ARCHITECTURE and path in contents:
                    text = contents[path]
                    # Rust indexer shouldn't import Python or web modules directly
                    if "services/code-indexer" in path and ("import ( \"knovra/runtime" in text or "fastapi" in text):
                        violations.append(
                            RuleCheckViolation(
                                rule_id=rule.id,
                                rule_title=rule.title,
                                severity=rule.severity,
                                file_path=path,
                                message=f"Cross-boundary dependency violation in '{path}' violating '{rule.title}'",
                            )
                        )

        return RuleCheckResponse(
            total_rules_evaluated=len(self._rules),
            violations=violations,
            passed=len(violations) == 0,
        )
