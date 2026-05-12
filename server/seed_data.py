"""Seed the database with units, levels, questions, and achievements from seed data files.

Usage:
    python -m server.seed_data                    # seed if empty
    python -m server.seed_data --force            # re-seed (clears existing)
"""

import sys

from server.database import SessionLocal, engine, Base
from server.models.unit import Unit, Level
from server.models.question import Question
from server.models.achievement import Achievement
from server.seed.units_and_levels import UNITS, LEVELS, ACHIEVEMENTS
from server.seed.questions import QUESTIONS


def seed(force=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(Unit).count()
        if existing > 0:
            if not force:
                print(f"Database already has {existing} units. Use --force to re-seed. Skipping.")
                return
            print("Force re-seed: clearing existing data...")
            for model in [Achievement, Question, Level, Unit]:
                db.query(model).delete()
            db.commit()

        for u in UNITS:
            db.add(Unit(**u))
        db.flush()

        for lv in LEVELS:
            db.add(Level(**lv))
        db.flush()

        for q in QUESTIONS:
            db.add(Question(**q))
        db.flush()

        for a in ACHIEVEMENTS:
            db.add(Achievement(**a))
        db.flush()

        db.commit()
        print(f"Seeded: {len(UNITS)} units, {len(LEVELS)} levels, {len(QUESTIONS)} questions, {len(ACHIEVEMENTS)} achievements")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    force = "--force" in sys.argv
    seed(force)
