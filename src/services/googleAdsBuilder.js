// export const buildGoogleAdsPayloads = (customerId, businessName, ads) => {
//   const {
//     budget,
//     locations,
//     age_range,
//     gender,
//     adDetails: { headlines, descriptions, finalUrls },
//     keywords,
//   } = ads;

//   // Convert budget to micros
//   const budgetMicros = Math.round(Number(budget) * 1_000_000);

//   // Step 1: Campaign Budget
//   const campaignBudgetPayload = {
//     operations: [
//       {
//         create: {
//           name: `${businessName} Campaign Budget`,
//           deliveryMethod: "STANDARD",
//           amountMicros: budgetMicros,
//           explicitlyShared: false,
//         },
//       },
//     ],
//   };

//   // Step 2: Campaign
//   const campaignPayload = {
//     operations: [
//       {
//         create: {
//           name: `${businessName} Campaign`,
//           status: "ENABLED",
//           campaignBudget: `customers/${customerId}/campaignBudgets/INSERT_CAMPAIGN_BUDGET_ID`,
//           advertisingChannelType: "SEARCH",
//           maximizeConversions: {},
//         },
//       },
//     ],
//   };

//   // Step 3: Campaign Locations
//   const locationPayload = locations.map((geoTargetConstant) => ({
//     operations: [
//       {
//         create: {
//           campaign: `customers/${customerId}/campaigns/INSERT_CAMPAIGN_ID`,
//           location: {
//             geoTargetConstant,
//           },
//         },
//       },
//     ],
//   }));

//   // Step 4: AdGroup
//   const adGroupPayload = {
//     operations: [
//       {
//         create: {
//           campaign: `customers/${customerId}/campaigns/INSERT_CAMPAIGN_ID`,
//           name: `${businessName} Adgroup`,
//           status: "ENABLED",
//           type: "SEARCH_STANDARD",
//         },
//       },
//     ],
//   };

//   // Step 5: AdGroup Criteria (keywords + age ranges + gender)
//   const adGroupCriteriaPayload = [];

//   // Keywords
//   keywords.forEach((kw) => {
//     adGroupCriteriaPayload.push({
//       operations: [
//         {
//           create: {
//             adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
//             status: "ENABLED",
//             keyword: {
//               text: kw,
//               matchType: "BROAD",
//             },
//           },
//         },
//       ],
//     });
//   });

//   // Age Range
//   const ageMapping = {
//     18: "AGERANGE18_24",
//     25: "AGERANGE25_34",
//     35: "AGERANGE35_44",
//     45: "AGERANGE45_54",
//     55: "AGERANGE55_64",
//     65: "AGERANGE65_UP",
//   };

//   age_range.forEach((age) => {
//     const type = ageMapping[age];
//     if (type) {
//       adGroupCriteriaPayload.push({
//         operations: [
//           {
//             create: {
//               adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
//               status: "ENABLED",
//               ageRange: { type },
//             },
//           },
//         ],
//       });
//     }
//   });

//   // Gender
//   const genderMapping = {
//     male: "MALE",
//     female: "FEMALE",
//   };

//   gender.forEach((g) => {
//     const type = genderMapping[g.toLowerCase()];
//     if (type) {
//       adGroupCriteriaPayload.push({
//         operations: [
//           {
//             create: {
//               adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
//               status: "ENABLED",
//               gender: { type },
//             },
//           },
//         ],
//       });
//     }
//   });

//   // Step 6: Ad (Responsive Search Ad)
//   const adPayload = {
//     operations: [
//       {
//         create: {
//           adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
//           status: "ENABLED",
//           ad: {
//             name: `${businessName} Ad`,
//             responsiveSearchAd: {
//               headlines,
//               descriptions,
//               path1: "services",
//               path2: "offer",
//             },
//             finalUrls: ["https://example.com"],
//             finalMobileUrls: ["https://example.com"],
//             trackingUrlTemplate:
//               "{lpurl}?device={device}&matchtype={matchtype}",
//             urlCustomParameters: [
//               { key: "source", value: "google_ads" },
//               { key: "campaign", value: businessName.toLowerCase() },
//             ],
//             finalUrlSuffix:
//               "utm_source=google&utm_medium=cpc&utm_campaign=" +
//               businessName.toLowerCase(),
//           },
//         },
//       },
//     ],
//   };

//   return {
//     campaignBudgetPayload,
//     campaignPayload,
//     locationPayload,
//     adGroupPayload,
//     adGroupCriteriaPayload,
//     adPayload,
//   };
// };

