# Evaluation Methodology & Algorithmic Specification

## AI Response Validation & Quality Intelligence Platform

This document describes the mathematical and logical formulations governing the 5 judge agents, RAG semantic retrieval, and verdict calculations.

---

### 1. Relevance Judge Agent (`RelevanceJudge`)

The Relevance Judge assesses whether the generated response directly answers the user prompt without evasion or tangential drift.

#### Mathematical Formulations:
1. **Semantic Vector Alignment ($S_{\text{semantic}}$):**
   $$\text{CosSim}(\vec{q}, \vec{r}) = \frac{\vec{q} \cdot \vec{r}}{\|\vec{q}\| \|\vec{r}\|}$$
   Scaled to calibrate QA sentence structures:
   $$S_{\text{semantic}} = \min(1.0, \text{CosSim}(\vec{q}, \vec{r}) \times 1.55)$$

2. **Stemmed Keyword Coverage ($C_{\text{tokens}}$):**
   $$C_{\text{tokens}} = \frac{|\text{StemmedTokens}(q) \cap \text{StemmedTokens}(r)|}{|\text{StemmedTokens}(q)|}$$

3. **Opening Sentence Directness ($D_{\text{opening}}$):**
   Measures the semantic proximity between the prompt and the first sentence of the response:
   $$D_{\text{opening}} = \min(1.0, \text{CosSim}(\vec{q}, \vec{r}_{\text{first}}) \times 1.5)$$

4. **Composite Relevance Score ($R$):**
   $$R = \min(100, \max(0, \text{round}((0.45 \times S_{\text{semantic}} + 0.35 \times C_{\text{tokens}} + 0.20 \times D_{\text{opening}}) \times 100)))$$

#### Categorization:
- **Fully Relevant:** $R \ge 88$
- **Mostly Relevant:** $72 \le R < 88$
- **Partially Relevant:** $50 \le R < 72$
- **Irrelevant:** $30 \le R < 50$
- **Off-topic:** $R < 30$

---

### 2. Accuracy Judge Agent (`AccuracyJudge`)

The Accuracy Judge compares every sentence against authoritative ground-truth knowledge (user reference answers and retrieved RAG context chunks).

#### Claim Classification:
- **Correct:** Proposition is factually corroborated by the reference or RAG context ($\text{Sim} \ge 0.40$ with polarity agreement).
- **Partially Correct:** Proposition aligns with the broad thematic context but lacks precise numeric or quantitative validation ($0.25 \le \text{Sim} < 0.40$).
- **Incorrect:** Proposition deviates from facts established in the knowledge chunks.
- **Contradiction:** Proposition flips negation or directly negates facts established in the reference ($\text{Sim} > 0.35$ with opposing polarity).

#### Accuracy Scoring Formula:
$$\text{RawPoints} = (N_{\text{correct}} \times 100) + (N_{\text{partial}} \times 65) + (N_{\text{incorrect}} \times 20) - (N_{\text{contradiction}} \times 45)$$
$$\text{Accuracy Score} = \min(100, \max(0, \text{round}(\frac{\text{RawPoints}}{N_{\text{total}}})))$$

---

### 3. Hallucination Detection Agent (`HallucinationAgent`)

The Hallucination Detection Agent decomposes the AI response into atomic factual claims, determines whether each is supported or fabricated, and maps character start and end indices for visual highlighting.

#### Claim Support Status:
1. `Supported`: Authenticated by reference text or RAG evidence.
2. `Unsupported`: Extrapolated beyond available source material or contains ungrounded attributions.
3. `Contradicted`: Directly conflicts with verified facts.

#### Severity Weighting:
| Severity | Penalty Points | Description |
|---|---|---|
| **Low** | 5 | Minor unsubstantiated descriptive nuance |
| **Medium** | 10 | Unverified statistics or attributions without external grounding |
| **High** | 20 | Substantial fabricated assertions unsupported by source facts |
| **Critical** | 35 - 40 | Direct factual contradiction against benchmark ground truth |

#### Hallucination Safety Score:
$$\text{Safety Score} = \max(0, 100 - \sum \text{Penalties})$$

---

### 4. Completeness Judge Agent (`CompletenessJudge`)

The Completeness Judge decomposes the prompt into required sub-questions, procedures, and explicit constraints (e.g., definitional core, causal explanation, comparison, actionable mechanisms).

#### Aspect Tracking:
- **✓ Addressed:** Comprehensive coverage within the response body.
- **⚠ Partially Addressed:** Cursory mention without thorough explanation.
- **✕ Missing:** Completely omitted from the response.

#### Completeness Score Formula:
$$\text{Completeness Score} = \text{round}\left(\frac{(N_{\text{addressed}} \times 100) + (N_{\text{partial}} \times 50)}{N_{\text{total requirements}}}\right)$$

---

### 5. Verdict Agent (`VerdictAgent`) & Critical Overrides

#### Weighted Composite Calculation:
$$\text{Overall Score} = (R \times w_{\text{rel}}) + (A \times w_{\text{acc}}) + (H \times w_{\text{hal}}) + (C \times w_{\text{cmp}})$$
*Default Weights:* $w_{\text{rel}} = 0.20$, $w_{\text{acc}} = 0.35$, $w_{\text{hal}} = 0.25$, $w_{\text{cmp}} = 0.20$.

#### Standard Verdict Thresholds:
- **PASS:** $\text{Overall Score} \ge 80$
- **NEEDS IMPROVEMENT:** $60 \le \text{Overall Score} < 80$
- **FAIL:** $\text{Overall Score} < 60$

#### Critical Verdict Overrides:
To guarantee safety in production deployment, critical errors override numerical averages:
1. If $N_{\text{critical hallucinations}} \ge 2$, verdict is forced to **FAIL**, and the score is capped below 58.
2. If $N_{\text{critical hallucinations}} = 1$ or direct contradictions $\ge 2$, verdict is forced to **NEEDS IMPROVEMENT**, and score is capped at 65.
