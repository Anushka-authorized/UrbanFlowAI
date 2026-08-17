import json
import os
import xml.etree.ElementTree as ET


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NETWORK_FILE = os.path.join(
    BASE_DIR,
    "simulation",
    "network.net.xml"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "frontend",
    "public"
)

OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "network.geojson"
)


# Approximate center for Nagpur
CENTER_LAT = 21.1458
CENTER_LON = 79.0882

# Controls how large the SUMO network appears on the map
SCALE = 0.00035


def convert_point(x, y, min_x, min_y):
    """
    Convert SUMO x/y coordinates into approximate
    latitude/longitude coordinates for visualization.
    """

    lon = CENTER_LON + (x - min_x) * SCALE
    lat = CENTER_LAT + (y - min_y) * SCALE

    return [lon, lat]


def main():

    if not os.path.exists(NETWORK_FILE):
        raise FileNotFoundError(
            f"Network file not found:\n{NETWORK_FILE}"
        )

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )

    tree = ET.parse(NETWORK_FILE)
    root = tree.getroot()

    edges = root.findall(".//edge")

    # -----------------------------------------
    # Collect all coordinates first
    # -----------------------------------------

    all_points = []

    for edge in edges:

        if edge.get("function") == "internal":
            continue

        lanes = edge.findall("lane")

        if not lanes:
            continue

        lane = lanes[0]

        shape = lane.get("shape")

        if not shape:
            continue

        for point in shape.split():

            x, y = map(
                float,
                point.split(",")
            )

            all_points.append((x, y))

    if not all_points:
        raise RuntimeError(
            "No road shapes found in network.net.xml"
        )

    min_x = min(
        point[0]
        for point in all_points
    )

    min_y = min(
        point[1]
        for point in all_points
    )

    # -----------------------------------------
    # Build GeoJSON
    # -----------------------------------------

    features = []

    for edge in edges:

        if edge.get("function") == "internal":
            continue

        edge_id = edge.get("id")

        lanes = edge.findall("lane")

        if not lanes:
            continue

        lane = lanes[0]

        shape = lane.get("shape")

        if not shape:
            continue

        coordinates = []

        for point in shape.split():

            x, y = map(
                float,
                point.split(",")
            )

            coordinates.append(
                convert_point(
                    x,
                    y,
                    min_x,
                    min_y
                )
            )

        if len(coordinates) < 2:
            continue

        features.append({

            "type": "Feature",

            "properties": {
                "id": edge_id,
                "from": edge.get("from"),
                "to": edge.get("to"),
            },

            "geometry": {
                "type": "LineString",
                "coordinates": coordinates,
            },

        })

    geojson = {

        "type": "FeatureCollection",

        "features": features,

    }

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            geojson,
            file,
            indent=2
        )

    print()
    print("========================================")
    print("      URBANFLOW NETWORK EXPORT")
    print("========================================")
    print()
    print(
        f"Roads exported: {len(features)}"
    )
    print()
    print(
        f"Created:\n{OUTPUT_FILE}"
    )
    print()


if __name__ == "__main__":
    main()