function getUniqueSuffix() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}_${hours}:${minutes}:${seconds}`;
}

export const buildGoogleAdsPayloads = (customerId, businessName, ads) => {
  // Guard rails
  const safeName = (businessName || "Campaign").toString().trim();
  const budgetNumber = Number(ads?.budget ?? 0);
  const amountMicros =
    Number.isFinite(budgetNumber) && budgetNumber > 0
      ? Math.round(budgetNumber * 1_000_000)
      : undefined;

  const locations = Array.isArray(ads?.locations) ? ads.locations : [];
  const ageRange = Array.isArray(ads?.age_range) ? ads.age_range : [];
  const genders = Array.isArray(ads?.gender) ? ads.gender : [];
  const keywords = Array.isArray(ads?.keywords) ? ads.keywords : [];

  const adDetails = ads?.adDetails || {};
  const headlines = Array.isArray(adDetails.headlines)
    ? adDetails.headlines
    : [];
  const descriptions = Array.isArray(adDetails.descriptions)
    ? adDetails.descriptions
    : [];
  const finalUrls = Array.isArray(ads?.finalUrls) ? ads.finalUrls : [];

  // ---------- helpers ----------
  // Map numeric bounds to Google Ads age buckets
  const AGE_BUCKETS = [
    { type: "AGE_RANGE_18_24", min: 18, max: 24 },
    { type: "AGE_RANGE_25_34", min: 25, max: 34 },
    { type: "AGE_RANGE_35_44", min: 35, max: 44 },
    { type: "AGE_RANGE_45_54", min: 45, max: 54 },
    { type: "AGE_RANGE_55_64", min: 55, max: 64 },
    { type: "AGE_RANGE_65_UP", min: 65, max: Infinity },
  ];

  const pickAgeTypes = (range) => {
    if (range.length !== 2) return [];
    const [min, max] = range.map((n) => Number(n));
    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return [];
    return AGE_BUCKETS.filter((b) => b.min <= max && b.max >= min) // overlaps
      .map((b) => b.type);
  };

  const genderType = (g) => {
    const m = String(g || "").toLowerCase();
    if (m === "male") return "MALE";
    if (m === "female") return "FEMALE";
    return null;
  };

  // ---------- 1) Campaign Budget ----------
  // Only include amountMicros if we have a valid budget
  const campaignBudgetPayload = {
    operations: [
      {
        create: {
          name: `${safeName} Campaign budget ${getUniqueSuffix()}`,
          deliveryMethod: "STANDARD",
          ...(amountMicros !== undefined ? { amountMicros } : {}),
          explicitlyShared: false,
        },
      },
    ],
  };

  // ---------- 2) Campaign ----------
  // Note: replace REPLACE_WITH_BUDGET_ID after you post the budget and get back its resource id
  const campaignPayload = {
    operations: [
      {
        create: {
          name: `${safeName} Campaign ${getUniqueSuffix()}`,
          status: "ENABLED",
          //   campaignBudget: `customers/${customerId}/campaignBudgets/REPLACE_WITH_BUDGET_ID`,
          advertisingChannelType: "SEARCH",
          maximizeConversions: {},
        },
      },
    ],
  };

  // ---------- 3) Campaign Criteria (Locations) ----------
  // Builds a single mutate body with N operations (one per location)
  const campaignCriteriaPayload = {
    operations: locations
      .filter((loc) => loc && typeof loc.resourceName === "string")
      .map((loc) => ({
        create: {
          location: { geoTargetConstant: loc.resourceName },
        },
      })),
  };

  // ---------- 4) Ad Group ----------
  const adGroupPayload = {
    operations: [
      {
        create: {
          //   campaign: `customers/${customerId}/campaigns/REPLACE_WITH_CAMPAIGN_ID`,
          name: `${safeName} Adgroup ${getUniqueSuffix()}`,
          status: "ENABLED",
          type: "SEARCH_STANDARD",
        },
      },
    ],
  };

  // ---------- 5) Ad Group Criteria ----------
  const ageTypes = pickAgeTypes(ageRange);

  const adGroupCriteriaOps = [];

  // Keywords (BROAD by default)
  keywords
    .filter((k) => typeof k === "string" && k.trim().length > 0)
    .forEach((k) => {
      adGroupCriteriaOps.push({
        create: {
          //   adGroup: `customers/${customerId}/adGroups/REPLACE_WITH_ADGROUP_ID`,
          status: "ENABLED",
          keyword: {
            text: k.trim(),
            matchType: "BROAD",
          },
        },
      });
    });

  // Age ranges (include only buckets that overlap the [min,max])
  ageTypes.forEach((type) => {
    adGroupCriteriaOps.push({
      create: {
        // adGroup: `customers/${customerId}/adGroups/REPLACE_WITH_ADGROUP_ID`,
        status: "ENABLED",
        ageRange: { type },
      },
    });
  });

  // Genders
  genders.forEach((g) => {
    const type = genderType(g);
    if (type) {
      adGroupCriteriaOps.push({
        create: {
          //   adGroup: `customers/${customerId}/adGroups/REPLACE_WITH_ADGROUP_ID`,
          status: "ENABLED",
          gender: { type },
        },
      });
    }
  });

  const adGroupCriteriaPayload = {
    operations: adGroupCriteriaOps,
  };

  // ---------- 6) Ad (Responsive Search Ad) ----------
  // Only include keys you actually provided (headlines, descriptions, finalUrls)
  const adObj = {
    name: `${safeName} Ad ${getUniqueSuffix()}`,
    responsiveSearchAd: {},
  };

  if (headlines.length) {
    adObj.responsiveSearchAd.headlines = headlines;
  }
  if (descriptions.length) {
    adObj.responsiveSearchAd.descriptions = descriptions;
  }
  if (finalUrls.length) {
    adObj.finalUrls = finalUrls;
  }

  // If nothing inside responsiveSearchAd, drop it (avoid empty object)
  if (
    !adObj.responsiveSearchAd.headlines &&
    !adObj.responsiveSearchAd.descriptions
  ) {
    delete adObj.responsiveSearchAd;
  }

  const adPayload = {
    operations: [
      {
        create: {
          //   adGroup: `customers/${customerId}/adGroups/REPLACE_WITH_ADGROUP_ID`,
          status: "ENABLED",
          ad: adObj,
        },
      },
    ],
  };

  return {
    campaignBudgetPayload,
    campaignPayload,
    campaignCriteriaPayload,
    adGroupPayload,
    adGroupCriteriaPayload,
    adPayload,
  };
};
