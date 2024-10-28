export const getPeriodChartAddedAmenities = async () => {
    try {
        const response = await fetch('/api/period-chart-added-amenities', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error(error);
        }
    }
    catch (error) {
        console.error(error);
    }
}

export const getTopChartAddedAmenities = async () => {
    try {
        const response = await fetch('/api/top-chart-added-amenities', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error(error);
        }
    }
    catch (error) {
        console.error(error);
    }
}

export const getHeatmapAddedAmenitiesPerAirport = async () => {
    try {
        const response = await fetch('/api/heatmap-added-amenities-per-airport', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error(error);
        }
    }
    catch (error) {
        console.error(error);
    }
}