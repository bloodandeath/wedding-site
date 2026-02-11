# Revised Travel Section Plan

## 1. Top 5 Hotel Recommendations

(Excluding The Club Continental & Azaleana Manor)

All selected hotels are within a short drive (approx. 5-10 mins) of the venue (2143 Astor St). They are primarily clustered around Wells Rd and Park Ave (US-17), offering easy access to I-295.

### 1. Hilton Garden Inn Jacksonville Orange Park

- **Distance:** ~1.8 miles (5 min drive)
- **Address:** 145 Park Ave, Orange Park, FL 32073
- **Vibe:** Modern, reliable, full-service.
- **Features:** Outdoor pool, on-site restaurant (Garden Grille), free WiFi.

### 2. Courtyard by Marriott Jacksonville Orange Park

- **Distance:** ~1.8 miles (5 min drive)
- **Address:** 610 Wells Rd, Orange Park, FL 32073
- **Vibe:** Business-friendly, clean, consistent.
- **Features:** The Bistro (breakfast/dinner/drinks), outdoor pool, fitness center.

### 3. Holiday Inn & Suites Orange Park - Wells Rd

- **Distance:** ~1.9 miles (6 min drive)
- **Address:** 620 Wells Rd, Orange Park, FL 32073
- **Vibe:** Comfortable, good for families.
- **Features:** "Grumpy's" restaurant nearby, outdoor pool, spacious suites available.

### 4. Hampton Inn & Suites Jacksonville / Orange Park

- **Distance:** ~2.0 miles (6 min drive)
- **Address:** 141 Park Ave, Orange Park, FL 32073
- **Vibe:** Casual, free breakfast, high guest ratings.
- **Features:** Free hot breakfast, fitness center, outdoor pool.

### 5. Fairfield Inn & Suites Jacksonville Orange Park

- **Distance:** ~3.7 miles (8-10 min drive)
- **Address:** 450 Eldridge Ave, Orange Park, FL 32073
- **Vibe:** Value-oriented, modern updates.
- **Features:** Free breakfast, pool, easy I-295 access.

---

## 2. Content Analysis & Rewrite

**File:** `src/data/siteContent.js`

### Identified Issues

1.  **Wrong Airport:** Currently lists "CHS (Charleston International Airport)". The venue is in Orange Park, FL, so the airport should be **JAX (Jacksonville International Airport)**.
2.  **Missing Component Support:** As identified previously, the `hotel` object is a single entry. We need an array structure.
3.  **Vague Travel Info:** "Getting there" could be more helpful with driving directions or distance context.

### Proposed Data Structure (`siteContent.js`)

You can drop this snippet directly into `src/data/siteContent.js`, replacing the existing `hotel` and `travel` objects.

```javascript
    // REPLACEMENT BLOCK FOR 'hotel' AND 'travel' SECTIONS

    // Accommodations (Replaces 'hotel' object)
    accommodations: [
        {
            name: "Hilton Garden Inn Orange Park",
            address: "145 Park Ave, Orange Park, FL 32073",
            phone: "(904) 458-1577",
            website: "https://www.hilton.com/en/hotels/jaxobgi-hilton-garden-inn-jacksonville-orange-park/",
            note: "~2 miles from venue. Cooked-to-order breakfast, lunch, and dinner."
        },
        {
            name: "Courtyard by Marriott",
            address: "610 Wells Rd, Orange Park, FL 32073",
            phone: "(904) 854-1500",
            website: "https://www.marriott.com/en-us/hotels/jaxco-courtyard-jacksonville-orange-park/overview/",
            note: "~2 miles from venue. Features The Bistro and an outdoor pool."
        },
        {
            name: "Rodeway Inn Orange Park",
            address: "335 Eldridge Ave, Building A, Orange Park, FL 32073",
            phone: "(904) 458-4299",
            website: "https://www.choicehotels.com/florida/orange-park/rodeway-inn-hotels/flk04",
            note: "Includes free hot breakfast and WiFi."
        },
    ],

    // Travel Info (Updated Airport & Details)
    travel: {
        airport: "JAX (Jacksonville International Airport)", // Corrected from CHS
        distanceNote: "Approx. 30-40 minute drive to Orange Park.",
        parking: "Complimentary on-site parking is available at The Club Continental.",
        rideshare: "Uber and Lyft operate in the area. We recommend scheduling rides in advance if leaving late."
    },
```

## 3. Component Implementation Notes

(For `src/components/TravelSection.vue`)

Since we are moving from `hotel` (object) to `accommodations` (array), the Vue component needs to be updated.

**Design Suggestion:**

- **Layout:** Use a grid or a scrollable list for the 5 hotels. A "3-up" grid (3 cards top row, 2 cards bottom row) would look balanced.
- **Cards:** Each card should show Name, Address, and a "Book / View" button.
- **Venue Note:** Even though the venue isn't in the hotel list (per request), consider keeping a small "Venue" banner at the top of the section: _"The wedding and reception are at The Club Continental. Local accommodation options are listed below."_
