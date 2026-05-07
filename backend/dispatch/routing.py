import requests

import polyline


ORS_API_KEY = (
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjRjZDk0MzRmZDgzZDRmYmI4YzEyYzliOThkNmFiMGU0IiwiaCI6Im11cm11cjY0In0="
)


def get_route(

    start_lat,
    start_lng,

    end_lat,
    end_lng
):

    url = (
        "https://api.openrouteservice.org/"
        "v2/directions/driving-car"
    )

    headers = {

        "Authorization": ORS_API_KEY,

        "Content-Type": "application/json",
    }

    body = {

        "coordinates": [

            [start_lng, start_lat],

            [end_lng, end_lat],
        ],

        # IMPORTANT
        "instructions": False,

        "geometry": True,

        "geometry_simplify": False,
    }

    try:

        response = requests.post(

            url,

            json=body,

            headers=headers
        )

        print(
            "ORS STATUS:",
            response.status_code
        )

        data = response.json()

        print(data)

        encoded = data[
            "routes"
        ][0]["geometry"]

        decoded = polyline.decode(
            encoded
        )

        print(
            f"✅ Route points: "
            f"{len(decoded)}"
        )

        return decoded

    except Exception as e:

        print(
            "❌ Route error:",
            e
        )

        return []