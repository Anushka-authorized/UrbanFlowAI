import os

print("SUMO_HOME:", os.environ.get("SUMO_HOME"))

if os.environ.get("SUMO_HOME"):
    print("SUMO environment detected successfully!")
else:
    print("SUMO_HOME is not set.")