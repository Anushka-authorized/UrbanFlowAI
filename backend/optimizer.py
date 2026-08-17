import os
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM_DIR = os.path.join(BASE_DIR, "simulation")

ROUTE_FILE = os.path.join(SIM_DIR, "optimized.rou.xml")


def create_optimized_routes(redirected_vehicles=300):
    """
    Create an optimized route file by redistributing
    traffic from the main corridor to the alternative corridor.
    """

    source_file = os.path.join(SIM_DIR, "bottleneck.rou.xml")

    if not os.path.exists(source_file):
        raise FileNotFoundError(
            f"Route file not found: {source_file}"
        )

    tree = ET.parse(source_file)
    root = tree.getroot()

    main_flow = root.find(".//flow[@id='main_traffic']")
    alternative_flow = root.find(
        ".//flow[@id='alternative_traffic']"
    )

    if main_flow is None:
        raise ValueError(
            "main_traffic flow not found in bottleneck.rou.xml"
        )

    if alternative_flow is None:
        raise ValueError(
            "alternative_traffic flow not found in bottleneck.rou.xml"
        )

    main_rate = float(
        main_flow.get("vehsPerHour", "0")
    )

    alternative_rate = float(
        alternative_flow.get("vehsPerHour", "0")
    )

    redirected_vehicles = min(
        redirected_vehicles,
        main_rate
    )

    new_main_rate = main_rate - redirected_vehicles
    new_alternative_rate = (
        alternative_rate + redirected_vehicles
    )

    main_flow.set(
        "vehsPerHour",
        str(int(new_main_rate))
    )

    alternative_flow.set(
        "vehsPerHour",
        str(int(new_alternative_rate))
    )

    tree.write(
        ROUTE_FILE,
        encoding="UTF-8",
        xml_declaration=True
    )

    print("\n========== URBANFLOW OPTIMIZER ==========")

    print(
        f"Main route:        "
        f"{int(main_rate)} → {int(new_main_rate)} vehicles/hour"
    )

    print(
        f"Alternative route: "
        f"{int(alternative_rate)} → {int(new_alternative_rate)} vehicles/hour"
    )

    print(
        f"Redirected:        "
        f"{int(redirected_vehicles)} vehicles/hour"
    )

    print(
        f"\nOptimized route file created:"
        f"\n{ROUTE_FILE}"
    )

    return {
        "main_before": main_rate,
        "main_after": new_main_rate,
        "alternative_before": alternative_rate,
        "alternative_after": new_alternative_rate,
        "redirected": redirected_vehicles,
    }


if __name__ == "__main__":
    create_optimized_routes(300)