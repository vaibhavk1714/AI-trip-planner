declare global {
	namespace google.maps.places {
		interface PlaceAutocompleteElementOptions {
			/** Up to 15 CLDR region codes */
			includedRegionCodes?: string[];
		}
	}
}
export {};
