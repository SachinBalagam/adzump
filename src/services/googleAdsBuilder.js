export const buildGoogleAdsPayloads = (customerId, businessName, ads) => {
  const {
    budget,
    locations,
    age_range,
    gender,
    adDetails: { headlines, descriptions },
    keywords,
  } = ads;

  // Convert budget to micros
  const budgetMicros = Math.round(Number(budget) * 1_000_000);

  // Step 1: Campaign Budget
  const campaignBudgetPayload = {
    operations: [
      {
        create: {
          name: `${businessName} Campaign Budget`,
          deliveryMethod: "STANDARD",
          amountMicros: budgetMicros,
          explicitlyShared: false,
        },
      },
    ],
  };

  // Step 2: Campaign
  const campaignPayload = {
    operations: [
      {
        create: {
          name: `${businessName} Campaign`,
          status: "ENABLED",
          campaignBudget: `customers/${customerId}/campaignBudgets/INSERT_CAMPAIGN_BUDGET_ID`,
          advertisingChannelType: "SEARCH",
          maximizeConversions: {},
        },
      },
    ],
  };

  // Step 3: Campaign Locations
  const locationPayload = locations.map((geoTargetConstant) => ({
    operations: [
      {
        create: {
          campaign: `customers/${customerId}/campaigns/INSERT_CAMPAIGN_ID`,
          location: {
            geoTargetConstant,
          },
        },
      },
    ],
  }));

  // Step 4: AdGroup
  const adGroupPayload = {
    operations: [
      {
        create: {
          campaign: `customers/${customerId}/campaigns/INSERT_CAMPAIGN_ID`,
          name: `${businessName} Adgroup`,
          status: "ENABLED",
          type: "SEARCH_STANDARD",
        },
      },
    ],
  };

  // Step 5: AdGroup Criteria (keywords + age ranges + gender)
  const adGroupCriteriaPayload = [];

  // Keywords
  keywords.forEach((kw) => {
    adGroupCriteriaPayload.push({
      operations: [
        {
          create: {
            adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
            status: "ENABLED",
            keyword: {
              text: kw,
              matchType: "BROAD",
            },
          },
        },
      ],
    });
  });

  // Age Range
  const ageMapping = {
    18: "AGERANGE18_24",
    25: "AGERANGE25_34",
    35: "AGERANGE35_44",
    45: "AGERANGE45_54",
    55: "AGERANGE55_64",
    65: "AGERANGE65_UP",
  };

  age_range.forEach((age) => {
    const type = ageMapping[age];
    if (type) {
      adGroupCriteriaPayload.push({
        operations: [
          {
            create: {
              adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
              status: "ENABLED",
              ageRange: { type },
            },
          },
        ],
      });
    }
  });

  // Gender
  const genderMapping = {
    male: "MALE",
    female: "FEMALE",
  };

  gender.forEach((g) => {
    const type = genderMapping[g.toLowerCase()];
    if (type) {
      adGroupCriteriaPayload.push({
        operations: [
          {
            create: {
              adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
              status: "ENABLED",
              gender: { type },
            },
          },
        ],
      });
    }
  });

  // Step 6: Ad (Responsive Search Ad)
  const adPayload = {
    operations: [
      {
        create: {
          adGroup: `customers/${customerId}/adGroups/INSERT_ADGROUP_ID`,
          status: "ENABLED",
          ad: {
            name: `${businessName} Ad`,
            responsiveSearchAd: {
              headlines,
              descriptions,
              path1: "services",
              path2: "offer",
            },
            finalUrls: ["https://example.com"],
            finalMobileUrls: ["https://example.com"],
            trackingUrlTemplate:
              "{lpurl}?device={device}&matchtype={matchtype}",
            urlCustomParameters: [
              { key: "source", value: "google_ads" },
              { key: "campaign", value: businessName.toLowerCase() },
            ],
            finalUrlSuffix:
              "utm_source=google&utm_medium=cpc&utm_campaign=" +
              businessName.toLowerCase(),
          },
        },
      },
    ],
  };

  return {
    campaignBudgetPayload,
    campaignPayload,
    locationPayload,
    adGroupPayload,
    adGroupCriteriaPayload,
    adPayload,
  };
};
