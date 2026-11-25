export const civicRoutes = [
  ['/budget-stages', 'FY2027 budget stages'],
  ['/procurement', 'Bids and awards'],
  ['/site-evidence', 'Project site evidence'],
  ['/local-disclosures', 'LGU disclosures'],
  ['/project-timeline', 'Project timeline'],
  ['/lgu-spending', 'LGU spending'],
  ['/fund-releases', 'National fund releases'],
] as const;

export const civicPaths = civicRoutes.map(([path]) => String(path));
