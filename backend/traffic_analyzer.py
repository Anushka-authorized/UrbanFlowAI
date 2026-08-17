import os
import xml.etree.ElementTree as ET


# Project paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDGE_DATA_FILE = os.path.join(BASE_DIR, "simulation", "edge_data.xml")


def analyze_traffic():
    """
    Reads SUMO edge data and analyzes traffic conditions
    for every road/edge.
    """

    if not os.path.exists(EDGE_DATA_FILE):
        print("❌ edge_data.xml not found!")
        print(f"Expected location: {EDGE_DATA_FILE}")
        return []

    tree = ET.parse(EDGE_DATA_FILE)
    root = tree.getroot()

    results = []

    for interval in root.findall("interval"):

        for edge in interval.findall("edge"):

            edge_id = edge.get("id")

            speed = float(edge.get("speed", 0))
            density = float(edge.get("density", 0))
            waiting_time = float(edge.get("waitingTime", 0))
            entered = int(float(edge.get("entered", 0)))

            # Initial congestion classification
            if density >= 90:
                status = "CRITICAL"
            elif density >= 75:
                status = "HIGH"
            elif density >= 50:
                status = "MODERATE"
            else:
                status = "LOW"

            results.append({
                "edge": edge_id,
                "speed": round(speed, 2),
                "density": round(density, 2),
                "waiting_time": round(waiting_time, 2),
                "vehicles": entered,
                "status": status
            })

    return results


if __name__ == "__main__":

    traffic_data = analyze_traffic()

    print("\n========== URBANFLOW TRAFFIC ANALYSIS ==========\n")

    if not traffic_data:
        print("No traffic data found.")
    else:

        for road in traffic_data:

            print(
                f"Road: {road['edge']:>10} | "
                f"Vehicles: {road['vehicles']:>4} | "
                f"Speed: {road['speed']:>6} | "
                f"Density: {road['density']:>6} | "
                f"Status: {road['status']}"
            )

    print("\n================================================")