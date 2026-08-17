from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from simulation_runner import run_full_simulation
from auto_optimizer import find_best_strategy


app = FastAPI(
    title="UrbanFlow API",
    description="Smart Traffic Balancing and Simulation Platform",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "UrbanFlow API is running 🚦"
    }


# =========================================================
# OPTIMIZE TRAFFIC
# =========================================================

@app.post("/api/optimize")
def optimize():

    try:

        # -------------------------------------------------
        # STEP 1: Existing BEFORE / AFTER simulation
        # -------------------------------------------------

        simulation_results = run_full_simulation()


        # -------------------------------------------------
        # STEP 2: Automatic optimization
        # -------------------------------------------------

        optimization = find_best_strategy()

        best_strategy = optimization["best"]
        all_results = optimization["all_results"]


        # -------------------------------------------------
        # STEP 3: Calculate redirected vehicles
        # -------------------------------------------------

        redistribution_percent = (
            best_strategy["redistribution_percent"]
        )

        main_traffic = 1800

        redirected_vehicles = int(
            main_traffic
            * redistribution_percent
            / 100
        )


        # -------------------------------------------------
        # STEP 4: Return results to frontend
        # -------------------------------------------------

        return {

            "status": "success",

            "message": "Traffic optimization completed",

            # ---------------------------------------------
            # Traffic redistribution
            # ---------------------------------------------

            "redirected_vehicles_per_hour":
                redirected_vehicles,

            # ---------------------------------------------
            # Existing BEFORE / AFTER results
            # ---------------------------------------------

            "before":
                simulation_results["before"],

            "after":
                simulation_results["after"],

            # ---------------------------------------------
            # BEST strategy
            # ---------------------------------------------

            "best_strategy": {

                "redistribution_percent":
                    redistribution_percent,

                "travel_time":
                    best_strategy["avg_travel_time"],

                "waiting_time":
                    best_strategy["avg_waiting_time"],

                "time_loss":
                    best_strategy["avg_time_loss"],

                "score":
                    best_strategy["score"],
            },

            # ---------------------------------------------
            # ALL strategies
            # ---------------------------------------------

            "optimization_results":
                all_results,
        }


    except Exception as e:

        return {

            "status": "error",

            "message": str(e),

        }