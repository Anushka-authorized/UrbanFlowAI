import os
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIMULATION_DIR = os.path.join(BASE_DIR, "simulation")


def read_tripinfo(filename):
    path = os.path.join(SIMULATION_DIR, filename)

    tree = ET.parse(path)
    root = tree.getroot()

    total_time = 0
    total_waiting = 0
    total_loss = 0
    vehicles = 0

    for trip in root.findall("tripinfo"):
        total_time += float(trip.get("duration", 0))
        total_waiting += float(trip.get("waitingTime", 0))
        total_loss += float(trip.get("timeLoss", 0))
        vehicles += 1

    if vehicles == 0:
        return None

    return {
        "vehicles": vehicles,
        "avg_travel_time": total_time / vehicles,
        "avg_waiting_time": total_waiting / vehicles,
        "avg_time_loss": total_loss / vehicles
    }


before = read_tripinfo("bottleneck_results.xml")
after = read_tripinfo("optimized_results.xml")

print("\n========== URBANFLOW RESULTS ==========\n")

print(f"{'Metric':<25} {'BEFORE':>12} {'AFTER':>12}")

print("-" * 52)

print(
    f"{'Vehicles':<25}"
    f"{before['vehicles']:>12}"
    f"{after['vehicles']:>12}"
)

print(
    f"{'Avg Travel Time (sec)':<25}"
    f"{before['avg_travel_time']:>12.2f}"
    f"{after['avg_travel_time']:>12.2f}"
)

print(
    f"{'Avg Waiting Time (sec)':<25}"
    f"{before['avg_waiting_time']:>12.2f}"
    f"{after['avg_waiting_time']:>12.2f}"
)

print(
    f"{'Avg Time Loss (sec)':<25}"
    f"{before['avg_time_loss']:>12.2f}"
    f"{after['avg_time_loss']:>12.2f}"
)

print("\n========================================")