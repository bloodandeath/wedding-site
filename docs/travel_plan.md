# Travel Section Content & Design Plan

## 1. Travel Information Content

Based on the wedding location at **The Club Continental** in Orange Park, FL.

### Airport

- **Primary Airport:** Jacksonville International Airport (JAX)
- **Distance:** Approximately 30-40 minutes drive to the venue.
- **Notes:** This is the main commercial airport serving the area. Uber and Lyft are readily available for transport from the airport to Orange Park.

### Ground Transportation

- **Rental Car:** Recommended for guests planning to explore the surrounding Jacksonville area or St. Augustine.
- **Rideshare:** Uber and Lyft are reliable options in Orange Park.
- **Parking:** The venue provides on-site parking for guests.

### Accommodations

Since the venue is a historic club/resort, it is the primary recommendation. We also suggest nearby alternatives for variety.

#### Option 1: The Club Continental (On-site)

- **Status:** The Wedding Venue.
- **Type:** Historic Bed & Breakfast / Resort.
- **Features:** 22 guest rooms, waterfront views of the St. Johns River, 3 pools, complimentary breakfast.
- **Important Note:** As a historic property, there are no elevators. Request a ground-floor room if mobility is a concern.
- **Address:** 2143 Astor St, Orange Park, FL 32073.
- **Booking:** Guests should call directly to book under the "Christensen/Breton" block or visit their website.

#### Option 2: The Azaleana Manor

- **Location:** Immediate walking distance (5 mins).
- **Description:** A luxury 5-star property, often considered a sister property to the Club Continental. Great for those wanting high-end amenities close by.
- **Address:** 12 Kingsley Ave, Orange Park, FL 32073.

#### Option 3: Courtyard by Marriott Orange Park

- **Location:** Short drive (~2 miles away).
- **Description:** Standard reliable hotel chain amenities.
- **Address:** 610 Wells Rd, Orange Park, FL 32073.

---

## 2. Component Design Adjustments (`TravelSection.vue`)

The current component implementation (`src/components/TravelSection.vue`) supports a single `hotel` object. To accommodate multiple accommodation options, we need to refactor the data structure and template.

### Data Structure Change

The `siteContent.js` file currently has a single `hotel` object. We should change this to an array of objects to support multiple recommendations.

**Current:**

```javascript
hotel: {
    name: "Sage Hotel",
    address: "...",
    ...
}
```

**Proposed:**

```javascript
accommodations: [
  {
    name: "The Club Continental",
    isVenue: true, // New property to highlight this option
    address: "2143 Astor St, Orange Park, FL 32073",
    description: "Stay right at the venue! Historic riverfront rooms.",
    bookingUrl: "https://clubcontinental.com/accommodations/",
  },
  {
    name: "Courtyard by Marriott",
    address: "610 Wells Rd, Orange Park, FL 32073",
    bookingUrl: "https://www.marriott.com/...",
  },
];
```

### Template Updates (`TravelSection.vue`)

1.  **Loop through Accommodations:** Replace the single hotel card with a loop `v-for="hotel in accommodations"`.
2.  **Layout:** Stack the hotels vertically in the left column, or use a mini-grid if space permits (though vertical stack is safer for mobile).
3.  **Venue Highlight:** Use the `isVenue` property to add a visual badge (e.g., "Wedding Venue" or "Recommended") to the Club Continental card.
4.  **Content Updates:**
    - Update the "Getting there" list to include JAX airport details.
    - Add a line about "Rental Car Recommended" if appropriate.
