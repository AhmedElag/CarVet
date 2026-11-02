export const articles = [
  {
    slug: "cheap-german-cars-expensive",
    date: "May 5, 2025",
    title: "Cheap German cars are usually expensive cars in disguise",
    excerpt:
      "A low purchase price can hide expensive maintenance, neglected repairs, and ownership risk.",
    category: "Buyer Advice",
    readTime: "5 min read",
    content: [
      "A cheap German car can look like a dream deal at first. You see a BMW, Mercedes, Audi, or Volkswagen listed for the same price as a basic economy car and it feels like you found something special.",
      "The problem is that the purchase price is only one part of the real cost. German cars often become cheap because the next owner is about to inherit the maintenance bill. Oil leaks, suspension work, cooling system failures, electronic problems, and neglected service history can quickly turn a bargain into a financial headache.",
      "This does not mean every used German car is a bad buy. Some are excellent when they have strong service records, clean ownership history, and the right inspection results. The key is knowing what the common failure points are before you buy.",
      "Before buying, check for service records, oil leaks, warning lights, rough idle, coolant system repairs, transmission behavior, tire wear, and evidence of previous accident repairs. A pre-purchase inspection is especially important on higher-mileage luxury vehicles.",
      "CarVet’s rule is simple: if the car is cheap, ask why. Sometimes it is a good deal. Sometimes it is cheap because the expensive part has not failed yet.",
    ],
  },
  {
    slug: "mileage-is-not-the-entire-story",
    date: "Nov 5, 2025",
    title: "Mileage is not the entire story",
    excerpt:
      "Two cars with the same mileage can have completely different risk levels depending on history and care.",
    category: "Inspection Tips",
    readTime: "4 min read",
    content: [
      "Mileage matters, but it does not tell the whole story. A car with 180,000 km and complete service records can sometimes be a safer buy than a car with 95,000 km and no maintenance history.",
      "Buyers often focus too much on the odometer and ignore how the vehicle was used. Highway mileage, regular oil changes, garage storage, and careful ownership can make a major difference. On the other hand, short trips, missed maintenance, accident repairs, and poor winter care can make a lower-mileage car risky.",
      "You should look at mileage together with service records, ownership history, accident history, tire wear, brake condition, rust, and how the car feels during a cold start and test drive.",
      "Mileage becomes more important when it lines up with known failure intervals. For example, some engines commonly need gaskets, cooling system parts, timing components, or suspension work around certain mileage ranges.",
      "The better question is not just how many kilometres are on the car. The better question is whether the maintenance matches the mileage.",
    ],
  },
  {
    slug: "dealer-certified-not-risk-free",
    date: "Feb 25, 2026",
    title: "Dealer certified does not mean risk-free",
    excerpt:
      "Certified vehicles can still have hidden issues, weak history, or upcoming maintenance costs.",
    category: "Dealer Buying",
    readTime: "6 min read",
    content: [
      "A dealer-certified vehicle can give buyers confidence, but it should not replace independent judgment. Certification usually means the car passed a checklist, but it does not always mean the vehicle is problem-free.",
      "A certified car may still have accident history, cosmetic repairs, upcoming maintenance, worn tires, weak brakes, or hidden issues that were not obvious during the dealer inspection.",
      "Buyers should ask what the certification actually includes. Does it include powertrain warranty? Was the inspection completed by the dealer or a third party? Are wear items covered? Is there proof of the inspection checklist?",
      "You should still review the vehicle history report, service records, ownership history, accident claims, and recall status. If the vehicle is expensive or out of warranty, an independent pre-purchase inspection is still a smart move.",
      "Certification is a positive signal, but it is not a guarantee. Treat it as one piece of the decision, not the whole decision.",
    ],
  },
];

export type Article = (typeof articles)[number];