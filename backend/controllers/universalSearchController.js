import Item from "../models/item.js";

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};


// ======================================================
// REUSABLE UNIVERSAL SEARCH
// ======================================================

export const searchUniversalItems = async ({
    query = "",
    minPrice = null,
    maxPrice = null,
    maxDistanceKm = null,
    latitude = null,
    longitude = null,
    availability = null,
    category = null,
    subCategory = null,
    foodType = null,
    sort = "relevance",
    state = "All",
    district = "Select"
}) => {

    const cleanQuery = String(query).trim();

    if (!cleanQuery) {
        return [];
    }

    const escapedQuery = cleanQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const itemFilter = {
        $and: [
            {
                $or: [
                    { isMaster: false },
                    { isMaster: { $exists: false } }
                ]
            },
            {
                $or: [
                    {
                        name: {
                            $regex: escapedQuery,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: escapedQuery,
                            $options: "i"
                        }
                    },
                    {
                        category: {
                            $regex: escapedQuery,
                            $options: "i"
                        }
                    },
                    {
                        subCategory: {
                            $regex: escapedQuery,
                            $options: "i"
                        }
                    }
                ]
            }
        ]
    };


// ======================================================
// PRICE
// ======================================================

    if (minPrice !== null && minPrice !== undefined) {
        itemFilter.price = {
            $gte: Number(minPrice)
        };
    }

    if (maxPrice !== null && maxPrice !== undefined) {
        itemFilter.price = {
            ...(itemFilter.price || {}),
            $lte: Number(maxPrice)
        };
    }


// ======================================================
// CATEGORY
// ======================================================

// if (category) {
//     itemFilter.category = {
//         $regex: String(category),
//         $options: "i"
//     };
// }


// ======================================================
// SUB CATEGORY
// ======================================================

    if (subCategory) {
        itemFilter.subCategory = {
            $regex: String(subCategory),
            $options: "i"
        };
    }


// ======================================================
// AVAILABILITY
// ======================================================

    if (availability === true) {
        itemFilter.isAvailable = true;
    }


    let items = await Item.find(itemFilter)
        .populate(
            "ownerId",
            "name ownerName category profileImage phone whatsappNumber state district collegeName latitude longitude address isStoreOpen isApproved foodType averageRating numberOfReviews"
        )
        .lean();


// ======================================================
// REMOVE ITEMS WITHOUT OWNER
// ======================================================

    items = items.filter(
        item => item.ownerId && item.ownerId._id
    );


// ======================================================
// STATE FILTER
// ======================================================

    if (
        state &&
        String(state).trim() !== "" &&
        String(state).trim().toLowerCase() !== "all"
    ) {
        const requestedState = String(state)
            .trim()
            .toLowerCase();

        items = items.filter(item => {
            const ownerState =
                item.ownerId?.state?.trim().toLowerCase() || "";

            return ownerState === requestedState;
        });
    }


// ======================================================
// DISTRICT FILTER
// ======================================================

    if (
        district &&
        String(district).trim() !== "" &&
        String(district).trim().toLowerCase() !== "select" &&
        String(district).trim().toLowerCase() !== "all"
    ) {
        const requestedDistrict = String(district)
            .trim()
            .toLowerCase();

        items = items.filter(item => {
            const ownerDistrict =
                item.ownerId?.district?.trim().toLowerCase() || "";

            return ownerDistrict === requestedDistrict;
        });
    }


// ======================================================
// FOOD TYPE FILTER
// ======================================================

    if (foodType) {

        items = items.filter(item => {

            const ownerFoodType =
                item.ownerId?.foodType;

            if (!ownerFoodType) {
                return false;
            }

            if (foodType === "Both") {
                return ownerFoodType === "Both";
            }

            return (
                ownerFoodType === foodType ||
                ownerFoodType === "Both"
            );

        });

    }


// ======================================================
// BUSINESS CATEGORY FILTER
// ======================================================

    if (category) {
        const requestedCategory = String(category)
            .trim()
            .toLowerCase();

        items = items.filter(item => {
            const ownerCategory =
                item.ownerId?.category?.trim().toLowerCase() || "";

            return ownerCategory === requestedCategory;
        });
    }


// ======================================================
// LOCATION
// ======================================================

    const hasLocation =
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined &&
        Number.isFinite(Number(latitude)) &&
        Number.isFinite(Number(longitude)); 

    console.log("🔥 SEARCH CONTROLLER LOCATION:", {
        latitude,
        longitude,
        hasLocation
    });

    const userLat = Number(latitude);
    const userLng = Number(longitude);

    items = items.map(item => {

        const owner = item.ownerId;

        const ownerLat = Number(owner.latitude);
        const ownerLng = Number(owner.longitude);

        let distanceKm = null;

        console.log("🔥 DISTANCE INITIAL:", distanceKm);

        if (
            hasLocation &&
            Number.isFinite(ownerLat) &&
            Number.isFinite(ownerLng) &&
            ownerLat !== 0 &&
            ownerLng !== 0
        ) {

            console.log("🔥 CALCULATING DISTANCE");

            distanceKm = calculateDistanceKm(
                userLat,
                userLng,
                ownerLat,
                ownerLng
            );

        }

        return {
            ...item,
            distanceKm
        };

    });


// ======================================================
// MAX DISTANCE
// ======================================================

    if (
        maxDistanceKm !== null &&
        maxDistanceKm !== undefined &&
        hasLocation
    ) {

        const maxDistance = Number(maxDistanceKm);

        items = items.filter(item =>
            item.distanceKm !== null &&
            item.distanceKm <= maxDistance
        );

    }


// ======================================================
// SORTING
// ======================================================

    if (sort === "price_asc") {

        items.sort((a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );

    }

    if (sort === "price_desc") {

        items.sort((a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        );

    }

    if (sort === "rating_desc") {

        items.sort((a, b) =>
            Number(b.ownerId?.averageRating || 0) -
            Number(a.ownerId?.averageRating || 0)
        );

    }

    if (sort === "distance_asc") {

        items.sort((a, b) => {

            if (a.distanceKm === null) return 1;

            if (b.distanceKm === null) return -1;

            return a.distanceKm - b.distanceKm;

        });

    }


// ======================================================
// RESULT FORMAT
// ======================================================

    return items.map(item => {

        const owner = item.ownerId;

        return {

            itemId: item._id,

            itemName: item.name,

            price: item.price,

            category: item.category,

            subCategory: item.subCategory,

            description: item.description,

            image: item.image,

            isAvailable: item.isAvailable,

            owner: {

                id: owner._id,

                name:
                    owner.name ||
                    owner.ownerName,

                category: owner.category,

                phone: owner.phone,

                address: owner.address,

                district: owner.district,

                collegeName: owner.collegeName,

                latitude: owner.latitude,

                longitude: owner.longitude,

                isStoreOpen:
                    owner.isStoreOpen,

                isApproved:
                    owner.isApproved,

                foodType:
                    owner.foodType,

                averageRating:
                    owner.averageRating,

                numberOfReviews:
                    owner.numberOfReviews

            },

            distanceKm:
                item.distanceKm !== null
                    ? Number(
                        item.distanceKm.toFixed(2)
                    )
                    : null

        };

    });

};


// ======================================================
// NORMAL UNIVERSAL SEARCH API
// ======================================================

export const universalSearch = async (req, res) => {

    try {

        const {
            query = "",
            minPrice,
            maxPrice,
            maxDistanceKm,
            latitude,
            longitude,
            availability,
            category,
            subCategory,
            sort = "relevance"
        } = req.body || {};


        const results = await searchUniversalItems({

            query,
            minPrice,
            maxPrice,
            maxDistanceKm,
            latitude,
            longitude,
            availability,
            category,
            subCategory,
            sort

        });


        return res.json({

            success: true,

            count: results.length,

            search: {

                query: String(query).trim(),

                minPrice:
                    minPrice ?? null,

                maxPrice:
                    maxPrice ?? null,

                maxDistanceKm:
                    maxDistanceKm ?? null

            },

            results

        });

    } catch (error) {

        console.error(
            "Universal Search Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Universal search failed.",

            error:
                error.message

        });

    }

};