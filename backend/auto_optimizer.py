import os
import subprocess
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM_DIR = os.path.join(BASE_DIR, "simulation")


# ---------------------------------------------------------
# Read SUMO tripinfo results
# ---------------------------------------------------------

def read_tripinfo(file_path):

    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)

    tree = ET.parse(file_path)
    root = tree.getroot()

    trips = root.findall("tripinfo")

    if not trips:
        raise RuntimeError(
            f"No completed trips found in {file_path}"
        )

    total_duration = 0
    total_waiting = 0
    total_loss = 0

    for trip in trips:

        total_duration += float(
            trip.get("duration", 0)
        )

        total_waiting += float(
            trip.get("waitingTime", 0)
        )

        total_loss += float(
            trip.get("timeLoss", 0)
        )

    count = len(trips)

    return {
        "vehicles": count,
        "avg_travel_time": total_duration / count,
        "avg_waiting_time": total_waiting / count,
        "avg_time_loss": total_loss / count,
    }


# ---------------------------------------------------------
# Create route file for a particular redistribution
# ---------------------------------------------------------

def create_route_file(redistribution_percent):

    source_file = os.path.join(
        SIM_DIR,
        "bottleneck.rou.xml"
    )

    output_file = os.path.join(
        SIM_DIR,
        f"test_{redistribution_percent}.rou.xml"
    )

    tree = ET.parse(source_file)
    root = tree.getroot()

    main_flow = root.find(
        ".//flow[@id='main_traffic']"
    )

    alternative_flow = root.find(
        ".//flow[@id='alternative_traffic']"
    )

    if main_flow is None or alternative_flow is None:
        raise RuntimeError(
            "Traffic flows not found."
        )

    main_rate = float(
        main_flow.get("vehsPerHour", 0)
    )

    alternative_rate = float(
        alternative_flow.get("vehsPerHour", 0)
    )

    redirected = main_rate * (
        redistribution_percent / 100
    )

    new_main = main_rate - redirected
    new_alternative = alternative_rate + redirected

    main_flow.set(
        "vehsPerHour",
        str(int(new_main))
    )

    alternative_flow.set(
        "vehsPerHour",
        str(int(new_alternative))
    )

    tree.write(
        output_file,
        encoding="UTF-8",
        xml_declaration=True
    )

    return output_file


# ---------------------------------------------------------
# Run SUMO
# ---------------------------------------------------------

def run_sumo(route_file, result_file):

    config_file = os.path.join(
        SIM_DIR,
        "bottleneck.sumocfg"
    )

    result_path = os.path.join(
        SIM_DIR,
        result_file
    )

    # SUMO config expects route file name.
    # Create a temporary config referencing our test route.

    temp_config = os.path.join(
        SIM_DIR,
        "auto_test.sumocfg"
    )

    with open(config_file, "r", encoding="utf-8") as f:
        config = f.read()

    config = config.replace(
        "bottleneck.rou.xml",
        os.path.basename(route_file)
    )

    config = config.replace(
        "bottleneck_tripinfo.xml",
        result_file
    )

    config = config.replace(
        "bottleneck_results.xml",
        result_file
    )

    with open(
        temp_config,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(config)

    command = [
        "sumo",
        "-c",
        temp_config
    ]

    print(
        f"Running SUMO → {os.path.basename(route_file)}"
    )

    process = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if process.returncode != 0:

        print(process.stdout)
        print(process.stderr)

        raise RuntimeError(
            "SUMO simulation failed."
        )

    return result_path


# ---------------------------------------------------------
# Calculate optimization score
# ---------------------------------------------------------

def calculate_score(result):

    # Lower is better.
    #
    # Travel time is given the highest weight.
    # Waiting time and time loss are also considered.

    score = (
        result["avg_travel_time"] * 0.5
        +
        result["avg_waiting_time"] * 0.2
        +
        result["avg_time_loss"] * 0.3
    )

    return score


# ---------------------------------------------------------
# Automatic optimization
# ---------------------------------------------------------

def find_best_strategy():

    strategies = [
        5,
        10,
        15,
        20,
        25
    ]

    results = []

    print()
    print("========================================")
    print("      URBANFLOW AUTO OPTIMIZER")
    print("========================================")
    print()

    for percentage in strategies:

        print(
            f"\nTesting redistribution: {percentage}%"
        )

        route_file = create_route_file(
            percentage
        )

        result_file = (
            f"auto_result_{percentage}.xml"
        )

        run_sumo(
            route_file,
            result_file
        )

        result_path = os.path.join(
            SIM_DIR,
            result_file
        )

        metrics = read_tripinfo(
            result_path
        )

        score = calculate_score(
            metrics
        )

        metrics["redistribution_percent"] = (
            percentage
        )

        metrics["score"] = score

        results.append(metrics)

        print(
            f"Travel Time : "
            f"{metrics['avg_travel_time']:.2f} sec"
        )

        print(
            f"Waiting Time : "
            f"{metrics['avg_waiting_time']:.2f} sec"
        )

        print(
            f"Time Loss    : "
            f"{metrics['avg_time_loss']:.2f} sec"
        )

        print(
            f"Score        : "
            f"{score:.2f}"
        )

    best = min(
        results,
        key=lambda x: x["score"]
    )

    print()
    print("========================================")
    print("           BEST STRATEGY")
    print("========================================")

    print(
        f"Redistribution : "
        f"{best['redistribution_percent']}%"
    )

    print(
        f"Travel Time    : "
        f"{best['avg_travel_time']:.2f} sec"
    )

    print(
        f"Waiting Time   : "
        f"{best['avg_waiting_time']:.2f} sec"
    )

    print(
        f"Time Loss      : "
        f"{best['avg_time_loss']:.2f} sec"
    )

    print(
        f"Score          : "
        f"{best['score']:.2f}"
    )

    print("========================================")

    return {
    "best": best,
    "all_results": results,
}

# ---------------------------------------------------------
# Run directly
# ---------------------------------------------------------

if __name__ == "__main__":

    best_strategy = find_best_strategy()

    print()
    print("UrbanFlow optimization completed.")