"""Generate both Word deliverables.

Run from the repository root:   python docs/_build/make_docs.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import phase2_a
import phase2_b
import phase2_c
import phase2_d
import prd
from docxkit import new_doc, save


def build_phase2():
    doc = new_doc(
        'TripME — Phase 2 Submission',
        'Team DEBUGGERS · Release 0.1.1',
        'Written backwards from a built, deployed product · tripme-khaki.vercel.app',
    )
    for module in (phase2_a, phase2_b, phase2_c, phase2_d):
        module.build(doc)
    save(doc, 'docs/TripME_Phase2_Submission.docx')


if __name__ == '__main__':
    build_phase2()
    prd.build()
