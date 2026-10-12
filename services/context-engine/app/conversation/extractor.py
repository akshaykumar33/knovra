"""Fact and entity extraction engine for conversation transcripts."""

import re
import uuid
from typing import ClassVar

from app.conversation.models import (
    ConversationSession,
    ExtractedFact,
    FactType,
)


class ConversationExtractor:
    """Extracts entities, decisions, requirements, errors, solutions, and summaries from conversations."""

    ADR_PATTERN: ClassVar[re.Pattern] = re.compile(r"\b(ADR|adr)[-_]?(\d{1,4})\b", re.IGNORECASE)
    FILE_PATTERN: ClassVar[re.Pattern] = re.compile(
        r"(?:[\w\-./\\]+\.(?:py|go|rs|ts|js|json|yaml|yml|md|toml|sql|cypher|sh))\b"
    )

    DECISION_KEYWORDS: ClassVar[list[str]] = [
        "decided to",
        "we will use",
        "we chose",
        "decision:",
        "agreed to",
        "opted for",
        "supersedes",
        "superseded by",
        "adr-",
        "let's proceed with",
        "accepting",
    ]

    REQUIREMENT_KEYWORDS: ClassVar[list[str]] = [
        "must ",
        "shall ",
        "required to",
        "requirement:",
        "invariant #",
        "invariant:",
        "mandatory",
        "should always",
        "should never",
    ]

    ERROR_KEYWORDS: ClassVar[list[str]] = [
        "error:",
        "exception:",
        "traceback",
        "failed with",
        "exit code",
        "panic:",
        "fatal:",
        "cannot find",
        "permission denied",
        "syntaxerror",
        "typeerror",
    ]

    SOLUTION_KEYWORDS: ClassVar[list[str]] = [
        "fixed by",
        "resolved by",
        "solution:",
        "workaround:",
        "the fix is",
        "fixed in",
        "to resolve this",
        "solved by",
    ]

    def extract_facts(self, session: ConversationSession) -> list[ExtractedFact]:
        facts: list[ExtractedFact] = []

        all_mentioned_decisions: set[str] = set()
        all_mentioned_files: set[str] = set()

        for msg in session.messages:
            text = msg.content
            if not text.strip():
                continue

            # Extract decisions referenced
            adr_matches = self.ADR_PATTERN.findall(text)
            for _, num in adr_matches:
                normalized_adr = f"adr-{int(num):03d}"
                all_mentioned_decisions.add(normalized_adr)

            # Extract file mentions
            file_matches = self.FILE_PATTERN.findall(text)
            for fpath in file_matches:
                if "/" in fpath or "\\" in fpath:
                    all_mentioned_files.add(fpath.replace("\\", "/"))

            # Line-by-line inspection for semantic facts
            lines = text.splitlines()
            for line in lines:
                clean_line = line.strip()
                if len(clean_line) < 15:
                    continue

                lower_line = clean_line.lower()

                # Check Decision
                if any(kw in lower_line for kw in self.DECISION_KEYWORDS):
                    matched_adrs = [f"adr-{int(num):03d}" for _, num in self.ADR_PATTERN.findall(clean_line)]
                    facts.append(
                        ExtractedFact(
                            id=f"fact-dec-{uuid.uuid4().hex[:8]}",
                            session_id=session.id,
                            message_id=msg.id,
                            fact_type=FactType.DECISION,
                            text=clean_line,
                            confidence=0.88 if matched_adrs else 0.75,
                            related_decisions=matched_adrs,
                            metadata={"role": msg.role.value},
                        )
                    )

                # Check Requirement
                elif any(kw in lower_line for kw in self.REQUIREMENT_KEYWORDS):
                    facts.append(
                        ExtractedFact(
                            id=f"fact-req-{uuid.uuid4().hex[:8]}",
                            session_id=session.id,
                            message_id=msg.id,
                            fact_type=FactType.REQUIREMENT,
                            text=clean_line,
                            confidence=0.82,
                            metadata={"role": msg.role.value},
                        )
                    )

                # Check Error
                elif any(kw in lower_line for kw in self.ERROR_KEYWORDS):
                    facts.append(
                        ExtractedFact(
                            id=f"fact-err-{uuid.uuid4().hex[:8]}",
                            session_id=session.id,
                            message_id=msg.id,
                            fact_type=FactType.ERROR,
                            text=clean_line[:300],
                            confidence=0.90,
                            metadata={"role": msg.role.value},
                        )
                    )

                # Check Solution
                elif any(kw in lower_line for kw in self.SOLUTION_KEYWORDS):
                    facts.append(
                        ExtractedFact(
                            id=f"fact-sol-{uuid.uuid4().hex[:8]}",
                            session_id=session.id,
                            message_id=msg.id,
                            fact_type=FactType.SOLUTION,
                            text=clean_line,
                            confidence=0.85,
                            metadata={"role": msg.role.value},
                        )
                    )

        # Extract high-level entities
        if all_mentioned_files or all_mentioned_decisions:
            facts.append(
                ExtractedFact(
                    id=f"fact-ent-{uuid.uuid4().hex[:8]}",
                    session_id=session.id,
                    message_id=None,
                    fact_type=FactType.ENTITY,
                    text=f"Session references {len(all_mentioned_files)} files and {len(all_mentioned_decisions)} decisions",
                    confidence=0.95,
                    related_entities=sorted(all_mentioned_files),
                    related_decisions=sorted(all_mentioned_decisions),
                )
            )

        # Generate summary
        summary_text = self._synthesize_summary(session, facts)
        facts.append(
            ExtractedFact(
                id=f"fact-sum-{uuid.uuid4().hex[:8]}",
                session_id=session.id,
                message_id=None,
                fact_type=FactType.SUMMARY,
                text=summary_text,
                confidence=0.92,
                related_entities=sorted(all_mentioned_files)[:10],
                related_decisions=sorted(all_mentioned_decisions),
            )
        )

        return facts

    def _synthesize_summary(self, session: ConversationSession, facts: list[ExtractedFact]) -> str:
        decisions = [f.text for f in facts if f.fact_type == FactType.DECISION]
        errors = [f.text for f in facts if f.fact_type == FactType.ERROR]
        solutions = [f.text for f in facts if f.fact_type == FactType.SOLUTION]

        parts = [f"Session '{session.title}' contains {len(session.messages)} messages."]
        if decisions:
            parts.append(f"Decisions ({len(decisions)}): " + "; ".join(decisions[:2]))
        if errors:
            parts.append(f"Errors encountered ({len(errors)}): " + "; ".join(errors[:2]))
        if solutions:
            parts.append(f"Solutions applied ({len(solutions)}): " + "; ".join(solutions[:2]))

        return " | ".join(parts)
