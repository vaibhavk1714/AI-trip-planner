/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type Props = {
	className?: string;
	center?: google.maps.LatLngLiteral;
	destinationHint?: string;
};

export default function TripMap({ className, center, destinationHint }: Props) {
	const mapRef = React.useRef<HTMLDivElement | null>(null);
	const pacContainerRef = React.useRef<HTMLDivElement | null>(null);
	const [map, setMap] = React.useState<google.maps.Map | null>(null);
	const [marker, setMarker] = React.useState<google.maps.marker.AdvancedMarkerElement | null>(
		null
	);

	React.useEffect(() => {
		let destroyed = false;

		const init = async () => {
			const loader = new Loader({
				apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
				version: 'weekly',
			});

			const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
				loader.importLibrary('maps') as Promise<google.maps.MapsLibrary>,
				loader.importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
			]);

			if (destroyed) return;

			const defaultCenter = center ?? { lat: 28.6139, lng: 77.209 }; // New Delhi
			const mapOptions: google.maps.MapOptions = {
				center: defaultCenter,
				zoom: 12,
				disableDefaultUI: true,
			};

			const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
			if (mapId) (mapOptions as any).mapId = mapId;

			const _map = new Map(mapRef.current as HTMLDivElement, mapOptions);
			setMap(_map);

			const [placesLib] = await Promise.all([
				google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>,
			]);

			const pac = new google.maps.places.PlaceAutocompleteElement({
				includedRegionCodes: ['in'], // bias to India
			});
			pac.style.width = '100%';
			pac.className = 'rounded-md border px-3 py-2 text-sm bg-background';
			pac.addEventListener('gmp-select', async (e: any) => {
				const place = e?.placePrediction?.toPlace?.();
				await place?.fetchFields?.({
					fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
				});
				if (!place?.location) return;

				if (place.viewport) _map.fitBounds(place.viewport);
				else _map.setCenter(place.location);

				marker?.map && (marker.map = null);
				const m = new AdvancedMarkerElement({
					map: _map,
					position: place.location,
					title: place.displayName,
				});
				setMarker(m);
			});

			pacContainerRef.current?.appendChild(pac);
			if (destinationHint) {
				await google.maps.importLibrary('geocoding');
				const geocoder = new google.maps.Geocoder();
				geocoder.geocode({ address: destinationHint }, (results, status) => {
					if (status === 'OK' && results?.[0]?.geometry?.location) {
						const loc = results[0].geometry.location;
						_map.setCenter(loc);
						_map.setZoom(13);
						const m = new AdvancedMarkerElement({
							map: _map,
							position: loc,
							title: destinationHint,
						});
						setMarker(m);
					}
				});
			}
		};
		init();
		return () => {
			destroyed = true;
			if (marker) marker.map = null;
		};
	}, [center, destinationHint]);

	return (
		<div className={className}>
			<div className="mb-2" ref={pacContainerRef} />
			<div ref={mapRef} className="h-[420px] w-full rounded-xl border" />
		</div>
	);
}
