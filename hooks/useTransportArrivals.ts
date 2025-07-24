import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";

type Arrival = {
    id: string;
    scheduledArrival: string;
    scheduledDepart: string;
    estimatedArrival: string;
    estimatedDeparture: string;
    estimatedDepartureDuration: number;
    scheduleRelationship: string;
    tripHeadSign: string;
    tripBusHeadSign: string;
};

export const useTransportArrivals = (onestop_id:string) => {
    const [arrivals, setArrivals] = useState<Arrival[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // We define the async function inside useEffect to avoid it being recreated on every render.
        const fetchArrivalsData = async () => {
            setLoading(true);
            setError(null);
                console.log("Attempting to get arrivals for onestop:", onestop_id);
            const key = process.env.EXPO_PUBLIC_TRANSITLAND_KEY;


            const url = `https://transit.land/api/v2/rest/stops/${onestop_id}/departures?api_key=${key}&limit=15`;

            try {
                // For production: uncomment the fetch below
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `API request failed with status: ${response.status}`,
                    );
                }
                const data = await response.json();

                // For development: load local JSON instead of fetching from API
                // const data = require("~/kilbarrackDepartures.json");

                // console.log(JSON.stringify(data.stops,null,2))
                console.log(
                    "length of arrivals is",
                    data.stops[0].departures.length,
                );

                // Minor optimization: check for stops array before mapping
                if (data.stops && Array.isArray(data.stops)) {
                    // console.log("passed first boolean");

                    const formattedArrivals = data.stops[0].departures
                        .map((stop) => {
                            // console.log("returned an object");
                            const departureTimeStr =
                                stop.departure.estimated ||
                                stop.departure.scheduled;
                            // console.log("departtimestr", departureTimeStr);
                            const now = new Date();
                            const [hours, minutes, seconds] = departureTimeStr
                                .split(":")
                                .map(Number);
                            const departureTime = new Date(
                                now.getFullYear(),
                                now.getMonth(),
                                now.getDate(),
                                hours,
                                minutes,
                                seconds,
                            );
                            // If the departure time has already passed today, assume it's for tomorrow
                            if (departureTime < now) {
                                departureTime.setDate(
                                    departureTime.getDate() + 1,
                                );
                            }
                            const estimatedDepartureDuration = Math.round(
                                (departureTime - now) / 60000,
                            );

                            // console.warn(
                            //     "estimatedDepartureDuration",
                            //     estimatedDepartureDuration,
                            // );

                            if (stop.trip.schedule_relationship == "STATIC") {
                                // console.log(
                                //     "STATIC DEPARTURE, EJECTED FROM FORMATTED ARRIVALS",
                                // );
                                return null;
                            }

                            if (estimatedDepartureDuration > 80) return null;

                            return {
                                id: stop.trip.trip_id,
                                scheduledArrival: stop.arrival.scheduled,
                                scheduledDepart: stop.departure.scheduled,
                                estimatedArrival: stop.arrival.estimated,
                                estimatedDeparture: stop.departure.estimated,
                                estimatedDepartureDuration,
                                scheduleRelationship:
                                    stop.trip.schedule_relationship,
                                tripHeadSign: stop.trip.trip_headsign,
                                tripBusHeadSign: stop.trip.route.route_short_name
                            };
                        })
                        .filter(Boolean) // removes nulls
                        .sort(
                            (a, b) =>
                                a.estimatedDepartureDuration -
                                b.estimatedDepartureDuration,
                        );
                    setArrivals(formattedArrivals);
                    console.log(
                        `Successfully formatted ${formattedArrivals.length} arrivals.`,
                    );
                    // console.log(
                    //     "formatted stops",
                    //     JSON.stringify(formattedArrivals, null, 2),
                    // );
                } else {
                    setArrivals([]);
                    console.warn("No arrivals found in the API response.");
                }
            } catch (e) {
                console.error("Failed to fetch or process arrivals:", e);
                setError(
                    "Failed to load transport data. Please try again later.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchArrivalsData();
    }, [onestop_id]); // Empty dependency array ensures this runs only once.

    return { arrivals, loading, error };
};