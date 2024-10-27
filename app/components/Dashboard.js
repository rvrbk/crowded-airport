"use client";

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getPeriodChartAddedAmenities, getTopChartAddedAmenities } from '../lib/dashboard';
import { subDays, addDays, startOfDay, format } from 'date-fns';

const Dashboard = () => {
    const [periodAddedAmenitiesCategories, setPeriodAddedAmenitiesCategories] = useState([]);
    const [periodAddedAmenitiesCurrentPeriodSeries, setPeriodAddedAmenitiesCurrentPeriodSeries] = useState([]);
    const [periodAddedAmenitiesPreviousPeriodSeries, setPeriodAddedAmenitiesPreviousPeriodSeries] = useState([]);

    const [topAddedAmenitiesLabels, setTopAddedAmenitiesLabels] = useState([]);
    const [topAddedAmenitiesSeries, setTopAddedAmenitiesSeries] = useState([]);

    // Transform data for period amenities chart
    useEffect(() => {
        const fetchAddedAmenities = async () => {
            let amenities = [];
            let currentPeriodSeries = [];
            let previousPeriodSeries = [];
            let categories = [];

            let dates = {
                currentPeriod: [],
                previousPeriod: []
            };

            const date = subDays(startOfDay(new Date()), 13);
            
            dates.previousPeriod.push(date);

            for (let index = 1; index < 14; index++) {
                if (index < 7) {
                    dates.previousPeriod.push(addDays(date, index));
                }
                else {
                    dates.currentPeriod.push(addDays(date, index));
                }
            }

            try {
                amenities = await getPeriodChartAddedAmenities();
            } catch (error) {
                console.error("Error", error);
            }

            dates.previousPeriod.forEach((date) => {
                const formattedDate = format(date, 'MMM d');
            
                if (previousPeriodSeries[formattedDate] === undefined) {
                    previousPeriodSeries[formattedDate] = 0;
                }
            
                amenities.currentPeriod.forEach((amenity) => {
                    const amenityDate = format(new Date(amenity.createdAt), 'MMM d');
                    
                    if (amenityDate === formattedDate) {
                        previousPeriodSeries[formattedDate] += 1;
                    }
                });
            });

            dates.currentPeriod.forEach((date) => {
                const formattedDate = format(date, 'MMM d');
            
                categories.push(formattedDate);

                if (currentPeriodSeries[formattedDate] === undefined) {
                    currentPeriodSeries[formattedDate] = 0;
                }
            
                amenities.currentPeriod.forEach((amenity) => {
                    const amenityDate = format(new Date(amenity.createdAt), 'MMM d');
                    
                    if (amenityDate === formattedDate) {
                        currentPeriodSeries[formattedDate] += 1;
                    }
                });
            });

            setPeriodAddedAmenitiesCurrentPeriodSeries(Object.values(currentPeriodSeries));
            setPeriodAddedAmenitiesPreviousPeriodSeries(Object.values(previousPeriodSeries));
            setPeriodAddedAmenitiesCategories(categories);
        };

        fetchAddedAmenities();
    }, []);

    // Tranform data for top amenities chart
    useEffect(() => {
        const fetchAddedAmenities = async () => {
            let amenities = [];
            let series = [];
            let labels = [];

            try {
                amenities = await getTopChartAddedAmenities();
            } catch (error) {
                console.error("Error", error);
            }

            amenities.forEach((amenity) => {
                console.log(amenity._count.thing);
                labels.push(amenity.thing);
                series.push(amenity._count.thing);
            });

            setTopAddedAmenitiesSeries(series);
            setTopAddedAmenitiesLabels(labels);
        };

        fetchAddedAmenities();
    }, []);

    // Chart options and data
    const lineOptions = {
        title: {
            text: 'Amenities added last 7 days',
        },
        chart: { type: 'line' },
        xaxis: { categories: periodAddedAmenitiesCategories },
        stroke: { curve: 'smooth' }
    };
    
    const lineSeries = [{ 
        name: 'Last 7 Days', 
        data: periodAddedAmenitiesCurrentPeriodSeries 
    }, { 
        name: 'Previous 7 Days', 
        data: periodAddedAmenitiesPreviousPeriodSeries 
    }];

    const pieOptions = { 
        title: { text: 'Top 5 amenities added' },
        chart: { type: 'pie' }, 
        labels: topAddedAmenitiesLabels 
    };
    
    const pieSeries = topAddedAmenitiesSeries;

    const heatmapOptions = { 
        title: { text: 'Heatmap of Amenities Added by Airport' },
        chart: { type: 'heatmap' },
        plotOptions: {
            heatmap: {
                enableShades: true,
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [
                        { from: 0, to: 25, name: 'Low', color: '#00A100' },
                        { from: 26, to: 50, name: 'Medium', color: '#128FD9' },
                        { from: 51, to: 75, name: 'High', color: '#FFB200' },
                        { from: 76, to: 100, name: 'Extreme', color: '#FF0000' }
                    ]
                }
            }
        },
        dataLabels: { enabled: false }
    };
    const heatmapSeries = [{
        name: 'LAX',
        data: [
            { x: 'Toilet', y: 20 },
            { x: 'Starbucks', y: 40 },
        ]
    }, {
        name: 'AMS',
        data: [
            { x: 'Toilet', y: 20 },
            { x: 'Starbucks', y: 40 },
        ]
    }];

    const barOptions = {
        title: { text: 'Top 5 navigation clicks' },
        chart: { type: 'bar' },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
        xaxis: { categories: ['Item A', 'Item B', 'Item C', 'Item D', 'Item E'] }
    };
    const barSeries = [{ name: 'Navigate Clicks', data: [200, 250, 150, 300, 100] }];

    return (
        <div className="p-10 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-white p-4 rounded-lg shadow">
                    <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={300} />
                </div>
                <div className="card bg-white p-4 rounded-lg shadow">
                    <ReactApexChart options={barOptions} series={barSeries} type="bar" height={300} />
                </div>
                <div className="card bg-white p-4 rounded-lg shadow">
                    <ReactApexChart options={pieOptions} series={pieSeries} type="pie" height={300} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="card bg-white p-4 rounded-lg shadow">
                    <ReactApexChart options={heatmapOptions} series={heatmapSeries} type="heatmap" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
