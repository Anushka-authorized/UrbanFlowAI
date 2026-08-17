import os
import subprocess
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM_DIR = os.path.join(BASE_DIR, "simulation")


def run_sumo(config_file, result_file):
    config_path = os.path.join(SIM_DIR, config_file)
    result_path = os.path.join(SIM_DIR, result_file)

    if os.path.exists(result_path):
        os.remove(result_path)

    command = [
        "sumo",
        "-c",
        config_path,
        "--tripinfo-output",
        result_path,
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    return result_path


def read_tripinfo(result_file):
    path = os.path.join(SIM_DIR, result_file)

    tree = ET.parse(path)
    root = tree.getroot()

    vehicles = root.findall("tripinfo")

    if not vehicles:
        raise RuntimeError(f"No completed trips found in {result_file}")

    total_duration = 0
    total_waiting = 0
    total_loss = 0

    for vehicle in vehicles:
        total_duration += float(vehicle.get("duration", 0))
        total_waiting += float(vehicle.get("waitingTime", 0))
        total_loss += float(vehicle.get("timeLoss", 0))

    count = len(vehicles)

    return {
        "vehicles": count,
        "avg_travel_time": round(total_duration / count, 2),
        "avg_waiting_time": round(total_waiting / count, 2),
        "avg_time_loss": round(total_loss / count, 2),
    }


def run_full_simulation():
    # BEFORE
    run_sumo(
        "bottleneck.sumocfg",
        "api_before.xml"
    )

    before = read_tripinfo("api_before.xml")

    # Create optimized routes
    from optimizer import create_optimized_routes

    create_optimized_routes()

    # AFTER
    run_sumo(
        "optimized.sumocfg",
        "api_after.xml"
    )

    after = read_tripinfo("api_after.xml")

    return {
        "before": before,
        "after": after,
        "redirected_vehicles_per_hour": 180,
    }