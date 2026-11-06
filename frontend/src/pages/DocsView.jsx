import React, { useState } from 'react'
import {
  FileText,
  BookOpen,
  HelpCircle,
  CircleDot,
  Filter,
  Eye,
  GitMerge,
  ArrowDownToLine,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

export default function DocsView() {
  const [activeSection, setActiveSection] = useState('hierarchy')

  const sections = [
    { id: 'hierarchy', title: '1. Theoretical Hierarchy & Overview' },
    { id: 'll1', title: '2. Top-Down LL(1) Parsing' },
    { id: 'lr0', title: '3. Bottom-Up LR(0) Parsing' },
    { id: 'slr1', title: '4. SLR(1) Parsing & FOLLOW Sets' },
    { id: 'clr1', title: '5. Canonical LR(1) (CLR) Parsing' },
    { id: 'lalr1', title: '6. LALR(1) Parsing & State Merging' },
    { id: 'viva', title: '7. Viva & Compiler Design Q&A' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Complete Parsing Algorithm Documentation & Theoretical Guide
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mathematical definitions, algorithm pseudocode, complexity characteristics, and viva explanations.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === s.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Content Body */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {activeSection === 'hierarchy' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Grammar Class Hierarchy & Parsing Power
            </h2>
            <p>
              In compiler theory, deterministic parsing techniques are strictly classified by their lookahead and context capabilities. The power relation for bottom-up LR parsers is strictly monotonic:
            </p>
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 font-mono text-center text-sm font-bold text-indigo-900 dark:text-indigo-200">
              LR(0) &sub; SLR(1) &sub; LALR(1) &sub; CLR(1)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Bottom-Up Family</h4>
                <ul className="space-y-1 list-disc pl-4 text-xs">
                  <li><strong>LR(0):</strong> No lookahead. Reduces on all terminals unconditionally.</li>
                  <li><strong>SLR(1):</strong> Reuses LR(0) automaton; reduces only on FOLLOW(A).</li>
                  <li><strong>CLR(1):</strong> Full LR(1) items with context-specific lookaheads. Maximum power.</li>
                  <li><strong>LALR(1):</strong> Merges CLR(1) states with identical LR(0) cores. Compact state count.</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Top-Down vs Bottom-Up</h4>
                <ul className="space-y-1 list-disc pl-4 text-xs">
                  <li><strong>LL(1):</strong> Scans Left-to-right, leftmost derivation, 1 lookahead. Cannot handle left recursion directly.</li>
                  <li><strong>Every LL(1) grammar is LR(1):</strong> Any language parseable by LL(1) is parseable by LR(1), but LR(1) is strictly more powerful.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'll1' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Top-Down LL(1) Predictive Parsing
            </h2>
            <p>
              An LL(1) parser uses a table M[A, a] indexed by a non-terminal A on top of the stack and the lookahead terminal a on the input stream.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <p className="font-bold">Table Construction Algorithm:</p>
              <p>For each production A &rarr; &alpha;:</p>
              <p className="pl-4">1. For each terminal a in FIRST(&alpha;), add A &rarr; &alpha; to M[A, a].</p>
              <p className="pl-4">2. If &epsilon; in FIRST(&alpha;), for each terminal b in FOLLOW(A), add A &rarr; &alpha; to M[A, b].</p>
              <p className="pl-4">3. If &epsilon; in FIRST(&alpha;) and $ in FOLLOW(A), add A &rarr; &alpha; to M[A, $].</p>
            </div>
            <p>
              <strong>LL(1) Condition:</strong> A grammar is LL(1) if and only if no cell in M contains more than one production. This requires that for all productions A &rarr; &alpha; | &beta;:
            </p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>FIRST(&alpha;) &cap; FIRST(&beta;) = &empty; (No FIRST/FIRST conflict).</li>
              <li>If &alpha; derives &epsilon;, then FIRST(&beta;) &cap; FOLLOW(A) = &empty; (No FIRST/FOLLOW conflict).</li>
            </ul>
          </div>
        )}

        {activeSection === 'lr0' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              LR(0) Automaton & Shift-Reduce Foundations
            </h2>
            <p>
              LR(0) items represent the progress of recognizing a production: A &rarr; &alpha; &middot; &beta;. The dot (&middot;) separates symbols already shifted/reduced on the stack from symbols yet to be seen.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <p className="font-bold">LR(0) CLOSURE Algorithm:</p>
              <p>CLOSURE(I):</p>
              <p className="pl-4">Repeat: For each item A &rarr; &alpha; &middot; B &beta; in I and each production B &rarr; &gamma;: add B &rarr; &middot; &gamma; to I.</p>
              <p className="font-bold mt-2">GOTO Algorithm:</p>
              <p>GOTO(I, X) = CLOSURE({'{'} A &rarr; &alpha; X &middot; &beta; | A &rarr; &alpha; &middot; X &beta; in I {'}'}).</p>
            </div>
            <p>
              <strong>Limitations:</strong> In LR(0), whenever a state contains a completed item A &rarr; &alpha; &middot;, the parser places a reduce action across <em>all</em> terminals. If the state also has a shift transition on any terminal, a Shift/Reduce conflict occurs.
            </p>
          </div>
        )}

        {activeSection === 'slr1' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              SLR(1): Simple LR with 1 Lookahead
            </h2>
            <p>
              SLR(1) constructs the exact same LR(0) automaton (same states and transitions), but uses the <strong>FOLLOW</strong> set to constrain reduction placement:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <p className="font-bold">SLR(1) Reduction Rule:</p>
              <p>If A &rarr; &alpha; &middot; is in state I_i (A &ne; S'):</p>
              <p className="pl-4">Place ACTION[i, a] = reduce A &rarr; &alpha; ONLY for terminals a &isin; FOLLOW(A).</p>
            </div>
            <p>
              <strong>Why SLR(1) Fails:</strong> FOLLOW(A) is a global set over the whole grammar, not specific to the state path. In the classic grammar (Dragon Book Ex 4.48):
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs">
              S &rarr; L = R | R<br />
              L &rarr; * R | id<br />
              R &rarr; L
            </div>
            <p className="text-xs">
              FOLLOW(R) contains '=' because S &rarr; L = R and R &rarr; L. In the state containing R &rarr; L &middot; and L &rarr; &middot; = R, SLR(1) places a reduce on '=', conflicting with shift '='.
            </p>
          </div>
        )}

        {activeSection === 'clr1' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Canonical LR(1) (CLR)
            </h2>
            <p>
              CLR(1) augments items with an explicit lookahead terminal: <strong>[A &rarr; &alpha; &middot; &beta;, a]</strong>. The lookahead specifies that reduction by A &rarr; &alpha; is valid only when the next input symbol is a.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <p className="font-bold">LR(1) CLOSURE Rule:</p>
              <p>For each item [A &rarr; &alpha; &middot; B &beta;, a] in I:</p>
              <p className="pl-4">For each production B &rarr; &gamma;:</p>
              <p className="pl-8">For each terminal b in FIRST(&beta; a):</p>
              <p className="pl-12">add [B &rarr; &middot; &gamma;, b] to I.</p>
            </div>
            <p>
              CLR(1) completely eliminates the SLR(1) conflict on S &rarr; L = R | R because the item in that state is [R &rarr; L &middot;, $], which restricts reduction exclusively to '$', not '='!
            </p>
          </div>
        )}

        {activeSection === 'lalr1' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              LALR(1): Look-Ahead LR Parsing
            </h2>
            <p>
              While CLR(1) is powerful, its state count can be large. LALR(1) identifies all CLR(1) states that share the identical <strong>LR(0) core</strong> (the set of production and dot positions, ignoring lookaheads) and merges them into a single state, taking the union of their lookahead sets.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <p className="font-bold">LALR(1) Construction Properties:</p>
              <p>1. State count of LALR(1) is always identical to LR(0).</p>
              <p>2. Merging cores cannot introduce Shift/Reduce conflicts (proven by Aho & Ullman).</p>
              <p>3. Merging cores CAN introduce Reduce/Reduce conflicts!</p>
            </div>
            <p>
              <strong>Dragon Book Example 4.55:</strong> The grammar S &rarr; a A d | b B d | a B e | b A e, A &rarr; c, B &rarr; c is CLR(1) compatible, but merging the states for A &rarr; c &middot; and B &rarr; c &middot; unites the lookaheads {'{'}d, e{'}'}, causing a Reduce/Reduce conflict in LALR(1).
            </p>
          </div>
        )}

        {activeSection === 'viva' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Viva Voce & Compiler Design Interview Preparation
            </h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Q1: Why is an augmented grammar S' &rarr; S necessary in bottom-up parsing?
                </span>
                <p className="text-xs">
                  To provide a unique, unambiguous accepting condition. When the parser reduces by S' &rarr; S on end-marker $, it guarantees that the entire sentence has been successfully parsed without any trailing unreduced input.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Q2: Can LALR(1) state merging introduce Shift/Reduce conflicts?
                </span>
                <p className="text-xs">
                  No. A shift action depends only on the symbol following the dot (part of the LR(0) core). Since merged states have identical cores, shift actions remain identical. Only reduce actions (governed by lookaheads) can clash, possibly causing Reduce/Reduce conflicts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Q3: Why can't LL(1) parsers handle left-recursive grammars?
                </span>
                <p className="text-xs">
                  In A &rarr; A &alpha;, FIRST(A) recursively contains FIRST(A), leading to infinite predictive expansion without consuming any input token.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
